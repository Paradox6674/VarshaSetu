"""
Vercel Serverless Entry Point for SIH 2026 PS71
Handles Flask WSGI invocation with full exception interception and path resolution.
"""

import os
import sys
import traceback

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)

# Add all candidate paths to sys.path
candidate_paths = [
    CURRENT_DIR,
    ROOT_DIR,
    os.path.join(ROOT_DIR, "backend"),
    os.path.join(ROOT_DIR, "ml"),
    os.path.join(CURRENT_DIR, "backend"),
    os.path.join(CURRENT_DIR, "ml"),
]

for p in candidate_paths:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.app import create_app
    app = create_app()
    print("[Vercel] Successfully initialized VARSHA-SETU Flask application.", file=sys.stderr)
except Exception as e:
    tb = traceback.format_exc()
    print(f"[Vercel Initialization Error]\n{tb}", file=sys.stderr)
    
    from flask import Flask, jsonify
    app = Flask(__name__)

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serverless_diagnostic(path):
        return jsonify({
            "status": "SERVERLESS_INITIALIZATION_ERROR",
            "error_type": type(e).__name__,
            "error_message": str(e),
            "traceback": tb.splitlines(),
            "sys_path": sys.path,
            "current_dir": CURRENT_DIR,
            "current_dir_contents": os.listdir(CURRENT_DIR) if os.path.exists(CURRENT_DIR) else [],
            "root_dir_contents": os.listdir(ROOT_DIR) if os.path.exists(ROOT_DIR) else []
        }), 200

if __name__ == "__main__":
    app.run()
