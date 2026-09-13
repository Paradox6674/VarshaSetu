"""
Validation and Response Formatting Utilities for SIH 2026 PS71
"""

from flask import jsonify

def error_response(message: str, status_code: int = 400, details: dict = None):
    payload = {
        "success": False,
        "error": True,
        "message": message,
        "status_code": status_code
    }
    if details:
        payload["details"] = details
    return jsonify(payload), status_code

def success_response(data: dict, status_code: int = 200, message: str = "Success"):
    payload = {
        "success": True,
        "error": False,
        "message": message,
        "data": data
    }
    return jsonify(payload), status_code

def validate_prediction_payload(payload: dict):
    if not isinstance(payload, dict):
        return False, "Payload must be a valid JSON object"
    # All fields optional with sensible fallbacks, but type check if present
    numeric_keys = [
        "radar_reflectivity_dbz", "sat_brightness_temp_k", "aws_rain_gauge_last_1h_mm",
        "nwp_precip_forecast_3h_mm", "nwp_cape_j_kg", "aws_pressure_tendency_3h"
    ]
    for k in numeric_keys:
        if k in payload:
            try:
                float(payload[k])
            except (ValueError, TypeError):
                return False, f"Field '{k}' must be a numeric value"
    return True, None
