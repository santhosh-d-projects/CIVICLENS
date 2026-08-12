from flask import Blueprint, request, jsonify
from db import get_db
from routes.auth import get_current_user
import datetime
import uuid

government_bp = Blueprint("government", __name__, url_prefix="/api/government")


def is_govt_admin(user):
    return user and user.get("role") in ("GOVERNMENT_ADMIN", "CIVICLENS_ADMIN")


def validate_project_data(data, is_create=True):
    """Server-side project validation. Returns list of error strings."""
    errors = []

    name = (data.get("name") or "").strip()
    description = (data.get("description") or "").strip()
    category = (data.get("category") or "").strip()
    department = (data.get("department") or "").strip()
    ward = (data.get("ward") or "").strip()
    start_date = (data.get("startDate") or "").strip()
    end_date = (data.get("expectedCompletionDate") or "").strip()
    allocated = data.get("allocatedBudget")

    if is_create:
        if not name:               errors.append("Project name is required.")
        if not description:        errors.append("Description is required.")
        if not category:           errors.append("Category is required.")
        if not department:         errors.append("Department is required.")
        if not ward:               errors.append("Ward is required.")
        if not start_date:         errors.append("Start date is required.")
        if not end_date:           errors.append("Expected completion date is required.")
        if allocated is None:      errors.append("Allocated budget is required.")

    if allocated is not None:
        try:
            if int(float(allocated)) <= 0:
                errors.append("Budget must be a positive number.")
        except (ValueError, TypeError):
            errors.append("Budget must be a valid number.")

    if start_date and end_date:
        try:
            sd = datetime.datetime.strptime(start_date, "%Y-%m-%d")
            ed = datetime.datetime.strptime(end_date, "%Y-%m-%d")
            if ed < sd:
                errors.append("Completion date cannot be before start date.")
        except ValueError:
            errors.append("Dates must be in YYYY-MM-DD format.")

    # Validate coordinates if provided
    lat = data.get("lat")
    lng = data.get("lng")
    if lat is not None:
        try:
            lat_f = float(lat)
            if not (-90 <= lat_f <= 90):
                errors.append("Latitude must be between -90 and 90.")
        except (ValueError, TypeError):
            errors.append("Latitude must be a valid decimal number.")
    if lng is not None:
        try:
            lng_f = float(lng)
            if not (-180 <= lng_f <= 180):
                errors.append("Longitude must be between -180 and 180.")
        except (ValueError, TypeError):
            errors.append("Longitude must be a valid decimal number.")

    return errors


def audit(db, project_id, action, details, user, source_ref=None):
    """Append-only audit log entry. Never call with external user data unchecked."""
    db.get_collection("audit_logs").insert_one({
        "id": f"aud-{uuid.uuid4().hex[:8]}",
        "projectId": project_id,
        "action": action,
        "details": details,
        "actor": user.get("name"),
        "actorId": user.get("userId"),
        "role": user.get("role"),
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "sourceRef": source_ref or f"Action by {user.get('name')}",
    })


# ── Dashboard stats ────────────────────────────────────────────
@government_bp.route("/stats", methods=["GET"])
def get_dashboard_stats():
    user = get_current_user()
    if not is_govt_admin(user):
        return jsonify({"success": False, "error": "Government Admin authorization required."}), 403

    db = get_db()
    all_p = db.get_collection("projects").find({})

    total_projects = len(all_p)
    published = len([p for p in all_p if p.get("isPublished")])
    drafts = len([p for p in all_p if not p.get("isPublished")])

    # Status counts using M2 canonical values
    status_counts = {}
    for p in all_p:
        s = p.get("status", "ONGOING")
        status_counts[s] = status_counts.get(s, 0) + 1

    total_allocated = sum(p.get("budget", {}).get("allocated", 0) for p in all_p)
    total_spent = sum(p.get("budget", {}).get("reportedExpenditure", 0) for p in all_p)

    ward_dist = {}
    dept_dist = {}
    for p in all_p:
        w = p.get("ward", "Unknown")
        ward_dist[w] = ward_dist.get(w, 0) + 1
        d = p.get("department", "Unknown")
        dept_dist[d] = dept_dist.get(d, 0) + 1

    pending_updates = len(db.get_collection("project_updates").find({"status": "PENDING_REVIEW"}))
    unverified_obs = len(db.get_collection("citizen_observations").find({"verificationStatus": "UNVERIFIED"}))

    return jsonify({
        "success": True,
        "stats": {
            "totalProjects": total_projects,
            "publishedProjects": published,
            "draftProjects": drafts,
            "statusCounts": status_counts,
            "totalBudgetAllocated": total_allocated,
            "totalBudgetExpenditure": total_spent,
            "wardDistribution": ward_dist,
            "departmentDistribution": dept_dist,
            "pendingUpdatesCount": pending_updates,
            "unverifiedObservationsCount": unverified_obs,
        },
    }), 200


