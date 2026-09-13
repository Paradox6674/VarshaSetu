"""
Data Source Integration Routes for SIH 2026 PS71
GET /api/data-sources
"""

from flask import Blueprint
from backend.services.data_source_service import DataSourceService
from backend.database.mongodb import db_manager
from backend.utils.validators import success_response

data_source_bp = Blueprint("data_source_bp", __name__)

@data_source_bp.route("", methods=["GET"])
def get_data_sources_status():
    """
    Returns live diagnostic telemetry for Satellite, Radar, AWS, NWP adapters, and MongoDB layer.
    """
    telemetry = DataSourceService.get_all_streams_telemetry()
    telemetry["database_layer"] = db_manager.get_status()
    return success_response(telemetry, message="Data source stream telemetry retrieved")
