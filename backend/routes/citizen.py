from flask import Blueprint, request, jsonify, current_app
from db import get_db
from routes.auth import get_current_user
import datetime
import uuid
import os
from werkzeug.utils import secure_filename

citizen_bp = Blueprint("citizen", __name__, url_prefix="/api/citizen")

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ── Evidence upload for citizens ───────────────────────────────
@citizen_bp.route("/upload-evidence", methods=["POST"])
def upload_evidence():
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "Login required."}), 401
    if user.get("role") != "CITIZEN":
        return jsonify({"success": False, "error": "Citizen authorization required."}), 403

    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file part in the request."}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "error": "No selected file."}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        ext = filename.rsplit('.', 1)[1].lower()
        unique_name = f"citizen-evidence-{uuid.uuid4().hex}.{ext}"
        
        upload_folder = current_app.config.get("UPLOAD_FOLDER")
        os.makedirs(upload_folder, exist_ok=True)
        
        file_path = os.path.join(upload_folder, unique_name)
        file.save(file_path)
        
        url_path = f"/api/uploads/{unique_name}"
        
        evidence_meta = {
            "fileName": filename,
            "fileType": ext.upper(),
            "fileReference": url_path,
            "uploadedBy": user.get("name"),
            "uploadedAt": datetime.datetime.utcnow().isoformat() + "Z"
        }
        
        return jsonify({"success": True, "evidence": evidence_meta}), 200
        
    return jsonify({"success": False, "error": "Invalid file format. Allowed formats: PNG, JPG, JPEG, PDF."}), 400


# ── Submit observation for a specific project ───────────────────
@citizen_bp.route("/projects/<project_id>/observations", methods=["POST"])
def submit_project_observation(project_id):
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "Login required to submit observation."}), 401
    if user.get("role") != "CITIZEN":
        return jsonify({"success": False, "error": "Citizen authorization required."}), 403

    db = get_db()
    
    # 1. Project validation
    project = db.get_collection("projects").find_one({"id": project_id})
    if not project:
        return jsonify({"success": False, "error": "Project not found."}), 404
        
    if not project.get("isPublished", False):
        return jsonify({"success": False, "error": "Observations cannot be submitted for unpublished projects."}), 400

    data = request.get_json() or {}
    description = (data.get("description") or "").strip()
    obs_type = (data.get("observationType") or "").strip().upper()
    location = data.get("location") or {}
    evidence = data.get("evidence") or []

    # 2. Validation constraints
    if not description:
        return jsonify({"success": False, "error": "Observation description is required."}), 400
        
    if len(description) > 1000:
        return jsonify({"success": False, "error": "Observation description cannot exceed 1000 characters."}), 400

    valid_types = {
        "PROGRESS_OBSERVATION", 
        "SITE_CONDITION", 
        "COMPLETION_OBSERVATION", 
        "ACCESSIBILITY_OBSERVATION", 
        "GENERAL_OBSERVATION"
    }
    if obs_type not in valid_types:
        return jsonify({"success": False, "error": f"Invalid observation type. Supported types: {', '.join(valid_types)}"}), 400

    # 3. Rate limiting / abuse control: max 3 submissions per project per user per hour
    one_hour_ago = (datetime.datetime.utcnow() - datetime.timedelta(hours=1)).isoformat() + "Z"
    recent_count = db.get_collection("citizen_observations").count_documents({
        "projectId": project_id,
        "citizenId": user.get("userId"),
        "createdAt": {"$gte": one_hour_ago}
    })
    if recent_count >= 3:
        return jsonify({"success": False, "error": "Rate limit exceeded. You can submit at most 3 observations per project per hour."}), 429

    obs_id = f"obs-{uuid.uuid4().hex[:8]}"
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"

    # Default mock photoUrl if no evidence is provided (for legacy frontend compat)
    photo_url = evidence[0]["fileReference"] if (evidence and len(evidence) > 0) else "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80"

    obs_doc = {
        "id": obs_id,
        "projectId": project_id,
        "projectName": project.get("name"),
        "citizenId": user.get("userId"),
        "citizenName": user.get("name"),
        "citizenEmail": user.get("email"),
        "observationType": obs_type,
        "description": description,
        "observationText": description, # legacy compat
        "location": {
            "description": location.get("description") or project.get("location", {}).get("address") or "",
            "lat": location.get("lat") or project.get("location", {}).get("lat"),
            "lng": location.get("lng") or project.get("location", {}).get("lng"),
        },
        "evidence": evidence,
        "photoUrl": photo_url, # legacy compat
        "status": "SUBMITTED",
        "verificationStatus": "SUBMITTED", # legacy compat
        "createdAt": now_iso,
        "updatedAt": now_iso
    }

    db.get_collection("citizen_observations").insert_one(obs_doc)

    # 4. Audit Trail Logging
    db.get_collection("audit_logs").insert_one({
        "id": f"aud-{uuid.uuid4().hex[:8]}",
        "projectId": project_id,
        "observationId": obs_id,
        "action": "CITIZEN_OBSERVATION_SUBMITTED",
        "details": f"Citizen {user.get('name')} submitted a ground observation of type {obs_type}.",
        "actor": user.get("name"),
        "actorId": user.get("userId"),
        "role": "CITIZEN",
        "timestamp": now_iso,
        "sourceRef": f"Citizen Evidence Upload #{obs_id}"
    })

    return jsonify({
        "success": True,
        "message": "Observation submitted successfully.",
        "observation": obs_doc
    }), 201


