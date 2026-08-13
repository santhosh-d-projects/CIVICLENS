from flask import Blueprint, request, jsonify
from db import get_db
from routes.auth import get_current_user
import datetime

projects_bp = Blueprint("projects", __name__, url_prefix="/api/projects")


def calculate_promise_reality(project):
    """Compute timeline status. Simplified for M2 — DELAYED/AT_RISK added in M3."""
    expected_str = project.get("expectedCompletionDate")
    official_progress = project.get("officialProgress", 0)
    status = project.get("status", "ONGOING")
    delay_days = 0

    if expected_str and status not in ("COMPLETED", "ON_HOLD"):
        try:
            expected_date = datetime.datetime.strptime(expected_str, "%Y-%m-%d")
            today = datetime.datetime.now()
            if today > expected_date and official_progress < 100:
                delay_days = (today - expected_date).days
        except Exception:
            pass

    return {
        "status": status,
        "delayDays": delay_days,
        "expectedCompletionDate": expected_str,
        "officialProgress": official_progress,
    }


def calculate_transparency_score(project):
    """
    0–100 Transparency Score based on data completeness.
    Higher = more public accountability data present.
    """
    score = 0

    # Budget details (max 20)
    budget = project.get("budget", {})
    if budget.get("allocated") and budget.get("released"):
        score += 10
    if budget.get("reportedExpenditure") is not None:
        score += 5
    if budget.get("source"):
        score += 5

    # Official sources attached (max 20)
    sources = project.get("sources", [])
    if len(sources) >= 2:
        score += 20
    elif len(sources) == 1:
        score += 10

    # Milestones defined (max 20)
    milestones = project.get("milestones", [])
    if len(milestones) >= 3:
        score += 20
    elif len(milestones) >= 1:
        score += 10

    # Contractor info (max 10)
    if project.get("contractorId") and project.get("contractorName"):
        score += 10

    # Progress reported (max 15)
    if project.get("officialProgress", 0) > 0:
        score += 15

    # Location recorded (max 5)
    loc = project.get("location", {})
    if loc.get("lat") and loc.get("lng"):
        score += 5

    # Base score for published project (max 10)
    if project.get("isPublished"):
        score += 10

    return min(score, 100)


@projects_bp.route("", methods=["GET"])
def get_projects():
    """
    Public endpoint: returns ONLY published projects.
    Supports filtering by ward, department, status, category, and text search.
    """
    db = get_db()
    projects_col = db.get_collection("projects")

    ward = request.args.get("ward", "").strip()
    dept = request.args.get("department", "").strip()
    status = request.args.get("status", "").strip()
    category = request.args.get("category", "").strip()
    search = request.args.get("search", "").strip().lower()
    risk_status_filter = request.args.get("riskStatus", "").strip().upper()

    all_projects = projects_col.find({})
    filtered = []

    from services.project_risk import assess_project_risk

    for p in all_projects:
        # Only published projects on the public endpoint
        if not p.get("isPublished", False):
            continue
        if ward and p.get("ward", "").lower() != ward.lower():
            continue
        if dept and p.get("department", "").lower() != dept.lower():
            continue
        if status and p.get("status", "").upper() != status.upper():
            continue
        if category and p.get("category", "").lower() != category.lower():
            continue
        if search:
            haystack = " ".join([
                p.get("name", ""),
                p.get("description", ""),
                p.get("ward", ""),
                p.get("department", ""),
                p.get("contractorName", ""),
                p.get("category", ""),
            ]).lower()
            if search not in haystack:
                continue

        pr = calculate_promise_reality(p)
        p["delayDays"] = pr["delayDays"]
        p["transparencyScore"] = calculate_transparency_score(p)

        # Retrieve observations and updates for risk assessment
        obs_col = db.get_collection("citizen_observations")
        observations = []
        for obs in obs_col.find({"projectId": p["id"]}):
            obs_copy = dict(obs)
            obs_copy.pop("citizenEmail", None)
            obs_copy.pop("citizenPhone", None)
            obs_copy["citizenName"] = "Citizen Observation"
            observations.append(obs_copy)

        updates_col = db.get_collection("project_updates")
        updates = list(updates_col.find({"projectId": p["id"]}))

        assessment_data = assess_project_risk(p, observations, updates)
        p["assessment"] = assessment_data

        if risk_status_filter and assessment_data["assessment"]["status"] != risk_status_filter:
            continue

        filtered.append(p)

    return jsonify({"success": True, "count": len(filtered), "projects": filtered}), 200


