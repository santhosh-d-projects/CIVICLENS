import uuid
from typing import Dict, Any

def generate_id(prefix: str = "id") -> str:
    """Generate a unique ID with a given prefix."""
    return f"{prefix}_{uuid.uuid4().hex[:8]}"

def sanitize_metadata(metadata: Dict[str, Any]) -> Dict[str, Any]:
    """Ensure metadata contains expected defaults."""
    defaults = {
        "documentId": "DOC_UNKNOWN",
        "projectId": "P000",
        "documentName": "Unknown Document",
        "documentType": "Report",
        "sourceOrganization": "CivicLens Govt Dept",
        "publicationDate": "2026-01-01",
        "pageNumber": 1,
        "fileName": "unknown.pdf"
    }
    merged = defaults.copy()
    merged.update(metadata)
    return merged
