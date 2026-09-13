"""
Weather Routes for SIH 2026 PS71
GET /api/weather
GET /api/weather/<location_id>
"""

from flask import Blueprint, request
from backend.config import Config
from backend.services.rainfall_service import RainfallService
from backend.utils.validators import success_response, error_response

weather_bp = Blueprint("weather_bp", __name__)

@weather_bp.route("", methods=["GET"])
def get_all_weather():
    """
    Returns observational and merged meteorological state across all monitored locations.
    """
    results = []
    for loc in Config.DEFAULT_LOCATIONS:
        data = RainfallService.get_unified_weather_and_prediction(loc["id"])
        results.append({
            "location_id": loc["id"],
            "location_name": loc["name"],
            "region": loc["region"],
            "coordinates": {"lat": loc["lat"], "lon": loc["lon"]},
            "timestamp": data["timestamp"],
            "telemetry": data["meteorological_telemetry"],
            "data_fidelity": data["data_fidelity"]
        })
    return success_response(results, message="Retrieved weather telemetry for all locations")

@weather_bp.route("/<location_id>", methods=["GET"])
def get_location_weather(location_id):
    """
    Returns current multi-sensor weather telemetry for a specific location.
    """
    valid_ids = [l["id"] for l in Config.DEFAULT_LOCATIONS]
    if location_id not in valid_ids:
        return error_response(f"Location '{location_id}' not found. Valid IDs: {valid_ids}", 404)
        
    data = RainfallService.get_unified_weather_and_prediction(location_id)
    return success_response(data, message=f"Weather telemetry for {location_id}")
