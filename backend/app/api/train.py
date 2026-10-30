from fastapi import APIRouter, HTTPException
from ..schemas import ModelTrainRequest, TrainingResponse
from ..model_service import model_service

router = APIRouter(prefix="/train", tags=["Model Training Center"])

@router.post("", response_model=TrainingResponse)
def train_model_endpoint(request: ModelTrainRequest):
    try:
        response = model_service.train_model(
            epochs=request.epochs,
            learning_rate=request.learning_rate,
            batch_size=request.batch_size,
            early_stopping=request.early_stopping,
            patience=request.patience,
            noise=request.noise,
            n_samples=request.n_samples,
            random_state=request.random_state
        )
        return response
    except Exception as e:
        model_service.is_training = False
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")

@router.get("/status")
def get_training_status():
    return {
        "is_training": model_service.is_training,
        "current_epoch": model_service.current_epoch,
        "total_epochs": model_service.total_epochs,
        "progress_percentage": model_service.training_progress,
        "experiment_id": model_service.current_experiment_id,
        "latest_history_len": len(model_service.latest_history)
    }
