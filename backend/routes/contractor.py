from flask import Blueprint, request, jsonify
from db import get_db
from routes.auth import get_current_user
import datetime
import uuid

contractor_bp = Blueprint("contractor", __name__, url_prefix="/api/contractor")

@contractor_bp.route("/projects", methods=["GET"])
def get_contractor_projects():
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "Authentication required."}), 401
    if user.get("role") != "CONTRACTOR":
        return jsonify({"success": False, "error": "Contractor authorization required."}), 403

    db = get_db()

    # Find the contractor record linked to this user
    contractor_record = db.get_collection("contractors").find_one({"userId": user.get("userId")})
    contractor_id = contractor_record.get("id") if contractor_record else None

    all_p = db.get_collection("projects").find({})
    # A contractor sees projects where their contractor record ID matches
    # Also match on email as fallback for legacy records
    contractor_email = user.get("email", "")
    assigned = []
    for p in all_p:
        pid = p.get("contractorId")
        if contractor_id and pid == contractor_id:
            assigned.append(p)
        elif not contractor_id and contractor_email and p.get("contractorName", "").lower() in contractor_email.lower():
            assigned.append(p)

    return jsonify({"success": True, "count": len(assigned), "projects": assigned}), 200

import os
from flask import current_app
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@contractor_bp.route("/upload-evidence", methods=["POST"])
def upload_evidence():
    user = get_current_user()
    if not user or user.get("role") != "CONTRACTOR":
        return jsonify({"success": False, "error": "Contractor authorization required."}), 403

    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file part in the request."}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "error": "No selected file."}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        ext = filename.rsplit('.', 1)[1].lower()
        unique_name = f"evidence-{uuid.uuid4().hex}.{ext}"
        
        upload_folder = current_app.config.get("UPLOAD_FOLDER")
        os.makedirs(upload_folder, exist_ok=True)
        
        file_path = os.path.join(upload_folder, unique_name)
        file.save(file_path)
        
        url_path = f"/api/uploads/{unique_name}"
        
        return jsonify({
            "success": True,
            "evidence": {
                "fileName": file.filename,
                "fileType": ext.upper(),
                "fileReference": url_path,
                "uploadedBy": user.get("name"),
                "uploadedAt": datetime.datetime.utcnow().isoformat() + "Z"
            }
        }), 200
    else:
        return jsonify({"success": False, "error": "Invalid file type. Only JPG, JPEG, PNG, and PDF are allowed."}), 400

@contractor_bp.route("/projects/<project_id>/updates", methods=["POST"])
def submit_project_progress(project_id):
    user = get_current_user()
    if not user or user.get("role") != "CONTRACTOR":
        return jsonify({"success": False, "error": "Contractor authorization required."}), 403

    db = get_db()
    contractor_record = db.get_collection("contractors").find_one({"userId": user.get("userId")})
    contractor_id = contractor_record.get("id") if contractor_record else None

    if not contractor_id:
        return jsonify({"success": False, "error": "No registered contractor record found for this user."}), 403

    projects_col = db.get_collection("projects")
    project = projects_col.find_one({"id": project_id})
    if not project:
        return jsonify({"success": False, "error": "Project not found."}), 404

    # Verify project is assigned to this contractor
    if project.get("contractorId") != contractor_id:
        return jsonify({"success": False, "error": "Unauthorized. This project is not assigned to you."}), 403

    # Validate parameters
    data = request.get_json() or {}
    progress_pct = data.get("progressPercentage")
    description = (data.get("description") or "").strip()
    milestone = (data.get("milestone") or "").strip()
    delay_reason = (data.get("delayReason") or "").strip()
    evidence = data.get("evidence")

    if progress_pct is None:
        return jsonify({"success": False, "error": "Progress percentage is required."}), 400

    try:
        progress_pct = int(progress_pct)
        if not (0 <= progress_pct <= 100):
            return jsonify({"success": False, "error": "Progress percentage must be between 0 and 100."}), 400
    except (ValueError, TypeError):
        return jsonify({"success": False, "error": "Progress percentage must be an integer."}), 400

    if not description:
        return jsonify({"success": False, "error": "Progress description is required."}), 400

    update_id = f"upd-{uuid.uuid4().hex[:8]}"
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"

    update_doc = {
        "id": update_id,
        "projectId": project_id,
        "projectName": project.get("name"),
        "contractorId": contractor_id,
        "contractorName": contractor_record.get("companyName", user.get("name")),
        "submittedBy": user.get("name"),
        "progressPercentage": progress_pct,
        "description": description,
        "milestone": milestone,
        "delayReason": delay_reason,
        "evidence": evidence or None,
        "status": "PENDING",
        "governmentComment": None,
        "reviewedBy": None,
        "reviewedAt": None,
        "submittedAt": now_iso,
        "updatedAt": now_iso
    }

    db.get_collection("project_updates").insert_one(update_doc)

    # Log to audit trail
    db.get_collection("audit_logs").insert_one({
        "id": f"aud-{uuid.uuid4().hex[:8]}",
        "projectId": project_id,
        "updateId": update_id,
        "action": "CONTRACTOR_UPDATE_SUBMITTED",
        "details": f"Contractor {user.get('name')} submitted a progress update of {progress_pct}%.",
        "actor": user.get("name"),
        "actorId": user.get("userId"),
        "role": "CONTRACTOR",
        "timestamp": now_iso,
        "metadata": {
            "progressPercentage": progress_pct,
            "milestone": milestone
        }
    })

    return jsonify({
        "success": True,
        "message": "Progress update submitted successfully. Pending Government Admin approval.",
        "update": update_doc
    }), 201

@contractor_bp.route("/projects/<project_id>/updates", methods=["GET"])
def get_project_updates(project_id):
    user = get_current_user()
    if not user or user.get("role") != "CONTRACTOR":
        return jsonify({"success": False, "error": "Contractor authorization required."}), 403

    db = get_db()
    contractor_record = db.get_collection("contractors").find_one({"userId": user.get("userId")})
    contractor_id = contractor_record.get("id") if contractor_record else None

    if not contractor_id:
        return jsonify({"success": False, "error": "No registered contractor record found for this user."}), 403

    projects_col = db.get_collection("projects")
    project = projects_col.find_one({"id": project_id})
    if not project:
        return jsonify({"success": False, "error": "Project not found."}), 404

    # Verify assignment
    if project.get("contractorId") != contractor_id:
        return jsonify({"success": False, "error": "Unauthorized. This project is not assigned to you."}), 403

    updates_col = db.get_collection("project_updates")
    updates = list(updates_col.find({"projectId": project_id}))
    return jsonify({"success": True, "updates": updates}), 200

# Keep legacy endpoint as fallback wrapper
@contractor_bp.route("/updates", methods=["POST"])
def submit_progress_update():
    user = get_current_user()
    if not user or user.get("role") != "CONTRACTOR":
        return jsonify({"success": False, "error": "Contractor authorization required."}), 403
    data = request.get_json() or {}
    project_id = data.get("projectId")
    return submit_project_progress(project_id)
