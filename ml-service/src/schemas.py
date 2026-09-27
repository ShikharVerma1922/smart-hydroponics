from typing import Dict
from pydantic import BaseModel, Field


class PlantHealthResponse(BaseModel):
    primary_label: str = Field(...,
                               description="Top diagnosis class matching system enum")
    confidence: float = Field(..., ge=0.0, le=1.0,
                              description="Confidence of primary diagnosis")
    severity: str = Field(...,
                          description="NONE | LOW | MODERATE | HIGH | CRITICAL")
    class_probabilities: Dict[str, float] = Field(
        ..., description="Full probability distribution")


class HealthCheckResponse(BaseModel):
    status: str
    weights_path: str
    loaded_classes: list[str]
