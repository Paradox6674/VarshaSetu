"""
Early Warning Routes for SIH 2026 PS71
GET /api/warnings
GET /api/warnings/<location_id>
"""

from flask import Blueprint, request
from backend.config import Config
from backend.services.warning_service import WarningService
from backend.utils.validators import success_response, error_response

warning_bp = Blueprint("warning_bp", __name__)

@warning_bp.route("", methods=["GET"])
def get_all_warnings():
    """
    Returns active early warnings for all monitored catchments, sorted by hazard severity.
    Supports filter query: ?severity=RED
    """
    severity_filter = request.args.get("severity", "").upper()
    warnings = WarningService.get_all_active_warnings()
    if severity_filter:
        warnings = [w for w in warnings if w["severity_color"] == severity_filter]

    return success_response({
        "total_active_warnings": len(warnings),
        "warnings": warnings
    }, message="Active early warnings retrieved")

@warning_bp.route("/<location_id>", methods=["GET"])
def get_location_warning(location_id):
    """
    Returns active warning for a specific location.
    """
    valid_ids = [l["id"] for l in Config.DEFAULT_LOCATIONS]
    if location_id not in valid_ids:
        return error_response(f"Location '{location_id}' not found. Valid IDs: {valid_ids}", 404)

    warning = WarningService.evaluate_location_warning(location_id)
    return success_response(warning, message=f"Active warning for {location_id}")
