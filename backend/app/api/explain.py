from fastapi import APIRouter, HTTPException
from ..schemas import PredictRequest, ExplainResponse
from ..explain_service import explain_service

router = APIRouter(prefix="/explain", tags=["Model Explainability"])

@router.post("", response_model=ExplainResponse)
def explain_endpoint(request: PredictRequest):
    try:
        response = explain_service.explain_point(request.x1, request.x2)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explainability computation failed: {str(e)}")
