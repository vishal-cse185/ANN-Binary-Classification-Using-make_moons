from fastapi import APIRouter, HTTPException
from ..schemas import PredictRequest, PredictResponse
from ..model_service import model_service

router = APIRouter(prefix="/predict", tags=["Interactive Prediction Playground"])

@router.post("", response_model=PredictResponse)
def predict_endpoint(request: PredictRequest):
    try:
        response = model_service.predict_point(request.x1, request.x2)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
