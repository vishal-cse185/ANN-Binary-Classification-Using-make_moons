import os
from pathlib import Path

# Base Paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent

MODELS_DIR = BACKEND_DIR / "models"
DATASETS_DIR = BACKEND_DIR / "datasets"
EXPERIMENTS_DIR = BACKEND_DIR / "experiments"
OUTPUTS_DIR = BACKEND_DIR / "outputs"

for directory in [MODELS_DIR, DATASETS_DIR, EXPERIMENTS_DIR, OUTPUTS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# Default Model Architecture Constants
INPUT_DIM = 2
HIDDEN_LAYERS = [16, 32, 16]
OUTPUT_DIM = 1
DEFAULT_ACTIVATION = "relu"
OUTPUT_ACTIVATION = "sigmoid"
DEFAULT_LEARNING_RATE = 0.01
DEFAULT_EPOCHS = 60
DEFAULT_BATCH_SIZE = 32
DEFAULT_NOISE = 0.20
DEFAULT_SAMPLES = 2000
DEFAULT_RANDOM_STATE = 42
