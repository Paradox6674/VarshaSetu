"""
Vercel Serverless Entry Point for SIH 2026 PS71
Handles Flask WSGI invocation with robust Vercel path-restoration middleware.
"""

import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)

for p in [CURRENT_DIR, ROOT_DIR, os.path.join(ROOT_DIR, "backend"), os.path.join(ROOT_DIR, "ml")]:
    if os.path.exists(p) and p not in sys.path:
        sys.path.insert(0, p)

from backend.app import create_app

flask_app = create_app()

class VercelPathMiddleware:
    """
    Ensures that when Vercel rewrites /api/(.*) to /api/index.py,
    Flask receives the true original requested path.
    """
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        path = environ.get('PATH_INFO', '')
        # Vercel provides original URL in HTTP_X_FORWARDED_URI or REQUEST_URI
        orig_uri = environ.get('HTTP_X_FORWARDED_URI') or environ.get('REQUEST_URI')
        if orig_uri and ('index.py' in path or not path or path == '/'):
            environ['PATH_INFO'] = orig_uri.split('?')[0]
        return self.app(environ, start_response)

# Vercel WSGI callable
app = VercelPathMiddleware(flask_app)

if __name__ == "__main__":
    flask_app.run()
