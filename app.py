"""
Root Application Entry Point for Vercel Flask Framework Detection
Allows direct import of backend and ml as native sibling packages.
"""

import os
import sys

# Ensure root directory is on Python path
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.app import create_app

# WSGI callable for Vercel and production WSGI servers
app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
