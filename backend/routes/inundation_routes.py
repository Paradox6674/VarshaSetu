"""
Inundation Prediction Routes for SIH 2026 PS71
POST /api/predictions/inundation
GET  /api/predictions/inundation/<location_id>
"""

from flask import Blueprint, request
from backend.config import Config
from backend.services.inundation_service import InundationService
from backend.models.ml_engine import MLEngine
from backend.utils.validators import success_response, error_response

inundation_bp = Blueprint("inundation_bp", __name__)
ml_engine = MLEngine()

@inundation_bp.route("/inundation", methods=["POST"])
def predict_custom_inundation():
    """
    Infers inundation risk tier and waterlogging depth for custom rainfall and terrain parameters.
    """
    body = request.get_json(silent=True) or {}
    rainfall_mm = float(body.get("predicted_rainfall_3h_mm", 30.0))
    prior_rain = float(body.get("prior_rain_gauge_1h_mm", 5.0))
    
    catchment_params = {
        "catchment_elevation_m": float(body.get("catchment_elevation_m", 15.0)),
        "catchment_slope_deg": float(body.get("catchment_slope_deg", 1.5)),
        "drainage_capacity_score": float(body.get("drainage_capacity_score", 4.5)),
        "soil_saturation_index": float(body.get("soil_saturation_index", 0.7))
    }
    
    result = ml_engine.predict_inundation_risk(catchment_params, rainfall_mm, prior_rain)
    return success_response(result, message="Custom inundation risk assessed successfully")

@inundation_bp.route("/inundation/<location_id>", methods=["GET"])
def get_location_inundation(location_id):
    """
    Retrieves hydrological runoff, risk tier, depth, and vulnerable hotspots for a monitored catchment.
    """
    valid_ids = [l["id"] for l in Config.DEFAULT_LOCATIONS]
    if location_id not in valid_ids:
        return error_response(f"Location '{location_id}' not found. Valid IDs: {valid_ids}", 404)

    # Optional query param for what-if simulation: ?rain_mm=80
    custom_rain = request.args.get("rain_mm", type=float)
    data = InundationService.get_inundation_assessment(location_id, custom_rainfall_mm=custom_rain)
    return success_response(data, message=f"Inundation assessment for {location_id}")
