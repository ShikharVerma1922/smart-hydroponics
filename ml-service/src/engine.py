from typing import Dict, Tuple
from PIL import Image
from ultralytics import YOLO

from src.config import (
    WEIGHTS_PATH,
    ALL_CLASSES,
    RAW_CLASS_MAP,
    INFERENCE_IMAGE_SIZE,
    CONFIDENCE_FLOOR,
    AMBIGUITY_DELTA
)


class DiagnosticEngine:
    def __init__(self):
        print(
            f"[DiagnosticEngine] Initializing YOLO model from: {WEIGHTS_PATH}")
        self.model = YOLO(WEIGHTS_PATH)
        self.loaded_classes = list(self.model.names.values()) if hasattr(
            self.model, "names") else []

    def normalize_label(self, raw_label: str) -> str:
        cleaned = raw_label.strip().upper().replace(" ", "_").replace("-", "_")
        return RAW_CLASS_MAP.get(cleaned, cleaned)

    def calculate_severity(self, primary_label: str, confidence: float) -> str:
        if primary_label == "HEALTHY":
            return "NONE"

        # Downscale ambiguous detections for K and Mg to protect reservoir balance
        if primary_label in ["POTASSIUM_DEFICIENCY", "MAGNESIUM_DEFICIENCY"] and confidence < 0.70:
            return "LOW"

        if confidence < 0.60:
            return "LOW"
        elif confidence < 0.80:
            return "MODERATE"
        elif confidence < 0.92:
            return "HIGH"
        else:
            return "CRITICAL"

    def predict(self, image: Image.Image) -> Tuple[str, float, str, Dict[str, float]]:
        # Run classification
        results = self.model.predict(
            source=image,
            imgsz=INFERENCE_IMAGE_SIZE,
            verbose=False
        )
        probs = results[0].probs

        # Initialize distribution with a non-zero basal floor
        class_probabilities: Dict[str, float] = {
            cls: 0.001 for cls in ALL_CLASSES}

        # Collect raw model probabilities
        extracted_probs = []
        for idx, conf in enumerate(probs.data.tolist()):
            clean_name = self.normalize_label(results[0].names[idx])
            prob_val = round(float(conf), 3)
            class_probabilities[clean_name] = prob_val
            extracted_probs.append((clean_name, prob_val))

        # Sort classes by probability descending
        extracted_probs.sort(key=lambda x: x[1], reverse=True)
        top1_label, top1_conf = extracted_probs[0]
        top2_conf = extracted_probs[1][1] if len(extracted_probs) > 1 else 0.0

        # Safety Fallback 1: Low Confidence Floor
        # Safety Fallback 2: Ambiguity Floor (difference between Top-1 and Top-2 is too small)
        if top1_conf < CONFIDENCE_FLOOR or (top1_conf - top2_conf) < AMBIGUITY_DELTA:
            primary_label = "HEALTHY"
            confidence = top1_conf
            severity = "NONE"
            return primary_label, confidence, severity, class_probabilities

        primary_label = top1_label
        confidence = top1_conf
        severity = self.calculate_severity(primary_label, confidence)

        return primary_label, confidence, severity, class_probabilities
