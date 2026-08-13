from flask import Blueprint, jsonify
from db import get_db

health_bp = Blueprint("health", __name__, url_prefix="/api")

@health_bp.route("/health", methods=["GET"])
def health_check():
    try:
        db = get_db()
        users_col = db.get_collection("users")
        user_count = users_col.count_documents({})
        db_status = "connected"
        db_mode = "MongoDB" if db.is_mongodb else "Embedded JSON Storage Driver"
    except Exception as e:
        db_status = f"error: {str(e)}"
        db_mode = "offline"
        user_count = 0

    return jsonify({
        "success": True,
        "message": "CivicLens API is running",
        "database": db_status,
        "databaseDriver": db_mode,
        "registeredUsersCount": user_count
    }), 200
