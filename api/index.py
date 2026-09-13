"""
Vercel Serverless Entry Point for SIH 2026 PS71
Exposes the Flask WSGI application for Vercel's Python runtime.
Handles both /api prefixed and direct path routing.
"""

import os
import sys

# Ensure root directory and backend directories are on sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)

for path in [ROOT_DIR, os.path.join(ROOT_DIR, "backend"), os.path.join(ROOT_DIR, "ml")]:
    if path not in sys.path:
        sys.path.insert(0, path)

try:
    from backend.app import create_app
    flask_app = create_app()
except Exception as e:
    # Diagnostic fallback app in case of package import failure on serverless container
    from flask import Flask, jsonify
    flask_app = Flask(__name__)
    @flask_app.route("/", defaults={"path": ""})
    @flask_app.route("/<path:path>")
    def diagnostic_fallback(path):
        return jsonify({
            "error": True,
            "message": "Vercel serverless initialization warning",
            "details": str(e),
            "requested_path": path
        }), 500

# Vercel serverless WSGI callable
app = flask_app

if __name__ == "__main__":
    app.run()
