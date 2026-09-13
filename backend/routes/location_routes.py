"""
Location Routes for SIH 2026 PS71
GET /api/locations
GET /api/locations/<location_id>
"""

from flask import Blueprint
from backend.config import Config
from backend.utils.validators import success_response, error_response

location_bp = Blueprint("location_bp", __name__)

@location_bp.route("", methods=["GET"])
def get_locations():
    """
    Returns list of all monitored catchments with terrain & station metadata.
    """
    return success_response({
        "total_locations": len(Config.DEFAULT_LOCATIONS),
        "locations": Config.DEFAULT_LOCATIONS
    }, message="Monitored catchment locations retrieved")

@location_bp.route("/<location_id>", methods=["GET"])
def get_location_by_id(location_id):
    """
    Returns details for a specific location.
    """
    for loc in Config.DEFAULT_LOCATIONS:
        if loc["id"] == location_id:
            return success_response(loc, message=f"Details for {location_id}")
    return error_response(f"Location '{location_id}' not found", 404)
