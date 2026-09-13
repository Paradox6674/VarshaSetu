"""
Routes Blueprint Registry for SIH 2026 PS71
"""

from backend.routes.weather_routes import weather_bp
from backend.routes.prediction_routes import prediction_bp
from backend.routes.inundation_routes import inundation_bp
from backend.routes.warning_routes import warning_bp
from backend.routes.location_routes import location_bp
from backend.routes.data_source_routes import data_source_bp

def register_routes(app):
    app.register_blueprint(weather_bp, url_prefix="/api/weather")
    app.register_blueprint(prediction_bp, url_prefix="/api/predictions")
    app.register_blueprint(inundation_bp, url_prefix="/api/predictions")
    app.register_blueprint(warning_bp, url_prefix="/api/warnings")
    app.register_blueprint(location_bp, url_prefix="/api/locations")
    app.register_blueprint(data_source_bp, url_prefix="/api/data-sources")
