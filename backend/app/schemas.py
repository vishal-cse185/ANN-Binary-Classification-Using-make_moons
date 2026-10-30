from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class DatasetGenerateRequest(BaseModel):
    n_samples: int = Field(default=2000, ge=100, le=10000, description="Total number of samples")
    noise: float = Field(default=0.20, ge=0.01, le=1.0, description="Standard deviation of Gaussian noise")
    random_state: int = Field(default=42, description="Random seed for reproducibility")
    test_size: float = Field(default=0.25, ge=0.1, le=0.5, description="Proportion of the dataset to include in the test split")

class DatasetSample(BaseModel):
    id: int
    x1: float
    x2: float
    label: int
    split: str

class DatasetFeatureStats(BaseModel):
    mean: float
    std: float
    min: float
    max: float
    q25: float
    median: float
    q75: float

class DatasetResponse(BaseModel):
    total_samples: int
    n_train: int
    n_test: int
    noise: float
    class_0_count: int
    class_1_count: int
    class_0_percentage: float
    class_1_percentage: float
    feature_stats: Dict[str, DatasetFeatureStats]
    preview: List[DatasetSample]
    scatter_sample: List[DatasetSample]

class ModelTrainRequest(BaseModel):
    epochs: int = Field(default=60, ge=5, le=300)
    learning_rate: float = Field(default=0.01, ge=0.0001, le=0.5)
    batch_size: int = Field(default=32, ge=8, le=256)
    early_stopping: bool = Field(default=True)
    patience: int = Field(default=10, ge=2, le=50)
    noise: float = Field(default=0.20, ge=0.01, le=1.0)
    n_samples: int = Field(default=2000, ge=100, le=10000)
    random_state: int = Field(default=42)

class TrainingHistoryPoint(BaseModel):
    epoch: int
    loss: float
    val_loss: float
    accuracy: float
    val_accuracy: float

class TrainingResponse(BaseModel):
    experiment_id: str
    status: str
    epochs_trained: int
    best_val_loss: float
    best_val_accuracy: float
    stopped_early: bool
    history: List[TrainingHistoryPoint]
    duration_seconds: float
    message: str

class LayerDetail(BaseModel):
    name: str
    layer_type: str
    neurons: int
    activation: str
    params: int
    shape: List[Optional[int]]

class ArchitectureResponse(BaseModel):
    layers: List[LayerDetail]
    total_params: int
    trainable_params: int
    optimizer: str
    loss_function: str
    metrics: List[str]
    input_shape: List[int]
    output_shape: List[int]

class ClassificationClassMetrics(BaseModel):
    precision: float
    recall: float
    f1_score: float
    support: int

class EvaluationResponse(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    auc_roc: float
    confusion_matrix: List[List[int]]
    classification_report: Dict[str, Any]
    roc_curve: Dict[str, List[float]] # fpr, tpr, thresholds
    decision_boundary: Dict[str, Any] # xx, yy, grid_z, x_range, y_range
    test_points: List[Dict[str, Any]]
    metrics_summary: Dict[str, float]

class PredictRequest(BaseModel):
    x1: float = Field(..., description="Feature X1 coordinate")
    x2: float = Field(..., description="Feature X2 coordinate")

class PredictResponse(BaseModel):
    x1: float
    x2: float
    raw_probability: float
    probability_class_1: float
    probability_class_0: float
    predicted_class: int
    confidence: float
    label_text: str
    distance_to_boundary: float
    status: str

class LayerActivationTrace(BaseModel):
    layer_index: int
    layer_name: str
    num_neurons: int
    activation_type: str
    pre_activations: List[float] # z = Wx + b
    post_activations: List[float] # a = activation(z)

class ExplainResponse(BaseModel):
    input_features: List[float]
    predicted_class: int
    probability: float
    layer_traces: List[LayerActivationTrace]
    decision_rational: str
    mathematical_breakdown: Dict[str, Any]
    concepts_summary: Dict[str, str]

class ExperimentInfo(BaseModel):
    id: str
    timestamp: str
    epochs: int
    learning_rate: float
    noise: float
    samples: int
    val_accuracy: float
    val_loss: float
    f1_score: float
    status: str
