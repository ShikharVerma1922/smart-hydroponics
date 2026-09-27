import cv2
import numpy as np
from PIL import Image
from src.config import MIN_CANOPY_COVERAGE_RATIO


def check_canopy_presence(pil_image: Image.Image) -> tuple[bool, float]:
    """
    Computes vegetation coverage using HSV color segmentation.
    Returns (is_valid, coverage_ratio).
    """
    img_rgb = np.array(pil_image)
    img_hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)

    # Hue range encompassing healthy greens and chlorotic yellow-greens
    lower_plant_hsv = np.array([20, 35, 35])
    upper_plant_hsv = np.array([90, 255, 255])

    mask = cv2.inRange(img_hsv, lower_plant_hsv, upper_plant_hsv)
    total_pixels = img_rgb.shape[0] * img_rgb.shape[1]
    plant_pixels = np.count_nonzero(mask)

    coverage_ratio = plant_pixels / total_pixels
    is_valid = coverage_ratio >= MIN_CANOPY_COVERAGE_RATIO

    return is_valid, round(coverage_ratio, 3)
