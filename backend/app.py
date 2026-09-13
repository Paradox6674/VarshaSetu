"""
Flask Application Factory for SIH 2026 PS71
AI/ML-Based Integrated Heavy Rainfall Early Warning & Inundation Prediction System
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import Config
from backend.routes import register_routes
from backend.database.mongodb import get_db_collection, db_manager

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for React frontend (supports localhost:5173, localhost:3000, etc.)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register API blueprints
    register_routes(app)

    # Root diagnostic endpoint
    @app.route("/", methods=["GET"])
    def root_status():
        return jsonify({
            "project": "SIH 2026 PS71: Integrated Heavy Rainfall Early Warning & Inundation Prediction System",
            "version": "1.0.0",
            "status": "OPERATIONAL",
            "methodology": "Loop Engineering",
            "active_streams": ["Satellite (INSAT-3DR)", "Radar (DWR)", "Observational (AWS)", "NWP (WRF-3km)"],
            "endpoints": {
                "weather": "/api/weather",
                "predictions_rainfall": "/api/predictions/rainfall/<location_id>",
                "predictions_inundation": "/api/predictions/inundation/<location_id>",
                "warnings": "/api/warnings",
                "locations": "/api/locations",
                "data_sources": "/api/data-sources",
                "health": "/api/health"
            }
        }), 200

    # Health check endpoint
    @app.route("/api/health", methods=["GET"])
    def health_check():
        db_stat = db_manager.get_status()
        return jsonify({
            "status": "HEALTHY",
            "database": db_stat,
            "fidelity_mode": Config.DATA_SOURCE_MODE,
            "architecture": "React -> Flask REST API -> ML Engine -> MongoDB"
        }), 200

    # Global Error Handlers (Never expose internal stacktraces)
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({
            "success": False,
            "error": True,
            "message": "Resource endpoint not found",
            "status_code": 404
        }), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({
            "success": False,
            "error": True,
            "message": "Internal server error occurred. Check system logs.",
            "status_code": 500
        }), 500

    # Seed default locations into MongoDB on startup
    _seed_locations()

    return app

def _seed_locations():
    try:
        loc_col = get_db_collection("locations")
        if loc_col.count_documents() == 0:
            for loc in Config.DEFAULT_LOCATIONS:
                loc_col.insert_one(loc)
            print("[Database] Successfully seeded default catchment locations.")
    except Exception as e:
        print(f"[Database] Location seed notice: {e}")

if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting SIH 2026 PS71 Flask REST API on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=Config.DEBUG)
