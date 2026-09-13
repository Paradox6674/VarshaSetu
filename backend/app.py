"""
Flask Application Factory for SIH 2026 PS71
AI/ML-Based Integrated Heavy Rainfall Early Warning & Inundation Prediction System
"""

import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from backend.config import Config
from backend.routes import register_routes
from backend.database.mongodb import get_db_collection, db_manager

def create_app(config_class=Config):
    # Detect pre-built frontend distribution
    dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
    has_dist = os.path.exists(dist_dir) and os.path.exists(os.path.join(dist_dir, "index.html"))

    app = Flask(__name__, static_folder=dist_dir if has_dist else None)
    app.config.from_object(config_class)

    # Enable CORS for React frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register API blueprints (/api/weather, /api/predictions, /api/warnings, etc.)
    register_routes(app)

    # Health check endpoint
    @app.route("/api/health", methods=["GET"])
    def health_check():
        db_stat = db_manager.get_status()
        return jsonify({
            "status": "HEALTHY",
            "framework": "Flask 3.0 (Python Serverless WSGI)",
            "database": db_stat,
            "fidelity_mode": Config.DATA_SOURCE_MODE,
            "architecture": "React -> Flask REST API -> ML Engine -> MongoDB"
        }), 200

    # If frontend/dist exists, serve React Single Page App
    if has_dist:
        @app.route("/", defaults={"path": ""})
        @app.route("/<path:path>")
        def serve_frontend_spa(path):
            if path.startswith("api/"):
                return jsonify({
                    "success": False,
                    "error": True,
                    "message": f"API endpoint '/{path}' not found",
                    "status_code": 404
                }), 404
            file_path = os.path.join(dist_dir, path)
            if path != "" and os.path.exists(file_path):
                return send_from_directory(dist_dir, path)
            return send_from_directory(dist_dir, "index.html")
    else:
        # Diagnostic JSON root if frontend is built separately or in serverless mode
        @app.route("/", methods=["GET"])
        def root_status():
            return jsonify({
                "project": "SIH 2026 PS71: Integrated Heavy Rainfall Early Warning & Inundation Prediction System",
                "framework": "Flask 3.0 REST API",
                "status": "OPERATIONAL",
                "methodology": "Loop Engineering",
                "endpoints": {
                    "health": "/api/health",
                    "locations": "/api/locations",
                    "weather": "/api/weather",
                    "predictions_rainfall": "/api/predictions/rainfall/mumbai_coastal",
                    "predictions_inundation": "/api/predictions/inundation/mumbai_coastal",
                    "warnings": "/api/warnings",
                    "data_sources": "/api/data-sources"
                }
            }), 200

    # Global Error Handlers
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
            "message": "Internal server error occurred.",
            "status_code": 500
        }), 500

    # Seed default locations into MongoDB
    _seed_locations()

    return app

def _seed_locations():
    try:
        loc_col = get_db_collection("locations")
        if loc_col.count_documents() == 0:
            for loc in Config.DEFAULT_LOCATIONS:
                loc_col.insert_one(loc)
    except Exception as e:
        print(f"[Database] Location seed notice: {e}")

if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=Config.DEBUG)
