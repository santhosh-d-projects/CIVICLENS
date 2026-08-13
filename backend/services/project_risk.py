import datetime
import logging

logger = logging.getLogger("civiclens.risk")

def parse_date(date_str):
    if not date_str:
        return None
    if isinstance(date_str, datetime.date):
        return date_str
    if isinstance(date_str, datetime.datetime):
        return date_str.date()
    try:
        # Standard ISO date format
        return datetime.datetime.strptime(date_str.split('T')[0], "%Y-%m-%d").date()
    except Exception as e:
        logger.debug(f"Failed to parse date '{date_str}': {e}")
        return None

def calculate_expected_progress(start_date, completion_date, today):
    """
    Calculate the expected progress percentage based on elapsed time.
    """
    start = parse_date(start_date)
    comp = parse_date(completion_date)
    
    if not start or not comp:
        return 0
        
    if start >= comp:
        logger.warning(f"Invalid timeline: start date {start} >= completion date {comp}")
        return 0
        
    if today >= comp:
        return 100
        
    if today <= start:
        return 0
        
    total_days = (comp - start).days
    elapsed_days = (today - start).days
    
    if total_days <= 0:
        return 0
        
    pct = (elapsed_days / total_days) * 100
    return min(max(round(pct), 0), 100)

def assess_project_risk(project, citizen_observations=None, contractor_updates=None, today_override=None):
    """
    Deterministically assess project risk and return structured results with explanations.
    """
    # 1. Parse current assessment date
    if today_override:
        today = parse_date(today_override)
    else:
        today = datetime.datetime.utcnow().date()
        
    # 2. Extract Promise details
    project_id = project.get("id")
    start_date_str = project.get("startDate")
    completion_date_str = project.get("expectedCompletionDate")
    actual_completion_str = project.get("actualCompletionDate")
    budget_allocated = project.get("budget", {}).get("allocated") or 0
    
    promise = {
        "projectId": project_id,
        "promisedStartDate": start_date_str,
        "promisedCompletionDate": completion_date_str,
        "promisedBudget": budget_allocated,
        "originalStatus": project.get("status", "ONGOING")
    }

    # 3. Extract Reality details
    official_progress = project.get("officialProgress", 0)
    status = project.get("status", "ONGOING")
    
    obs_list = citizen_observations or []
    updates_list = contractor_updates or []
    
    # Calculate observations tallies
    obs_count = len(obs_list)
    ack_obs_count = sum(1 for o in obs_list if o.get("status") == "ACKNOWLEDGED")
    
    # Latest observation summary
    latest_obs = None
    if obs_list:
        sorted_obs = sorted(obs_list, key=lambda o: o.get("createdAt", ""), reverse=True)
        latest_obs = sorted_obs[0] if sorted_obs else None
        
    # Latest contractor updates
    latest_submission = None
    latest_approved = None
    if updates_list:
        sorted_updates = sorted(updates_list, key=lambda u: u.get("submittedAt", ""), reverse=True)
        if sorted_updates:
            latest_submission = sorted_updates[0]
        approved_updates = [u for u in updates_list if u.get("status") == "APPROVED"]
        if approved_updates:
            sorted_approved = sorted(approved_updates, key=lambda u: u.get("reviewedAt", ""), reverse=True)
            latest_approved = sorted_approved[0]

    reality = {
        "officialProgress": official_progress,
        "latestApprovedUpdate": latest_approved,
        "latestContractorSubmission": latest_submission,
        "projectStatus": status,
        "actualCompletionDate": actual_completion_str,
        "citizenObservationCount": obs_count,
        "acknowledgedObservationCount": ack_obs_count,
        "latestObservation": latest_obs,
        "currentDate": today.isoformat()
    }

    # 4. Calculation details
    start = parse_date(start_date_str)
    comp = parse_date(completion_date_str)
    
    expected_progress = 0
    reasons = []
    
    # Dates validity checks
    dates_valid = True
    if not start_date_str or not completion_date_str:
        dates_valid = False
        reasons.append("Timeline dates are missing.")
    elif not start or not comp:
        dates_valid = False
        reasons.append("Timeline dates format is invalid.")
    elif start > comp:
        dates_valid = False
        reasons.append("Invalid timeline configuration: start date is after expected completion date.")
        
    if dates_valid:
        expected_progress = calculate_expected_progress(start, comp, today)
    
    progress_gap = expected_progress - official_progress
    
    # 5. Risk Assessment State Machine Rules
    if status == "COMPLETED" or actual_completion_str or official_progress >= 100:
        risk_status = "COMPLETED"
        reasons.append("Project is marked completed.")
        if official_progress < 100:
            official_progress = 100 # auto sync
    elif not dates_valid:
        # Defaults to AT_RISK if dates are corrupted/missing
        risk_status = "AT_RISK"
    elif today > comp:
        risk_status = "BEHIND"
        reasons.append(f"Expected completion date ({completion_date_str}) has passed.")
        reasons.append(f"Project remains ongoing ({official_progress}% complete).")
        reasons.append(f"Expected progress is 100%.")
        reasons.append(f"Progress gap is {progress_gap} percentage points.")
    elif official_progress < expected_progress - 15:
        risk_status = "AT_RISK"
        reasons.append(f"Project progress ({official_progress}%) lags behind expected elapsed progress ({expected_progress}%).")
        reasons.append(f"Progress gap is {progress_gap} percentage points.")
    else:
        risk_status = "ON_TRACK"
        reasons.append(f"Project progress ({official_progress}%) is on track with the elapsed timeline (expected {expected_progress}%).")

    # 6. Add context-specific explanations
    # Contractor progress mismatch indicator
    if latest_submission and latest_submission.get("status") == "PENDING":
        proposed = latest_submission.get("progressPercentage", 0)
        if proposed != official_progress:
            reasons.append(f"Latest contractor progress submission is {proposed}% (pending verification).")
            reasons.append(f"Latest contractor progress differs from current government-verified progress ({official_progress}%).")
            
    # Active citizen observations context (neutral, counts-based, no status changes)
    if obs_count > 0:
        reasons.append(f"{obs_count} citizen observation{'s' if obs_count != 1 else ''} have been submitted.")
        reasons.append("Citizen observations provide additional ground-level information.")
        
        # Acknowledged tally
        if ack_obs_count > 0:
            reasons.append(f"{ack_obs_count} citizen observation{'s' if ack_obs_count != 1 else ''} acknowledged by Government.")
        
        # Awaiting review tally
        awaiting_count = sum(1 for o in obs_list if o.get("status") == "SUBMITTED")
        if awaiting_count > 0:
            reasons.append(f"{awaiting_count} citizen observation{'s' if awaiting_count != 1 else ''} awaiting government review.")

    # 7. Formulate risk score
    # Simple deterministic risk score (higher score = more completed/healthier)
    # Complete = 100, On Track = 80-99, At Risk = 40-79, Behind = 0-39
    if risk_status == "COMPLETED":
        score = 100
    elif risk_status == "ON_TRACK":
        score = max(80, 100 - max(0, progress_gap))
    elif risk_status == "AT_RISK":
        score = max(40, 79 - max(0, progress_gap))
    else: # BEHIND
        score = max(0, 39 - max(0, progress_gap - 30))

    assessment = {
        "status": risk_status,
        "score": score,
        "expectedProgress": expected_progress,
        "progressGap": progress_gap,
        "reasons": reasons
    }

    return {
        "projectId": project_id,
        "promise": promise,
        "reality": reality,
        "assessment": assessment
    }
