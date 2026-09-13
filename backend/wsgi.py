"""
Production WSGI Entry Point for SIH 2026 PS71
Used by Gunicorn, Render, Railway, or Docker:
    gunicorn backend.wsgi:app --bind 0.0.0.0:$PORT --workers 2
"""

import os
import sys

# Ensure root directory is on Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
