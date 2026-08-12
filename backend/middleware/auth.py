import jwt
from functools import wraps
from flask import request, jsonify, g
from config import Config
from db import get_db

def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"success": False, "message": "Authorization header missing"}), 401
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"success": False, "message": "Invalid Authorization header format. Expected 'Bearer <token>'"}), 401

        token = parts[1]
        try:
            payload = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
            g.current_user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "message": "Token has expired. Please log in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "message": "Invalid authentication token."}), 401

        return f(*args, **kwargs)
    return decorated

def role_required(*allowed_roles):
    def decorator(f):
        @wraps(f)
        @jwt_required
        def decorated(*args, **kwargs):
            user_role = g.current_user.get("role")
            if user_role not in allowed_roles and "CIVICLENS_ADMIN" not in allowed_roles:
                return jsonify({
                    "success": False,
                    "message": f"Access denied. Required role: {', '.join(allowed_roles)}. Your role: {user_role}"
                }), 403
            return f(*args, **kwargs)
        return decorated
    return decorator
