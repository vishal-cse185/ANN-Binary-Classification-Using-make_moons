from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from ..schemas import EvaluationResponse
from ..model_service import model_service
from ..config import OUTPUTS_DIR

router = APIRouter(prefix="/evaluate", tags=["Model Evaluation Center"])

@router.get("", response_model=EvaluationResponse)
def evaluate_model_endpoint():
    try:
        response = model_service.evaluate()
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

@router.get("/report/download")
def download_evaluation_report():
    report_file = OUTPUTS_DIR / "latest_evaluation_report.json"
    if not report_file.exists():
        model_service.evaluate()
    if report_file.exists():
        return FileResponse(
            path=str(report_file),
            filename="neural_studio_evaluation_report.json",
            media_type="application/json"
        )
    raise HTTPException(status_code=404, detail="No evaluation report found.")
