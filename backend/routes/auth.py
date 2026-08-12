import datetime
import jwt
import os
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
JWT_SECRET = os.environ.get("JWT_SECRET", "civiclens_secret_jwt_key_2026")

def generate_token(user):
    payload = {
        "userId": user["id"],
        "email": user["email"],
        "role": user["role"],
        "name": user["name"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def verify_jwt(token):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        return None

def get_current_user():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    return verify_jwt(token)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    name = data.get("name", "").strip()
    role = data.get("role", "CITIZEN").upper()

    if not email or not password or not name:
        return jsonify({"success": False, "error": "Email, password, and name are required."}), 400

    if role not in ["CITIZEN", "CONTRACTOR", "GOVERNMENT_ADMIN", "CIVICLENS_ADMIN"]:
        return jsonify({"success": False, "error": "Invalid role specified."}), 400

    db = get_db()
    users_col = db.get_collection("users")
    
    if users_col.find_one({"email": email}):
        return jsonify({"success": False, "error": "User with this email already exists."}), 409

    import uuid
    new_user = {
        "id": f"u-{uuid.uuid4().hex[:8]}",
        "name": name,
        "email": email,
        "phone": data.get("phone", ""),
        "password": generate_password_hash(password),
        "role": role,
        "city": data.get("city", "Bengaluru"),
        "ward": data.get("ward", "Indiranagar (Ward 112)"),
        "companyName": data.get("companyName", ""),
        "registrationId": data.get("registrationId", ""),
        "department": data.get("department", "")
    }

    users_col.insert_one(new_user)
    token = generate_token(new_user)

    user_data = dict(new_user)
    del user_data["password"]

    return jsonify({
        "success": True,
        "token": token,
        "user": user_data
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"success": False, "error": "Email and password are required."}), 400

    db = get_db()
    users_col = db.get_collection("users")
    user = users_col.find_one({"email": email})

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"success": False, "error": "Invalid email or password."}), 401

    token = generate_token(user)
    user_data = dict(user)
    if "password" in user_data:
        del user_data["password"]

    return jsonify({
        "success": True,
        "token": token,
        "user": user_data
    }), 200

@auth_bp.route("/me", methods=["GET"])
def get_me():
    user_payload = get_current_user()
    if not user_payload:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    db = get_db()
    users_col = db.get_collection("users")
    user = users_col.find_one({"id": user_payload["userId"]})

    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404

    user_data = dict(user)
    if "password" in user_data:
        del user_data["password"]

    return jsonify({
        "success": True,
        "user": user_data
    }), 200