# ── Create project ─────────────────────────────────────────────
@government_bp.route("/projects", methods=["POST"])
def create_project():
    user = get_current_user()
    if not is_govt_admin(user):
        return jsonify({"success": False, "error": "Government Admin authorization required."}), 403

    data = request.get_json() or {}
    errors = validate_project_data(data, is_create=True)
    if errors:
        return jsonify({"success": False, "errors": errors}), 400

    db = get_db()

    # Validate contractor if provided
    contractor_id = (data.get("contractorId") or "").strip()
    contractor_name = ""
    if contractor_id:
        con = db.get_collection("contractors").find_one({"id": contractor_id})
        if not con:
            return jsonify({"success": False, "errors": ["Selected contractor not found."]}), 400
        contractor_name = con.get("companyName", "")

    proj_id = f"proj-{uuid.uuid4().hex[:6]}"
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"

    allocated = int(float(data.get("allocatedBudget", 0)))
    released = int(float(data.get("releasedBudget", allocated)))
    expenditure = int(float(data.get("reportedExpenditure", 0)))

    lat = data.get("lat")
    lng = data.get("lng")
    location = {
        "address": data.get("locationAddress", f"{data.get('ward', '')}, Bengaluru"),
        "lat": float(lat) if lat is not None else None,
        "lng": float(lng) if lng is not None else None,
    }

    is_published = bool(data.get("isPublished", False))

    new_project = {
        "id": proj_id,
        "name": data.get("name", "").strip(),
        "description": data.get("description", "").strip(),
        "category": data.get("category", "").strip(),
        "department": data.get("department", "").strip(),
        "ward": data.get("ward", "").strip(),
        "location": location,
        "budget": {
            "allocated": allocated,
            "released": released,
            "reportedExpenditure": expenditure,
            "remaining": released - expenditure,
            "year": data.get("budgetYear", "2025-2026"),
            "source": data.get("budgetSource", ""),
        },
        "startDate": data.get("startDate", ""),
        "expectedCompletionDate": data.get("expectedCompletionDate", ""),
        "actualCompletionDate": None,
        "officialProgress": 0,
        "status": data.get("status", "PLANNED"),
        "contractorId": contractor_id or None,
        "contractorName": contractor_name or data.get("contractorName", ""),
        "isPublished": is_published,
        "milestones": [],
        "sources": [],
        "createdBy": user.get("userId"),
        "createdAt": now_iso,
        "updatedAt": now_iso,
    }

    db.get_collection("projects").insert_one(new_project)

    audit(db, proj_id, "PROJECT_CREATED",
          f"Project '{new_project['name']}' created by {user.get('name')} "
          f"({'Published' if is_published else 'Draft'}).",
          user, f"Work Order #{proj_id}")

    return jsonify({"success": True, "message": "Project created.", "project": new_project}), 201


