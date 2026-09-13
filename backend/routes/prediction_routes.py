"""
Heavy Rainfall Prediction Routes for SIH 2026 PS71
POST /api/predictions/rainfall
GET  /api/predictions/rainfall/<location_id>
"""

from flask import Blueprint, request
from backend.config import Config
from backend.services.rainfall_service import RainfallService, ml_engine
from backend.utils.validators import success_response, error_response, validate_prediction_payload

prediction_bp = Blueprint("prediction_bp", __name__)

@prediction_bp.route("/rainfall", methods=["POST"])
def predict_custom_rainfall():
    """
    Infers heavy rainfall accumulation and intensity class for user-supplied custom meteorological features.
    """
    body = request.get_json(silent=True) or {}
    valid, msg = validate_prediction_payload(body)
    if not valid:
        return error_response(msg, 400)

    result = ml_engine.predict_heavy_rainfall(body)
    return success_response(result, message="Custom rainfall prediction computed successfully")

@prediction_bp.route("/rainfall/<location_id>", methods=["GET"])
def get_location_rainfall_prediction(location_id):
    """
    Retrieves latest heavy rainfall prediction, timeline horizons, and feature attributions for a monitored location.
    """
    valid_ids = [l["id"] for l in Config.DEFAULT_LOCATIONS]
    if location_id not in valid_ids:
        return error_response(f"Location '{location_id}' not found. Valid IDs: {valid_ids}", 404)

    data = RainfallService.get_unified_weather_and_prediction(location_id)
    payload = {
        "location": data["location"],
        "timestamp": data["timestamp"],
        "data_fidelity": data["data_fidelity"],
        "prediction": data["prediction"],
        "feature_attributions": data["feature_attributions"],
        "contributing_streams": {
            "radar_reflectivity_dbz": data["meteorological_telemetry"]["radar_dwr"]["radar_reflectivity_dbz"],
            "satellite_brightness_temp_k": data["meteorological_telemetry"]["satellite_insat"]["sat_brightness_temp_k"],
            "aws_rain_gauge_1h_mm": data["meteorological_telemetry"]["observational_aws"]["aws_rain_gauge_last_1h_mm"],
            "nwp_precip_forecast_3h_mm": data["meteorological_telemetry"]["nwp_wrf"]["nwp_precip_forecast_3h_mm"],
            "nwp_cape_j_kg": data["meteorological_telemetry"]["nwp_wrf"]["nwp_cape_j_kg"]
        }
    }
    return success_response(payload, message=f"Rainfall prediction for {location_id}")
