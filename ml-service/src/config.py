import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Paths
WEIGHTS_PATH = os.getenv("MODEL_WEIGHTS", str(
    BASE_DIR / "weights" / "best.pt"))

# Target classes expected by Node.js backend
ALL_CLASSES = [
    "HEALTHY",
    "NITROGEN_DEFICIENCY",
    "PHOSPHORUS_DEFICIENCY",
    "POTASSIUM_DEFICIENCY",
    "CALCIUM_DEFICIENCY",
    "MAGNESIUM_DEFICIENCY",
    "IRON_DEFICIENCY"
]

# Raw dataset label normalization map
RAW_CLASS_MAP = {
    "CA_DEFICIENCY": "CALCIUM_DEFICIENCY",
    "K_DEFICIENCY": "POTASSIUM_DEFICIENCY",
    "MG_DEFICIENCY": "MAGNESIUM_DEFICIENCY",
    "N_DEFICIENCY": "NITROGEN_DEFICIENCY",
    "P_DEFICIENCY": "PHOSPHORUS_DEFICIENCY",
    "FE_DEFICIENCY": "IRON_DEFICIENCY",
    "FULL_NUTRIENT": "HEALTHY",
    "FN": "HEALTHY",
    "HEALTHY": "HEALTHY",
}

# Image Pre-validation Guardrails
MIN_CANOPY_COVERAGE_RATIO = 0.08  # Minimum 8% of frame must be vegetation
INFERENCE_IMAGE_SIZE = 224        # Matches training resolution

# Decision Thresholds
CONFIDENCE_FLOOR = 0.50           # Rejects low-certainty guesses
AMBIGUITY_DELTA = 0.12            # Margin between Top-1 and Top-2 probabilities