# ── Update project ─────────────────────────────────────────────
@government_bp.route("/projects/<project_id>", methods=["PUT"])
def update_project(project_id):
    user = get_current_user()
    if not is_govt_admin(user):
        return jsonify({"success": False, "error": "Government Admin authorization required."}), 403

    data = request.get_json() or {}
    errors = validate_project_data(data, is_create=False)
    if errors:
        return jsonify({"success": False, "errors": errors}), 400

    db = get_db()
    projects_col = db.get_collection("projects")
    project = projects_col.find_one({"id": project_id})
    if not project:
        return jsonify({"success": False, "error": "Project not found."}), 404

    # Validate contractor if being changed
    contractor_id = data.get("contractorId")
    contractor_name = project.get("contractorName", "")
    if contractor_id and contractor_id != project.get("contractorId"):
        con = db.get_collection("contractors").find_one({"id": contractor_id})
        if not con:
            return jsonify({"success": False, "errors": ["Selected contractor not found."]}), 400
        contractor_name = con.get("companyName", "")

    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    update_fields = {"updatedAt": now_iso}

    simple_fields = [
        "name", "description", "category", "department", "ward",
        "startDate", "expectedCompletionDate", "status",
        "officialProgress", "milestones", "sources",
    ]
    for field in simple_fields:
        if field in data:
            update_fields[field] = data[field]

    if contractor_id is not None:
        update_fields["contractorId"] = contractor_id
        update_fields["contractorName"] = contractor_name

    # Budget
    if any(k in data for k in ("allocatedBudget", "releasedBudget", "reportedExpenditure", "budgetYear", "budgetSource")):
        eb = project.get("budget", {})
        allocated = int(float(data.get("allocatedBudget", eb.get("allocated", 0))))
        released = int(float(data.get("releasedBudget", eb.get("released", allocated))))
        expenditure = int(float(data.get("reportedExpenditure", eb.get("reportedExpenditure", 0))))
        update_fields["budget"] = {
            "allocated": allocated,
            "released": released,
            "reportedExpenditure": expenditure,
            "remaining": released - expenditure,
            "year": data.get("budgetYear", eb.get("year", "2025-2026")),
            "source": data.get("budgetSource", eb.get("source", "")),
        }

    # Location
    if any(k in data for k in ("lat", "lng", "locationAddress")):
        el = project.get("location", {})
        lat = data.get("lat")
        lng = data.get("lng")
        update_fields["location"] = {
            "address": data.get("locationAddress", el.get("address", "")),
            "lat": float(lat) if lat is not None else el.get("lat"),
            "lng": float(lng) if lng is not None else el.get("lng"),
        }

    # Publish state
    if "isPublished" in data:
        old_published = project.get("isPublished", False)
        new_published = bool(data["isPublished"])
        update_fields["isPublished"] = new_published
        if old_published != new_published:
            action = "PROJECT_PUBLISHED" if new_published else "PROJECT_UNPUBLISHED"
            audit(db, project_id, action,
                  f"Project '{project.get('name')}' {'published' if new_published else 'unpublished'} by {user.get('name')}.",
                  user)

    projects_col.update_one({"id": project_id}, {"$set": update_fields})
    audit(db, project_id, "PROJECT_UPDATED",
          f"Project '{project.get('name')}' updated by {user.get('name')}.", user)

    updated = projects_col.find_one({"id": project_id})
    return jsonify({"success": True, "message": "Project updated.", "project": updated}), 200


# ── Publish / Unpublish shortcut ───────────────────────────────
@government_bp.route("/projects/<project_id>/publish", methods=["POST"])
def toggle_publish(project_id):
    user = get_current_user()
    if not is_govt_admin(user):
        return jsonify({"success": False, "error": "Government Admin authorization required."}), 403

    data = request.get_json() or {}
    publish = bool(data.get("publish", True))

    db = get_db()
    projects_col = db.get_collection("projects")
    project = projects_col.find_one({"id": project_id})
    if not project:
        return jsonify({"success": False, "error": "Project not found."}), 404

    projects_col.update_one({"id": project_id}, {"$set": {
        "isPublished": publish,
        "updatedAt": datetime.datetime.utcnow().isoformat() + "Z",
    }})
    action = "PROJECT_PUBLISHED" if publish else "PROJECT_UNPUBLISHED"
    audit(db, project_id, action,
          f"Project '{project.get('name')}' {'published' if publish else 'unpublished'} by {user.get('name')}.", user)

    return jsonify({"success": True, "message": f"Project {'published' if publish else 'unpublished'}."}), 200


# ── Delete project ─────────────────────────────────────────────
@government_bp.route("/projects/<project_id>", methods=["DELETE"])
def delete_project(project_id):
    user = get_current_user()
    if not is_govt_admin(user):
        return jsonify({"success": False, "error": "Government Admin authorization required."}), 403

    db = get_db()
    projects_col = db.get_collection("projects")
    project = projects_col.find_one({"id": project_id})
    if not project:
        return jsonify({"success": False, "error": "Project not found."}), 404

    projects_col.delete_one({"id": project_id})
    audit(db, project_id, "PROJECT_DELETED",
          f"Project '{project.get('name')}' permanently deleted by {user.get('name')}.", user)

    return jsonify({"success": True, "message": "Project deleted."}), 200


