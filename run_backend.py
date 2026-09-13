"""
Launch Script for SIH 2026 PS71 Flask REST API
Usage:
    python run_backend.py
"""

import os
import sys

# Ensure root directory is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app import create_app
from backend.config import Config

if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", Config.PORT))
    print("=" * 65)
    print("  SIH 2026 PS71: Integrated Heavy Rainfall & Inundation System")
    print(f"  Starting Flask REST API on http://localhost:{port}")
    print("  Data Streams: Satellite (INSAT-3DR) | Radar (DWR) | AWS | NWP")
    print("  Methodology: Loop Engineering")
    print("=" * 65)
    app.run(host="0.0.0.0", port=port, debug=Config.DEBUG)