@projects_bp.route("/<project_id>", methods=["GET"])
def get_project_by_id(project_id):
    """Public project detail. Only published projects are accessible."""
    db = get_db()
    projects_col = db.get_collection("projects")
    p = projects_col.find_one({"id": project_id})

    if not p:
        return jsonify({"success": False, "error": "Project not found."}), 404

    # Government admins can view drafts; everyone else only sees published
    user = get_current_user()
    is_admin = user and user.get("role") in ("GOVERNMENT_ADMIN", "CIVICLENS_ADMIN")

    if not p.get("isPublished", False) and not is_admin:
        return jsonify({"success": False, "error": "Project not found."}), 404

    pr = calculate_promise_reality(p)
    p["delayDays"] = pr["delayDays"]
    p["transparencyScore"] = calculate_transparency_score(p)

    updates_col = db.get_collection("project_updates")
    updates = list(updates_col.find({"projectId": project_id}))

    obs_col = db.get_collection("citizen_observations")
    observations = []
    for obs in obs_col.find({"projectId": project_id}):
        obs_copy = dict(obs)
        obs_copy.pop("citizenEmail", None)
        obs_copy.pop("citizenPhone", None)
        obs_copy["citizenName"] = "Citizen Observation"
        observations.append(obs_copy)

    audit_col = db.get_collection("audit_logs")
    audit_trail = list(audit_col.find({"projectId": project_id}))

    from services.project_risk import assess_project_risk
    assessment_data = assess_project_risk(p, observations, updates)

    return jsonify({
        "success": True,
        "project": p,
        "contractorUpdates": updates,
        "citizenObservations": observations,
        "auditTrail": audit_trail,
        "assessment": assessment_data
    }), 200


@projects_bp.route("/<project_id>/assessment", methods=["GET"])
def get_project_assessment(project_id):
    db = get_db()
    projects_col = db.get_collection("projects")
    p = projects_col.find_one({"id": project_id})
    if not p:
        return jsonify({"success": False, "error": "Project not found."}), 404
        
    user = get_current_user()
    is_admin = user and user.get("role") in ("GOVERNMENT_ADMIN", "CIVICLENS_ADMIN")
    if not p.get("isPublished", False) and not is_admin:
        return jsonify({"success": False, "error": "Project not found."}), 404
        
    obs_col = db.get_collection("citizen_observations")
    observations = []
    for obs in obs_col.find({"projectId": project_id}):
        obs_copy = dict(obs)
        obs_copy.pop("citizenEmail", None)
        obs_copy.pop("citizenPhone", None)
        obs_copy["citizenName"] = "Citizen Observation"
        observations.append(obs_copy)
        
    updates_col = db.get_collection("project_updates")
    updates = list(updates_col.find({"projectId": project_id}))
    
    from services.project_risk import assess_project_risk
    assessment_data = assess_project_risk(p, observations, updates)
    
    return jsonify({"success": True, "assessment": assessment_data}), 200


@projects_bp.route("/<project_id>/follow", methods=["POST"])
def toggle_follow_project(project_id):
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "Unauthorized."}), 401

    db = get_db()
    users_col = db.get_collection("users")
    user_record = users_col.find_one({"id": user["userId"]})
    if not user_record:
        return jsonify({"success": False, "error": "User not found."}), 404

    followed = user_record.get("followedProjects", [])
    if project_id in followed:
        followed.remove(project_id)
        is_following = False
    else:
        followed.append(project_id)
        is_following = True

    users_col.update_one({"id": user["userId"]}, {"$set": {"followedProjects": followed}})
    return jsonify({"success": True, "isFollowing": is_following, "followedProjects": followed}), 200