# ── Admin project list ─────────────────────────────────────────
@government_bp.route("/projects", methods=["GET"])
def list_projects_admin():
    user = get_current_user()
    if not is_govt_admin(user):
        return jsonify({"success": False, "error": "Government Admin authorization required."}), 403

    db = get_db()
    all_projects = db.get_collection("projects").find({})

    status_filter = request.args.get("status", "").strip()
    dept_filter = request.args.get("department", "").strip()
    pub_filter = request.args.get("published", "").strip()  # "true" / "false" / ""
    search = request.args.get("search", "").strip().lower()

    filtered = []
    for p in all_projects:
        if status_filter and p.get("status", "").upper() != status_filter.upper():
            continue
        if dept_filter and p.get("department", "").lower() != dept_filter.lower():
            continue
        if pub_filter == "true" and not p.get("isPublished"):
            continue
        if pub_filter == "false" and p.get("isPublished"):
            continue
        if search:
            haystack = " ".join([
                p.get("name", ""), p.get("ward", ""), p.get("department", "")
            ]).lower()
            if search not in haystack:
                continue
        filtered.append(p)

    return jsonify({"success": True, "count": len(filtered), "projects": filtered}), 200


# ── Lookup endpoints for form dropdowns ───────────────────────
@government_bp.route("/contractors", methods=["GET"])
def list_contractors():
    user = get_current_user()
    if not is_govt_admin(user):
        return jsonify({"success": False, "error": "Government Admin authorization required."}), 403
    contractors = list(db_get().get_collection("contractors").find({}))
    return jsonify({"success": True, "contractors": contractors}), 200


@government_bp.route("/departments", methods=["GET"])
def list_departments():
    user = get_current_user()
    if not is_govt_admin(user):
        return jsonify({"success": False, "error": "Government Admin authorization required."}), 403
    depts = list(db_get().get_collection("departments").find({}))
    return jsonify({"success": True, "departments": depts}), 200


@government_bp.route("/wards", methods=["GET"])
def list_wards():
    user = get_current_user()
    if not is_govt_admin(user):
        return jsonify({"success": False, "error": "Government Admin authorization required."}), 403
    wards = list(db_get().get_collection("wards").find({}))
    return jsonify({"success": True, "wards": wards}), 200


def db_get():
    """Shorthand for get_db() — avoids repetitive import in helpers."""
    return get_db()


# ── Contractor update review ───────────────────────────────────
@government_bp.route("/contractor-updates/<update_id>/review", methods=["POST"])
def review_contractor_update(update_id):
    user = get_current_user()
    if not is_govt_admin(user):
        return jsonify({"success": False, "error": "Government Admin authorization required."}), 403

    data = request.get_json() or {}
    action = data.get("action", "").upper()
    notes = data.get("notes", "")

    if action not in ("APPROVED", "REJECTED"):
        return jsonify({"success": False, "error": "Action must be APPROVED or REJECTED."}), 400

    db = get_db()
    updates_col = db.get_collection("project_updates")
    update = updates_col.find_one({"id": update_id})
    if not update:
        return jsonify({"success": False, "error": "Contractor update not found."}), 404

    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    updates_col.update_one({"id": update_id}, {"$set": {
        "status": action,
        "reviewedBy": user.get("name"),
        "reviewDate": now_iso,
        "reviewNotes": notes,
    }})

    if action == "APPROVED":
        projects_col = db.get_collection("projects")
        proj = projects_col.find_one({"id": update["projectId"]})
        if proj:
            new_pct = update.get("progressPercentage", 0)
            new_status = "COMPLETED" if new_pct >= 100 else proj.get("status", "ONGOING")
            projects_col.update_one({"id": update["projectId"]}, {"$set": {
                "officialProgress": new_pct,
                "status": new_status,
                "updatedAt": now_iso,
            }})
        audit(db, update["projectId"], "CONTRACTOR_UPDATE_APPROVED",
              f"Admin approved contractor update of {update.get('progressPercentage')}%. Notes: {notes}",
              user)

    return jsonify({"success": True, "message": f"Contractor update marked {action}."}), 200


# ── Citizen observation verify ─────────────────────────────────
@government_bp.route("/citizen-observations/<obs_id>/verify", methods=["POST"])
def verify_citizen_observation(obs_id):
    user = get_current_user()
    if not is_govt_admin(user):
        return jsonify({"success": False, "error": "Government Admin authorization required."}), 403

    data = request.get_json() or {}
    status = data.get("status", "VERIFIED").upper()

    db = get_db()
    obs_col = db.get_collection("citizen_observations")
    obs = obs_col.find_one({"id": obs_id})
    if not obs:
        return jsonify({"success": False, "error": "Observation not found."}), 404

    obs_col.update_one({"id": obs_id}, {"$set": {"verificationStatus": status}})
    audit(db, obs.get("projectId", ""), f"OBSERVATION_{status}",
          f"Observation by {obs.get('citizenName')} marked {status} by {user.get('name')}.",
          user)

    return jsonify({"success": True, "message": f"Observation status updated to {status}."}), 200
