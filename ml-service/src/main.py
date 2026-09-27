import io
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Request, HTTPException, status
from PIL import Image

from src.config import WEIGHTS_PATH
from src.schemas import PlantHealthResponse, HealthCheckResponse
from src.validator import check_canopy_presence
from src.engine import DiagnosticEngine

engine: DiagnosticEngine = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global engine
    engine = DiagnosticEngine()
    yield

app = FastAPI(
    title="Lettuce Plant Health Diagnostic Service",
    version="2.0.0",
    lifespan=lifespan
)


@app.get("/health", response_model=HealthCheckResponse)
def health():
    return HealthCheckResponse(
        status="healthy",
        weights_path=WEIGHTS_PATH,
        loaded_classes=engine.loaded_classes
    )


@app.post("/predict", response_model=PlantHealthResponse)
async def predict(
    request: Request,
    file: UploadFile = File(None)
):
    image_bytes = None

    # Case A: Standard multipart upload (Swagger /docs, Postman, curl -F)
    if file is not None:
        image_bytes = await file.read()

    # Case B: Raw binary payload (application/octet-stream, Node.js raw Buffer)
    if not image_bytes:
        image_bytes = await request.body()

    if not image_bytes or len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty image payload received. Upload via 'file' multipart field or binary body."
        )

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payload could not be parsed as a valid image: {str(err)}"
        )

    # Canopy presence check
    has_canopy, coverage = check_canopy_presence(image)
    if not has_canopy:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"No plant canopy detected in frame (coverage: {coverage * 100}% < 8%). Lens blocked or empty cup."
        )

    # Run inference
    try:
        primary_label, confidence, severity, class_probabilities = engine.predict(
            image)
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference pipeline execution error: {str(err)}"
        )

    return PlantHealthResponse(
        primary_label=primary_label,
        confidence=confidence,
        severity=severity,
        class_probabilities=class_probabilities
    )
