import os
import json
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, optimizers, losses, callbacks
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_curve,
    auc,
    confusion_matrix,
    classification_report
)

from .config import (
    MODELS_DIR,
    EXPERIMENTS_DIR,
    OUTPUTS_DIR,
    INPUT_DIM,
    HIDDEN_LAYERS,
    OUTPUT_DIM,
    DEFAULT_LEARNING_RATE,
    DEFAULT_EPOCHS,
    DEFAULT_BATCH_SIZE
)
from .schemas import (
    TrainingResponse,
    TrainingHistoryPoint,
    EvaluationResponse,
    ArchitectureResponse,
    LayerDetail,
    PredictResponse,
    ExperimentInfo
)
from .data_service import data_service

logger = logging.getLogger("neural_studio.model")

# Set random seeds for reproducibility
def set_seeds(seed: int = 42):
    np.random.seed(seed)
    tf.random.set_seed(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)

set_seeds(42)

class ModelService:
    def __init__(self):
        self.model: Optional[keras.Model] = None
        self.latest_history: List[Dict[str, float]] = []
        self.latest_metrics: Dict[str, Any] = {}
        self.current_experiment_id: Optional[str] = None
        self.is_training: bool = False
        self.training_progress: float = 0.0
        self.current_epoch: int = 0
        self.total_epochs: int = 0
        self.experiments_file = EXPERIMENTS_DIR / "experiments_registry.json"
        self._init_experiments_file()

    def _init_experiments_file(self):
        if not self.experiments_file.exists():
            with open(self.experiments_file, "w") as f:
                json.dump([], f, indent=2)

    def build_model(self, learning_rate: float = DEFAULT_LEARNING_RATE) -> keras.Model:
        set_seeds(42)
        model = keras.Sequential([
            layers.Input(shape=(INPUT_DIM,), name="input_layer"),
            layers.Dense(HIDDEN_LAYERS[0], activation="relu", name="hidden_layer_1"),
            layers.Dense(HIDDEN_LAYERS[1], activation="relu", name="hidden_layer_2"),
            layers.Dense(HIDDEN_LAYERS[2], activation="relu", name="hidden_layer_3"),
            layers.Dense(OUTPUT_DIM, activation="sigmoid", name="output_layer")
        ], name="NeuralNetworkIntelligenceStudio_ANN")

        optimizer = optimizers.Adam(learning_rate=learning_rate)
        model.compile(
            optimizer=optimizer,
            loss="binary_crossentropy",
            metrics=["accuracy"]
        )
        return model

    def get_architecture(self) -> ArchitectureResponse:
        if self.model is None:
            self.model = self.build_model()

        layer_details: List[LayerDetail] = []
        # Input layer info
        layer_details.append(LayerDetail(
            name="input_layer",
            layer_type="Input",
            neurons=INPUT_DIM,
            activation="None (Raw Features X1, X2)",
            params=0,
            shape=[None, INPUT_DIM]
        ))

        for layer in self.model.layers:
            act = layer.activation.__name__ if hasattr(layer, "activation") and layer.activation else "linear"
            units = getattr(layer, "units", 0)
            shape = [None, units] if units else [None, INPUT_DIM]
            layer_details.append(LayerDetail(
                name=layer.name,
                layer_type=layer.__class__.__name__,
                neurons=units,
                activation=act.upper() if act else "LINEAR",
                params=int(layer.count_params()),
                shape=shape
            ))

        total_params = int(self.model.count_params())
        return ArchitectureResponse(
            layers=layer_details,
            total_params=total_params,
            trainable_params=total_params,
            optimizer="Adam",
            loss_function="Binary Crossentropy",
            metrics=["Accuracy"],
            input_shape=[INPUT_DIM],
            output_shape=[OUTPUT_DIM]
        )

    def train_model(
        self,
        epochs: int = DEFAULT_EPOCHS,
        learning_rate: float = DEFAULT_LEARNING_RATE,
        batch_size: int = DEFAULT_BATCH_SIZE,
        early_stopping: bool = True,
        patience: int = 10,
        noise: float = 0.20,
        n_samples: int = 2000,
        random_state: int = 42
    ) -> TrainingResponse:
        self.is_training = True
        self.current_epoch = 0
        self.total_epochs = epochs
        self.training_progress = 0.0

        start_time = time.time()
        experiment_id = f"EXP_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.current_experiment_id = experiment_id

        # Generate or align dataset
        data_service.generate_dataset(
            n_samples=n_samples, noise=noise, random_state=random_state
        )
        X_train, X_test, y_train, y_test = data_service.ensure_data()

        # Build fresh model
        self.model = self.build_model(learning_rate=learning_rate)

        # Custom progress callback
        history_points: List[TrainingHistoryPoint] = []

        class ProgressCallback(callbacks.Callback):
            def __init__(outer_self):
                super().__init__()

            def on_epoch_end(outer_self, epoch, logs=None):
                logs = logs or {}
                self.current_epoch = epoch + 1
                self.training_progress = round((self.current_epoch / epochs) * 100, 1)
                point = TrainingHistoryPoint(
                    epoch=epoch + 1,
                    loss=round(float(logs.get("loss", 0.0)), 4),
                    val_loss=round(float(logs.get("val_loss", 0.0)), 4),
                    accuracy=round(float(logs.get("accuracy", 0.0)), 4),
                    val_accuracy=round(float(logs.get("val_accuracy", 0.0)), 4)
                )
                history_points.append(point)

        cb_list = [ProgressCallback()]
        stopped_early = False

        if early_stopping:
            es = callbacks.EarlyStopping(
                monitor="val_loss",
                patience=patience,
                restore_best_weights=True,
                verbose=0
            )
            cb_list.append(es)

        fit_history = self.model.fit(
            X_train,
            y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_data=(X_test, y_test),
            callbacks=cb_list,
            verbose=0
        )

        duration = round(time.time() - start_time, 2)
        actual_epochs = len(history_points)
        stopped_early = actual_epochs < epochs

        self.latest_history = [p.model_dump() for p in history_points]

        # Best metrics
        best_val_loss = min(p.val_loss for p in history_points) if history_points else 0.0
        best_val_acc = max(p.val_accuracy for p in history_points) if history_points else 0.0

        # Save model weights and full model
        model_save_path = MODELS_DIR / "ann_moons_model.keras"
        self.model.save(model_save_path)

        # Save checkpoint with experiment ID
        checkpoint_path = MODELS_DIR / f"checkpoint_{experiment_id}.keras"
        self.model.save(checkpoint_path)

        # Perform evaluation on test set
        eval_metrics = self.evaluate(X_test, y_test)

        # Record experiment
        exp_record = {
            "id": experiment_id,
            "timestamp": datetime.now().isoformat(),
            "epochs": actual_epochs,
            "max_epochs": epochs,
            "learning_rate": learning_rate,
            "batch_size": batch_size,
            "noise": noise,
            "samples": n_samples,
            "stopped_early": stopped_early,
            "best_val_loss": best_val_loss,
            "best_val_accuracy": best_val_acc,
            "accuracy": eval_metrics.accuracy,
            "precision": eval_metrics.precision,
            "recall": eval_metrics.recall,
            "f1_score": eval_metrics.f1_score,
            "auc_roc": eval_metrics.auc_roc,
            "duration_seconds": duration,
            "model_path": str(model_save_path),
            "status": "Completed"
        }
        self._save_experiment(exp_record)

        self.is_training = False
        self.training_progress = 100.0

        return TrainingResponse(
            experiment_id=experiment_id,
            status="Completed",
            epochs_trained=actual_epochs,
            best_val_loss=best_val_loss,
            best_val_accuracy=best_val_acc,
            stopped_early=stopped_early,
            history=history_points,
            duration_seconds=duration,
            message=f"Model successfully trained in {actual_epochs} epochs ({duration}s)."
        )

    def _save_experiment(self, exp_record: Dict[str, Any]):
        try:
            records = []
            if self.experiments_file.exists():
                with open(self.experiments_file, "r") as f:
                    records = json.load(f)
            records.insert(0, exp_record)
            with open(self.experiments_file, "w") as f:
                json.dump(records[:30], f, indent=2) # retain last 30 experiments
        except Exception as e:
            logger.error(f"Failed to record experiment: {e}")

    def list_experiments(self) -> List[Dict[str, Any]]:
        try:
            if self.experiments_file.exists():
                with open(self.experiments_file, "r") as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error loading experiments: {e}")
        return []

    def evaluate(self, X_test: Optional[np.ndarray] = None, y_test: Optional[np.ndarray] = None) -> EvaluationResponse:
        if self.model is None:
            # Check if saved model exists
            saved_model_path = MODELS_DIR / "ann_moons_model.keras"
            if saved_model_path.exists():
                self.model = keras.models.load_model(saved_model_path)
            else:
                self.train_model(epochs=30)

        if X_test is None or y_test is None:
            _, X_test, _, y_test = data_service.ensure_data()

        # Predictions
        y_probs = self.model.predict(X_test, verbose=0).flatten()
        y_preds = (y_probs >= 0.5).astype(int)

        acc = float(accuracy_score(y_test, y_preds))
        prec = float(precision_score(y_test, y_preds, zero_division=0))
        rec = float(recall_score(y_test, y_preds, zero_division=0))
        f1 = float(f1_score(y_test, y_preds, zero_division=0))

        # ROC & AUC
        fpr, tpr, thresholds = roc_curve(y_test, y_probs)
        roc_auc = float(auc(fpr, tpr))

        # Confusion Matrix
        cm = confusion_matrix(y_test, y_preds).tolist()

        # Classification Report
        clf_rep = classification_report(y_test, y_preds, output_dict=True, zero_division=0)

        # Decision Boundary Grid Generation
        x1_min, x1_max = float(X_test[:, 0].min() - 0.5), float(X_test[:, 0].max() + 0.5)
        x2_min, x2_max = float(X_test[:, 1].min() - 0.5), float(X_test[:, 1].max() + 0.5)

        # 50x50 grid for fast and smooth contour rendering
        grid_resolution = 50
        xx = np.linspace(x1_min, x1_max, grid_resolution)
        yy = np.linspace(x2_min, x2_max, grid_resolution)
        grid_x, grid_y = np.meshgrid(xx, yy)

        flat_grid = np.c_[grid_x.ravel(), grid_y.ravel()]
        grid_preds = self.model.predict(flat_grid, verbose=0).flatten()
        grid_z = grid_preds.reshape(grid_x.shape).tolist()

        # Test points sample for overlay
        test_points = [
            {
                "x1": round(float(X_test[i, 0]), 4),
                "x2": round(float(X_test[i, 1]), 4),
                "true_label": int(y_test[i]),
                "pred_label": int(y_preds[i]),
                "prob": round(float(y_probs[i]), 4),
                "correct": bool(y_test[i] == y_preds[i])
            }
            for i in range(min(250, len(X_test)))
        ]

        # Export evaluation report to outputs directory
        report_data = {
            "evaluated_at": datetime.now().isoformat(),
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "auc_roc": round(roc_auc, 4),
            "confusion_matrix": cm,
            "classification_report": clf_rep,
            "test_sample_size": len(X_test)
        }
        report_file = OUTPUTS_DIR / "latest_evaluation_report.json"
        with open(report_file, "w") as f:
            json.dump(report_data, f, indent=2)

        return EvaluationResponse(
            accuracy=round(acc, 4),
            precision=round(prec, 4),
            recall=round(rec, 4),
            f1_score=round(f1, 4),
            auc_roc=round(roc_auc, 4),
            confusion_matrix=cm,
            classification_report=clf_rep,
            roc_curve={
                "fpr": [round(float(v), 4) for v in fpr],
                "tpr": [round(float(v), 4) for v in tpr],
                "thresholds": [round(float(v), 4) for v in thresholds]
            },
            decision_boundary={
                "x_vals": [round(float(v), 4) for v in xx],
                "y_vals": [round(float(v), 4) for v in yy],
                "grid_z": [[round(float(val), 4) for val in row] for row in grid_z],
                "x_min": round(x1_min, 4),
                "x_max": round(x1_max, 4),
                "y_min": round(x2_min, 4),
                "y_max": round(x2_max, 4)
            },
            test_points=test_points,
            metrics_summary={
                "Accuracy": round(acc, 4),
                "Precision": round(prec, 4),
                "Recall": round(rec, 4),
                "F1 Score": round(f1, 4),
                "ROC AUC": round(roc_auc, 4)
            }
        )

    def predict_point(self, x1: float, x2: float) -> PredictResponse:
        if self.model is None:
            saved_model_path = MODELS_DIR / "ann_moons_model.keras"
            if saved_model_path.exists():
                self.model = keras.models.load_model(saved_model_path)
            else:
                self.train_model(epochs=30)

        input_arr = np.array([[x1, x2]], dtype=np.float32)
        prob = float(self.model.predict(input_arr, verbose=0)[0][0])
        pred_class = 1 if prob >= 0.5 else 0
        prob_c1 = prob
        prob_c0 = 1.0 - prob
        confidence = abs(prob - 0.5) * 2.0 # 0.0 at decision boundary, 1.0 at maximum certainty
        dist_to_boundary = abs(prob - 0.5)

        return PredictResponse(
            x1=round(x1, 4),
            x2=round(x2, 4),
            raw_probability=round(prob, 4),
            probability_class_1=round(prob_c1, 4),
            probability_class_0=round(prob_c0, 4),
            predicted_class=pred_class,
            confidence=round(confidence * 100, 2),
            label_text=f"Class {pred_class} ({'Moon 1 / Outer Crescent' if pred_class == 1 else 'Moon 0 / Inner Crescent'})",
            distance_to_boundary=round(dist_to_boundary, 4),
            status="Success"
        )

model_service = ModelService()
