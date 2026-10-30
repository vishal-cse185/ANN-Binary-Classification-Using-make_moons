import io
import csv
import logging
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from .config import DATASETS_DIR, DEFAULT_SAMPLES, DEFAULT_NOISE, DEFAULT_RANDOM_STATE
from .schemas import DatasetResponse, DatasetSample, DatasetFeatureStats

logger = logging.getLogger("neural_studio.data")

class DataService:
    def __init__(self):
        self.current_dataset = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.noise = DEFAULT_NOISE
        self.n_samples = DEFAULT_SAMPLES
        self.random_state = DEFAULT_RANDOM_STATE
        self.test_size = 0.25

    def generate_dataset(
        self,
        n_samples: int = DEFAULT_SAMPLES,
        noise: float = DEFAULT_NOISE,
        random_state: int = DEFAULT_RANDOM_STATE,
        test_size: float = 0.25
    ) -> DatasetResponse:
        logger.info(f"Generating make_moons dataset: n={n_samples}, noise={noise}, seed={random_state}")
        self.n_samples = n_samples
        self.noise = noise
        self.random_state = random_state
        self.test_size = test_size

        X, y = make_moons(n_samples=n_samples, noise=noise, random_state=random_state)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=y
        )

        self.X_train = X_train
        self.X_test = X_test
        self.y_train = y_train
        self.y_test = y_test

        # Build full DataFrame
        train_df = pd.DataFrame(X_train, columns=["x1", "x2"])
        train_df["label"] = y_train
        train_df["split"] = "train"

        test_df = pd.DataFrame(X_test, columns=["x1", "x2"])
        test_df["label"] = y_test
        test_df["split"] = "test"

        full_df = pd.concat([train_df, test_df], ignore_index=True)
        full_df["id"] = full_df.index
        self.current_dataset = full_df

        # Save to disk
        csv_path = DATASETS_DIR / "current_moons_dataset.csv"
        full_df.to_csv(csv_path, index=False)
        logger.info(f"Saved dataset with {len(full_df)} samples to {csv_path}")

        # Compute statistics
        stats: Dict[str, DatasetFeatureStats] = {}
        for col in ["x1", "x2"]:
            stats[col] = DatasetFeatureStats(
                mean=round(float(full_df[col].mean()), 4),
                std=round(float(full_df[col].std()), 4),
                min=round(float(full_df[col].min()), 4),
                max=round(float(full_df[col].max()), 4),
                q25=round(float(full_df[col].quantile(0.25)), 4),
                median=round(float(full_df[col].median()), 4),
                q75=round(float(full_df[col].quantile(0.75)), 4)
            )

        # Class counts
        c0 = int((y == 0).sum())
        c1 = int((y == 1).sum())

        # Preview rows (first 30)
        preview_samples = [
            DatasetSample(
                id=int(row["id"]),
                x1=round(float(row["x1"]), 4),
                x2=round(float(row["x2"]), 4),
                label=int(row["label"]),
                split=str(row["split"])
            )
            for _, row in full_df.head(30).iterrows()
        ]

        # Scatter sample (stratified subset for crisp rendering: max 600 points)
        sample_size = min(600, len(full_df))
        scatter_df = full_df.sample(n=sample_size, random_state=random_state)
        scatter_samples = [
            DatasetSample(
                id=int(row["id"]),
                x1=round(float(row["x1"]), 4),
                x2=round(float(row["x2"]), 4),
                label=int(row["label"]),
                split=str(row["split"])
            )
            for _, row in scatter_df.iterrows()
        ]

        return DatasetResponse(
            total_samples=n_samples,
            n_train=len(X_train),
            n_test=len(X_test),
            noise=noise,
            class_0_count=c0,
            class_1_count=c1,
            class_0_percentage=round((c0 / n_samples) * 100, 2),
            class_1_percentage=round((c1 / n_samples) * 100, 2),
            feature_stats=stats,
            preview=preview_samples,
            scatter_sample=scatter_samples
        )

    def get_csv_buffer(self) -> io.StringIO:
        if self.current_dataset is None:
            self.generate_dataset()
        buffer = io.StringIO()
        self.current_dataset.to_csv(buffer, index=False)
        buffer.seek(0)
        return buffer

    def ensure_data(self):
        if self.X_train is None or self.y_train is None:
            self.generate_dataset()
        return self.X_train, self.X_test, self.y_train, self.y_test

data_service = DataService()
