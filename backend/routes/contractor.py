from flask import Blueprint, request, jsonify
from db import get_db
from routes.auth import get_current_user
import datetime
import uuid

contractor_bp = Blueprint("contractor", __name__, url_prefix="/api/contractor")

@contractor_bp.route("/projects", methods=["GET"])
def get_contractor_projects():
    user = get_current_user()
    if not user or user.get("role") != "CONTRACTOR":
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

@contractor_bp.route("/updates", methods=["POST"])
def submit_progress_update():
    user = get_current_user()
    if not user or user.get("role") != "CONTRACTOR":
        return jsonify({"success": False, "error": "Contractor authorization required."}), 403

    data = request.get_json() or {}
    project_id = data.get("projectId")
    progress_pct = data.get("progressPercentage")
    milestone_completed = data.get("milestoneCompleted", "")
    delay_reason = data.get("delayReason", "")
    photo_url = data.get("photoUrl", "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80")

    if not project_id or progress_pct is None:
        return jsonify({"success": False, "error": "Project ID and progress percentage are required."}), 400

    db = get_db()
    projects_col = db.get_collection("projects")
    project = projects_col.find_one({"id": project_id})

    if not project:
        return jsonify({"success": False, "error": "Project not found."}), 404

    update_id = f"upd-{uuid.uuid4().hex[:8]}"
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"

    update_doc = {
        "id": update_id,
        "projectId": project_id,
        "projectName": project.get("name"),
        "contractorId": user.get("userId"),
        "contractorName": user.get("name"),
        "progressPercentage": int(progress_pct),
        "milestoneCompleted": milestone_completed,
        "delayReason": delay_reason,
        "photoUrl": photo_url,
        "submissionDate": now_iso,
        "status": "PENDING_REVIEW",
        "reviewedBy": None,
        "reviewDate": None,
        "reviewNotes": None
    }

    updates_col = db.get_collection("project_updates")
    updates_col.insert_one(update_doc)

    # Log to audit trail
    audit_col = db.get_collection("audit_logs")
    audit_doc = {
        "id": f"aud-{uuid.uuid4().hex[:8]}",
        "projectId": project_id,
        "action": "Contractor Update Submitted",
        "details": f"Submitted {progress_pct}% progress update. Milestone: {milestone_completed or 'N/A'}. Pending Govt Admin review.",
        "actor": user.get("name"),
        "role": "CONTRACTOR",
        "timestamp": now_iso,
        "sourceRef": f"Contractor Portal Submission #{update_id}"
    }
    audit_col.insert_one(audit_doc)

    return jsonify({
        "success": True,
        "message": "Progress update submitted successfully. Pending Government Admin approval.",
        "update": update_doc
    }), 201
