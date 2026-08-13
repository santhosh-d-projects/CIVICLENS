import os
import logging
from flask import Flask, jsonify
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS
from config import Config
from seed_data import seed_database

try:
    from bson import ObjectId
except ImportError:
    class ObjectId:
        pass

class CustomJSONProvider(DefaultJSONProvider):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return super().default(o)

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger("civiclens.app")

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.json = CustomJSONProvider(app)

    # Enable CORS for React Frontend, restricted to FRONTEND_URL in production
    frontend_url = app.config.get("FRONTEND_URL", "*")
    cors_origins = "*" if frontend_url == "*" else [frontend_url, "http://localhost:5173", "http://127.0.0.1:5173"]
    CORS(app, resources={r"/api/*": {"origins": cors_origins}})

    # Setup upload directory
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    app.config["UPLOAD_FOLDER"] = upload_dir

    from flask import send_from_directory
    @app.route("/api/uploads/<path:filename>")
    def serve_upload(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    # Run Database Seed
    try:
        seed_database()
    except Exception as e:
        logger.error(f"Failed to run database seed: {e}")

    # Register Blueprints
    from routes.health import health_bp
    from routes.auth import auth_bp
    from routes.projects import projects_bp
    from routes.contractor import contractor_bp
    from routes.government import government_bp
    from routes.citizen import citizen_bp
    from routes.ai import ai_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(contractor_bp)
    app.register_blueprint(government_bp)
    app.register_blueprint(citizen_bp)
    app.register_blueprint(ai_bp)

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "message": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"success": False, "message": "An internal server error occurred"}), 500

    logger.info("CivicLens Flask Application Initialized.")
    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
