import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .api.dataset import router as dataset_router
from .api.model_routes import router as model_router
from .api.train import router as train_router
from .api.evaluate import router as evaluate_router
from .api.predict import router as predict_router
from .api.explain import router as explain_router
from .data_service import data_service
from .model_service import model_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("neural_studio")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Neural Network Intelligence Studio...")
    # Initialize default dataset and baseline model
    try:
        data_service.ensure_data()
        logger.info("Default make_moons dataset initialized.")
        # Ensure model is ready
        model_service.evaluate()
        logger.info("ANN model initialized and verified.")
    except Exception as e:
        logger.warning(f"Startup warm-up deferred: {e}")
    yield
    logger.info("Shutting down Neural Network Intelligence Studio.")

app = FastAPI(
    title="Neural Network Intelligence Studio API",
    description="Interactive Binary Classification & ANN Analysis Platform using TensorFlow/Keras and Scikit-learn",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error occurred.", "error": str(exc)}
    )

# Routers
app.include_router(dataset_router, prefix="/api")
app.include_router(model_router, prefix="/api")
app.include_router(train_router, prefix="/api")
app.include_router(evaluate_router, prefix="/api")
app.include_router(predict_router, prefix="/api")
app.include_router(explain_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Neural Network Intelligence Studio",
        "version": "1.0.0"
    }
