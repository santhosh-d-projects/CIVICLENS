from flask import Blueprint, request, jsonify
from db import get_db
from routes.auth import get_current_user
import datetime
import uuid

citizen_bp = Blueprint("citizen", __name__, url_prefix="/api/citizen")

@citizen_bp.route("/observations", methods=["POST"])
def submit_observation():
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "Login required to submit observation."}), 401

    data = request.get_json() or {}
    project_id = data.get("projectId")
    text = data.get("observationText", "").strip()

    if not project_id or not text:
        return jsonify({"success": False, "error": "Project ID and observation text are required."}), 400

    db = get_db()
    projects_col = db.get_collection("projects")
    project = projects_col.find_one({"id": project_id})

    if not project:
        return jsonify({"success": False, "error": "Project not found."}), 404

    obs_id = f"obs-{uuid.uuid4().hex[:8]}"
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"

    photo_url = data.get("photoUrl", "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80")

    # Simulate AI Evidence Check on uploaded image/text
    ai_analysis = {
        "detection": "Incomplete pavement / active work site",
        "confidence": 0.86,
        "recommendation": "Human verification recommended by Government Admin."
    }

    obs_doc = {
        "id": obs_id,
        "projectId": project_id,
        "projectName": project.get("name"),
        "citizenName": user.get("name"),
        "citizenEmail": user.get("email"),
        "observationText": text,
        "photoUrl": photo_url,
        "location": data.get("location", project.get("location")),
        "timestamp": now_iso,
        "verificationStatus": "UNVERIFIED",
        "aiAnalysis": ai_analysis,
        "trustLabel": "Citizen Observation"
    }

    obs_col = db.get_collection("citizen_observations")
    obs_col.insert_one(obs_doc)

    # Add entry to audit log
    audit_col = db.get_collection("audit_logs")
    audit_col.insert_one({
        "id": f"aud-{uuid.uuid4().hex[:8]}",
        "projectId": project_id,
        "action": "Citizen Observation Submitted",
        "details": f"Citizen {user.get('name')} submitted an on-the-ground observation.",
        "actor": user.get("name"),
        "role": "CITIZEN",
        "timestamp": now_iso,
        "sourceRef": f"Citizen Evidence Upload #{obs_id}"
    })

    return jsonify({
        "success": True,
        "message": "Citizen observation recorded successfully.",
        "observation": obs_doc
    }), 201

@citizen_bp.route("/my-followed", methods=["GET"])
def get_followed_projects():
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    db = get_db()
    users_col = db.get_collection("users")
    user_rec = users_col.find_one({"id": user["userId"]})

    followed_ids = user_rec.get("followedProjects", [])
    projects_col = db.get_collection("projects")

    followed_projects = [p for p in projects_col.find({}) if p.get("id") in followed_ids]
    return jsonify({"success": True, "projects": followed_projects}), 200

@citizen_bp.route("/notifications", methods=["GET"])
def get_notifications():
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    # Return realistic civic project alert feed
    notifications = [
        {
            "id": "notif-1",
            "title": "Project Update: 100 Feet Road",
            "message": "Contractor Rajesh Infra submitted a progress update of 72%. Official review pending.",
            "timestamp": "2026-08-10T14:30:00Z",
            "read": False,
            "projectId": "proj-101"
        },
        {
            "id": "notif-2",
            "title": "Government Sanction Notice",
            "message": "BBMP SWD uploaded flood mitigation blueprint for Koramangala 4th Block.",
            "timestamp": "2026-08-11T09:00:00Z",
            "read": True,
            "projectId": "proj-102"
        }
    ]
    return jsonify({"success": True, "notifications": notifications}), 200
