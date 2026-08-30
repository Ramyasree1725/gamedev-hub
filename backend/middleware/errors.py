
"""
Centralized error handlers for GameDev Hub Flask app.
"""
from flask import jsonify, render_template, request
from typing import Tuple, Any

def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(e):
        if request.path.startswith("/api/"):
            return jsonify({"error": "Bad request", "message": str(e)}), 400
        return render_template("about.html"), 400

    @app.errorhandler(404)
    def not_found(e):
        if request.path.startswith("/api/"):
            return jsonify({"error": "Not found"}), 404
        return render_template("about.html"), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        if request.path.startswith("/api/"):
            return jsonify({"error": "Method not allowed"}), 405
        return render_template("about.html"), 405

    @app.errorhandler(429)
    def rate_limited(e):
        return jsonify({"error": "Rate limit exceeded", "retry_after": 60}), 429

    @app.errorhandler(500)
    def internal_error(e):
        if request.path.startswith("/api/"):
            return jsonify({"error": "Internal server error"}), 500
        return render_template("about.html"), 500

    @app.errorhandler(Exception)
    def unhandled(e):
        app.logger.exception("Unhandled exception")
        if request.path.startswith("/api/"):
            return jsonify({"error": "Unexpected error"}), 500
        return render_template("about.html"), 500
