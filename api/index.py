"""
Vercel Serverless Entry Point for SIH 2026 PS71
Exposes the Flask WSGI application for Vercel's Python runtime.
"""

import os
import sys

# Ensure root directory is on Python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.app import create_app

# Vercel serverless runtime looks for the 'app' WSGI callable
app = create_app()

if __name__ == "__main__":
    app.run()