# ── GET observations for a specific project (Public / Anonymized) ──
@citizen_bp.route("/projects/<project_id>/observations", methods=["GET"])
def get_project_observations(project_id):
    db = get_db()
    
    project = db.get_collection("projects").find_one({"id": project_id})
    if not project:
        return jsonify({"success": False, "error": "Project not found."}), 404

    # Fetch public observations
    observations = list(db.get_collection("citizen_observations").find({"projectId": project_id}))
    
    # Anonymize citizen details for public privacy protection
    anonymized = []
    for obs in observations:
        obs_copy = dict(obs)
        # Remove private identifiers
        obs_copy.pop("citizenEmail", None)
        obs_copy.pop("citizenPhone", None)
        # Mask name
        obs_copy["citizenName"] = "Citizen Observation"
        anonymized.append(obs_copy)

    return jsonify({"success": True, "observations": anonymized}), 200


# ── GET own observations for citizen dashboard ───────────────────
@citizen_bp.route("/my-observations", methods=["GET"])
def get_my_observations():
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "Login required."}), 401
    if user.get("role") != "CITIZEN":
        return jsonify({"success": False, "error": "Citizen authorization required."}), 403

    db = get_db()
    observations = list(db.get_collection("citizen_observations").find({"citizenId": user.get("userId")}))
    
    return jsonify({"success": True, "observations": observations}), 200


# ── Legacy Endpoints (remains compatible) ─────────────────────
@citizen_bp.route("/observations", methods=["POST"])
def submit_observation_legacy():
    # Maps to the new structured submission handler
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "Login required."}), 401
    
    data = request.get_json() or {}
    project_id = data.get("projectId")
    if not project_id:
        return jsonify({"success": False, "error": "Project ID required."}), 400

    # Adapt legacy payload format to standard
    adapted_data = {
        "observationType": "GENERAL_OBSERVATION",
        "description": data.get("observationText", ""),
        "location": data.get("location") or {},
        "evidence": []
    }
    
    # Call the actual route logic internally
    # For safety, let's just use request context or simulate it
    request.json = adapted_data
    return submit_project_observation(project_id)


@citizen_bp.route("/my-followed", methods=["GET"])
def get_followed_projects():
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    db = get_db()
    users_col = db.get_collection("users")
    user_rec = users_col.find_one({"id": user["userId"]})
    if not user_rec:
        return jsonify({"success": True, "projects": []}), 200

    followed_ids = user_rec.get("followedProjects", [])
    projects_col = db.get_collection("projects")

    followed_projects = [p for p in projects_col.find({}) if p.get("id") in followed_ids]
    return jsonify({"success": True, "projects": followed_projects}), 200


@citizen_bp.route("/notifications", methods=["GET"])
def get_notifications():
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    notifications = [
        {
            "id": "notif-1",
            "title": "Project Update: Ward 12 Road Development",
            "message": "Contractor ABC Constructions submitted a progress update of 75%. Official review pending.",
            "timestamp": "2026-08-12T14:30:00Z",
            "read": False,
            "projectId": "proj-001"
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
