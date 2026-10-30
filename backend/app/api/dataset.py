from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from ..schemas import DatasetGenerateRequest, DatasetResponse
from ..data_service import data_service

router = APIRouter(prefix="/dataset", tags=["Dataset Explorer"])

@router.post("/generate", response_model=DatasetResponse)
def generate_dataset_endpoint(request: DatasetGenerateRequest):
    try:
        response = data_service.generate_dataset(
            n_samples=request.n_samples,
            noise=request.noise,
            random_state=request.random_state,
            test_size=request.test_size
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate dataset: {str(e)}")

@router.get("/current", response_model=DatasetResponse)
def get_current_dataset_endpoint():
    try:
        data_service.ensure_data()
        # Retrieve current stats
        return data_service.generate_dataset(
            n_samples=data_service.n_samples,
            noise=data_service.noise,
            random_state=data_service.random_state,
            test_size=data_service.test_size
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve dataset: {str(e)}")

@router.get("/download")
def download_dataset_csv():
    try:
        buffer = data_service.get_csv_buffer()
        csv_content = buffer.getvalue()
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=make_moons_dataset.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download dataset: {str(e)}")
