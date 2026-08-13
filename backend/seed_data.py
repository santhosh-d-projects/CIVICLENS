"""
CivicLens demo data seeder — Milestone 2 edition.
Idempotent: re-running never creates duplicate records.
All data is clearly demo/sample — no real government claims.
"""
import logging
from werkzeug.security import generate_password_hash
from db import get_db

logger = logging.getLogger("civiclens.seed")


def seed_database():
    db = get_db()
    users_col = db.get_collection("users")

    logger.info("Seeding/Updating CivicLens Milestone 2 demo dataset...")

    demo_hash = generate_password_hash("Demo@123")
    std_hash = generate_password_hash("password123")

    # ── 1. Users ──────────────────────────────────────────────
    users = [
        {
            "id": "u-cit-demo",
            "name": "Citizen User",
            "email": "citizen@civiclens.demo",
            "phone": "+91 9876543210",
            "password": demo_hash,
            "role": "CITIZEN",
            "city": "Bengaluru",
            "ward": "Indiranagar (Ward 112)",
            "followedProjects": [],
            "isActive": True,
        },
        {
            "id": "u-con-demo",
            "name": "Rajesh Infra & Construction",
            "companyName": "Rajesh Infra & Construction Pvt Ltd",
            "representativeName": "Rajesh Kumar",
            "registrationId": "KA-BBMP-CON-2024-8891",
            "email": "contractor@civiclens.demo",
            "phone": "+91 9811223344",
            "password": demo_hash,
            "role": "CONTRACTOR",
            "isActive": True,
        },
        {
            "id": "u-gov-demo",
            "name": "Dr. Ramesh (BBMP Chief Engineer)",
            "email": "government@civiclens.demo",
            "phone": "+91 9444455555",
            "password": demo_hash,
            "role": "GOVERNMENT_ADMIN",
            "department": "BBMP Road Infrastructure",
            "city": "Bengaluru",
            "isActive": True,
        },
        {
            "id": "u-con-1",
            "name": "Apex Urban Projects India",
            "companyName": "Apex Urban Projects India",
            "representativeName": "Suresh Babu",
            "registrationId": "KA-PWD-CON-2023-4410",
            "email": "apex@urbanprojects.in",
            "phone": "+91 9800001111",
            "password": std_hash,
            "role": "CONTRACTOR",
            "isActive": True,
        },
        {
            "id": "u-gov-1",
            "name": "Priya Menon (PWD Engineer)",
            "email": "priya@pwd.gov.in",
            "phone": "+91 9900112233",
            "password": std_hash,
            "role": "GOVERNMENT_ADMIN",
            "department": "Public Works Department",
            "city": "Bengaluru",
            "isActive": True,
        },
        {
            "id": "u-adm-1",
            "name": "CivicLens System Admin",
            "email": "admin@civiclens.org",
            "phone": "+91 9999900000",
            "password": std_hash,
            "role": "CIVICLENS_ADMIN",
            "isActive": True,
        },
    ]
    for u in users:
        if not users_col.find_one({"email": u["email"]}):
            users_col.insert_one(u)
        else:
            users_col.update_one({"email": u["email"]}, {"$set": u})

    # ── 2. Departments ────────────────────────────────────────
    depts_col = db.get_collection("departments")
    depts = [
        {"id": "dept-1", "name": "BBMP Road Infrastructure",             "code": "BBMP-ROAD"},
        {"id": "dept-2", "name": "BBMP Stormwater Drain (SWD)",           "code": "BBMP-SWD"},
        {"id": "dept-3", "name": "Bangalore Water Supply & Sewerage Board (BWSSB)", "code": "BWSSB"},
        {"id": "dept-4", "name": "BESCOM Electrical Infrastructure",      "code": "BESCOM"},
        {"id": "dept-5", "name": "DULT Urban Transport Authority",        "code": "DULT"},
        {"id": "dept-6", "name": "Municipal Administration",              "code": "MUN-ADM"},
        {"id": "dept-7", "name": "Public Works Department",               "code": "PWD"},
        {"id": "dept-8", "name": "Health Department",                     "code": "HEALTH"},
        {"id": "dept-9", "name": "Education Department",                  "code": "EDUC"},
        {"id": "dept-10","name": "Waste Management",                      "code": "WASTE"},
    ]
    for d in depts:
        if not depts_col.find_one({"id": d["id"]}):
            depts_col.insert_one(d)
        else:
            depts_col.update_one({"id": d["id"]}, {"$set": d})

    # ── 3. Wards ──────────────────────────────────────────────
    wards_col = db.get_collection("wards")
    wards = [
        {"id": "w-1",  "name": "Indiranagar (Ward 112)",   "city": "Bengaluru"},
        {"id": "w-2",  "name": "Koramangala (Ward 151)",   "city": "Bengaluru"},
        {"id": "w-3",  "name": "Whitefield (Ward 84)",     "city": "Bengaluru"},
        {"id": "w-4",  "name": "Jayanagar (Ward 153)",     "city": "Bengaluru"},
        {"id": "w-5",  "name": "Malleshwaram (Ward 65)",   "city": "Bengaluru"},
        {"id": "w-6",  "name": "Ward 1",   "city": "Bengaluru"},
        {"id": "w-7",  "name": "Ward 2",   "city": "Bengaluru"},
        {"id": "w-8",  "name": "Ward 8",   "city": "Bengaluru"},
        {"id": "w-9",  "name": "Ward 12",  "city": "Bengaluru"},
        {"id": "w-10", "name": "Ward 15",  "city": "Bengaluru"},
    ]
    for w in wards:
        if not wards_col.find_one({"id": w["id"]}):
            wards_col.insert_one(w)
        else:
            wards_col.update_one({"id": w["id"]}, {"$set": w})

    # ── 4. Contractors ────────────────────────────────────────
    contractors_col = db.get_collection("contractors")
    contractors = [
        {
            "id": "con-1",
            "companyName": "Rajesh Infra & Construction Pvt Ltd",
            "representativeName": "Rajesh Kumar",
            "userId": "u-con-demo",
            "email": "contractor@civiclens.demo",
            "registrationId": "KA-BBMP-CON-2024-8891",
            "rating": 4.2,
        },
        {
            "id": "con-2",
            "companyName": "Apex Urban Projects India",
            "representativeName": "Suresh Babu",
            "userId": "u-con-1",
            "email": "apex@urbanprojects.in",
            "registrationId": "KA-PWD-CON-2023-4410",
            "rating": 4.6,
        },
        {
            "id": "con-3",
            "companyName": "ABC Constructions",
            "representativeName": "Arun Bhat",
            "userId": None,
            "email": "abc@constructions.demo",
            "registrationId": "KA-MC-CON-2022-1155",
            "rating": 3.9,
        },
    ]
    for c in contractors:
        if not contractors_col.find_one({"id": c["id"]}):
            contractors_col.insert_one(c)
        else:
            contractors_col.update_one({"id": c["id"]}, {"$set": c})

    # ── 5. Projects (5 demo projects) ─────────────────────────
    # Hero project: Ward 12 Road Development
    projects_col = db.get_collection("projects")
    projects = [
        {
            "id": "proj-001",
            "name": "Ward 12 Road Development",
            "description": (
                "Comprehensive road widening and resurfacing of 3.2 km stretch in Ward 12 "
                "including new footpaths, storm drain integration, and road markings."
            ),
            "category": "Roads",
            "department": "BBMP Road Infrastructure",
            "ward": "Ward 12",
            "location": {
                "address": "Main Road, Ward 12, Bengaluru",
                "lat": 12.9716,
                "lng": 77.5946,
            },
            "budget": {
                "allocated": 5000000,
                "released": 5000000,
                "reportedExpenditure": 0,
                "remaining": 5000000,
                "year": "2025-2026",
                "source": "BBMP Budget 2025-26 — Head 440-Roads (Demo data)",
            },
            "startDate": "2026-01-10",
            "expectedCompletionDate": "2026-06-30",
            "actualCompletionDate": None,
            "officialProgress": 70,
            "status": "ONGOING",
            "statusLabel": "Ongoing",
            "contractorId": "con-1",
            "contractorName": "Rajesh Infra & Construction Pvt Ltd",
            "isPublished": True,
            "milestones": [],
            "sources": [],
            "createdBy": "u-gov-demo",
            "createdAt": "2026-01-05T09:00:00Z",
            "updatedAt": "2026-01-05T09:00:00Z",
        },
        {
            "id": "proj-002",
            "name": "Ward 8 Drainage Improvement",
            "description": (
                "Remodeling and desilting of primary stormwater drain in Ward 8 to prevent "
                "seasonal flooding. Work includes channel clearing, culvert repair, and cover slabs."
            ),
            "category": "Drainage",
            "department": "BBMP Stormwater Drain (SWD)",
            "ward": "Ward 8",
            "location": {
                "address": "Canal Road, Ward 8, Bengaluru",
                "lat": 12.9500,
                "lng": 77.5700,
            },
            "budget": {
                "allocated": 3500000,
                "released": 3500000,
                "reportedExpenditure": 0,
                "remaining": 3500000,
                "year": "2025-2026",
                "source": "SWD Flood Mitigation Fund (Demo data)",
            },
            "startDate": "2026-02-01",
            "expectedCompletionDate": "2026-07-31",
            "actualCompletionDate": None,
            "officialProgress": 0,
            "status": "PLANNED",
            "statusLabel": "Planned",
            "contractorId": "con-2",
            "contractorName": "Apex Urban Projects India",
            "isPublished": True,
            "milestones": [],
            "sources": [],
            "createdBy": "u-gov-demo",
            "createdAt": "2026-01-20T10:00:00Z",
            "updatedAt": "2026-01-20T10:00:00Z",
        },
        {
            "id": "proj-003",
            "name": "Government School Renovation — Ward 4",
            "description": (
                "Renovation of Govt Primary School in Ward 4: new classrooms, toilet blocks, "
                "drinking water facility, and boundary wall. Benefiting 600+ students."
            ),
            "category": "Education",
            "department": "Education Department",
            "ward": "Ward 1",
            "location": {
                "address": "School Road, Ward 4, Bengaluru",
                "lat": 12.9800,
                "lng": 77.5600,
            },
            "budget": {
                "allocated": 1800000,
                "released": 1800000,
                "reportedExpenditure": 0,
                "remaining": 1800000,
                "year": "2025-2026",
                "source": "State Education Infrastructure Grant (Demo data)",
            },
            "startDate": "2026-03-01",
            "expectedCompletionDate": "2026-09-30",
            "actualCompletionDate": None,
            "officialProgress": 0,
            "status": "PLANNED",
            "statusLabel": "Planned",
            "contractorId": "con-1",
            "contractorName": "Rajesh Infra & Construction Pvt Ltd",
            "isPublished": True,
            "milestones": [],
            "sources": [],
            "createdBy": "u-gov-1",
            "createdAt": "2026-02-10T11:00:00Z",
            "updatedAt": "2026-02-10T11:00:00Z",
        },
        {
            "id": "proj-004",
            "name": "Streetlight Installation — Ward 15",
            "description": (
                "Installation of 240 LED streetlights on 8 km of roads in Ward 15 "
                "to improve night safety. Includes underground cabling and smart switching."
            ),
            "category": "Streetlights",
            "department": "BESCOM Electrical Infrastructure",
            "ward": "Ward 15",
            "location": {
                "address": "Ward 15 Main Roads, Bengaluru",
                "lat": 12.9400,
                "lng": 77.6100,
            },
            "budget": {
                "allocated": 2200000,
                "released": 2200000,
                "reportedExpenditure": 0,
                "remaining": 2200000,
                "year": "2025-2026",
                "source": "BESCOM Electrification Fund 2025-26 (Demo data)",
            },
            "startDate": "2026-01-15",
            "expectedCompletionDate": "2026-05-31",
            "actualCompletionDate": None,
            "officialProgress": 0,
            "status": "ONGOING",
            "statusLabel": "Ongoing",
            "contractorId": "con-2",
            "contractorName": "Apex Urban Projects India",
            "isPublished": True,
            "milestones": [],
            "sources": [],
            "createdBy": "u-gov-demo",
            "createdAt": "2026-01-10T08:00:00Z",
            "updatedAt": "2026-01-10T08:00:00Z",
        },
        {
            "id": "proj-005",
            "name": "Community Water Supply — Ward 2",
            "description": (
                "Underground water supply pipeline (2.4 km) for Ward 2, connecting 1,200 households "
                "to municipal piped water for the first time. Includes 3 elevated storage tanks."
            ),
            "category": "Water Supply",
            "department": "Bangalore Water Supply & Sewerage Board (BWSSB)",
            "ward": "Ward 2",
            "location": {
                "address": "Ward 2 Residential Area, Bengaluru",
                "lat": 12.9600,
                "lng": 77.5800,
            },
            "budget": {
                "allocated": 7500000,
                "released": 7500000,
                "reportedExpenditure": 0,
                "remaining": 7500000,
                "year": "2025-2026",
                "source": "AMRUT 2.0 Water Supply Fund (Demo data)",
            },
            "startDate": "2025-12-01",
            "expectedCompletionDate": "2026-11-30",
            "actualCompletionDate": None,
            "officialProgress": 30,
            "status": "ONGOING",
            "statusLabel": "Ongoing",
            "contractorId": "con-3",
            "contractorName": "ABC Constructions",
            "isPublished": True,
            "milestones": [],
            "sources": [],
            "createdBy": "u-gov-1",
            "createdAt": "2025-11-20T09:00:00Z",
            "updatedAt": "2025-11-20T09:00:00Z",
        },
        # Legacy M1 projects (kept for backward compat, now with isPublished)
        {
            "id": "proj-101",
            "name": "100 Feet Road Tender SURE White-Topping & Duct Work",
            "description": (
                "Comprehensive white-topping of 2.8 km stretch on 100 Feet Road Indiranagar "
                "including utility ducting, footpaths, and rainwater harvesting channels."
            ),
            "category": "Roads",
            "department": "BBMP Road Infrastructure",
            "ward": "Indiranagar (Ward 112)",
            "location": {"lat": 12.9784, "lng": 77.6408, "address": "100 Feet Road, Indiranagar, Bengaluru"},
            "budget": {
                "allocated": 6500000,
                "released": 5800000,
                "reportedExpenditure": 4200000,
                "remaining": 2300000,
                "year": "2025-2026",
                "source": "BBMP Municipal Budget 2025-26, Head 440-Roads, Page 118 (Demo data)",
            },
            "startDate": "2025-11-01",
            "expectedCompletionDate": "2026-06-30",
            "actualCompletionDate": None,
            "officialProgress": 72,
            "status": "ONGOING",
            "statusLabel": "Ongoing",
            "contractorId": "con-1",
            "contractorName": "Rajesh Infra & Construction Pvt Ltd",
            "isPublished": True,
            "milestones": [
                {"title": "Utility Mapping & Survey",           "dueDate": "2025-12-01", "status": "Completed", "progress": 100},
                {"title": "Sub-grade Preparation & Milling",   "dueDate": "2026-02-15", "status": "Completed", "progress": 100},
                {"title": "Concrete White-topping Layer 1",    "dueDate": "2026-04-30", "status": "Completed", "progress": 100},
                {"title": "Pedestrian Footpath & Ducting",     "dueDate": "2026-06-15", "status": "Ongoing",   "progress": 40},
                {"title": "Final Curing & Lane Marking",       "dueDate": "2026-06-30", "status": "Pending",   "progress": 0},
            ],
            "sources": [
                {"title": "Official Tender Notification PDF", "url": "/docs/indiranagar_tender.pdf",
                 "type": "Official Government Document", "page": "8"},
            ],
            "createdBy": "u-gov-demo",
            "createdAt": "2025-10-15T10:00:00Z",
            "updatedAt": "2026-08-10T14:30:00Z",
        },
        {
            "id": "proj-102",
            "name": "Koramangala 4th Block SWD Drain Box Culvert Reinforcement",
            "description": (
                "Remodeling and height raising of 1.4 km Primary Stormwater Drain box culvert "
                "to prevent urban flash flooding."
            ),
            "category": "Drainage",
            "department": "BBMP Stormwater Drain (SWD)",
            "ward": "Koramangala (Ward 151)",
            "location": {"lat": 12.9348, "lng": 77.6253, "address": "80 Feet Road Junction, Koramangala 4th Block"},
            "budget": {
                "allocated": 4800000,
                "released": 4500000,
                "reportedExpenditure": 4100000,
                "remaining": 700000,
                "year": "2025-2026",
                "source": "SWD Flood Mitigation Fund Sanction Order #SWD/2025/90 (Demo data)",
            },
            "startDate": "2026-01-10",
            "expectedCompletionDate": "2026-09-15",
            "actualCompletionDate": None,
            "officialProgress": 85,
            "status": "ONGOING",
            "statusLabel": "Ongoing",
            "contractorId": "con-2",
            "contractorName": "Apex Urban Projects India",
            "isPublished": True,
            "milestones": [
                {"title": "Desilting & Channel Excavation",       "dueDate": "2026-02-28", "status": "Completed", "progress": 100},
                {"title": "Concrete Retaining Wall Casting",      "dueDate": "2026-05-31", "status": "Completed", "progress": 100},
            ],
            "sources": [
                {"title": "SWD Master Plan Blueprint 2025", "url": "/docs/swd_koramangala.pdf",
                 "type": "Official Blueprint", "page": "14"},
            ],
            "createdBy": "u-gov-demo",
            "createdAt": "2026-01-05T09:00:00Z",
            "updatedAt": "2026-08-11T16:00:00Z",
        },
        {
            "id": "proj-301",
            "name": "Civic Center Solar Installation",
            "description": (
                "Installation of 50kW grid-connected rooftop solar panels at the Ward 12 Civic Center "
                "to provide renewable power and reduce utility costs. (CivicLens Demonstration Data)"
            ),
            "category": "Solar Energy",
            "department": "BBMP Electrical Department",
            "ward": "Ward 12",
            "location": {"lat": 12.9715, "lng": 77.5940, "address": "Civic Center, Ward 12, Bengaluru"},
            "budget": {
                "allocated": 1500000,
                "released": 1500000,
                "reportedExpenditure": 1500000,
                "remaining": 0,
                "year": "2025-2026",
                "source": "State Solar Subsidy Scheme (Demo data)",
            },
            "startDate": "2026-02-01",
            "expectedCompletionDate": "2026-08-01",
            "actualCompletionDate": "2026-08-01",
            "officialProgress": 100,
            "status": "COMPLETED",
            "statusLabel": "Completed",
            "contractorId": "con-3",
            "contractorName": "ABC Constructions",
            "isPublished": True,
            "milestones": [
                {"title": "Feasibility & Roof Prep", "dueDate": "2026-03-01", "status": "Completed", "progress": 100},
                {"title": "Panel & Inverter Assembly", "dueDate": "2026-06-01", "status": "Completed", "progress": 100},
                {"title": "Grid Connection & Testing", "dueDate": "2026-08-01", "status": "Completed", "progress": 100},
            ],
            "sources": [],
            "createdBy": "u-gov-demo",
            "createdAt": "2026-01-15T09:00:00Z",
            "updatedAt": "2026-08-01T10:00:00Z",
        }
    ]
    for p in projects:
        projects_col.update_one({"id": p["id"]}, {"$set": p}, upsert=True)

    # ── 6. Project Updates ─────────────────────────────────────
    updates_col = db.get_collection("project_updates")
    updates_col.delete_many({"id": {"$nin": ["upd-demo-approved", "upd-demo-pending"]}})
    updates = [
        {
            "id": "upd-demo-approved",
            "projectId": "proj-001",
            "projectName": "Ward 12 Road Development",
            "contractorId": "con-1",
            "contractorName": "Rajesh Infra & Construction Pvt Ltd",
            "submittedBy": "Arun Bhat",
            "progressPercentage": 70,
            "description": "Road excavation, leveling and primary grading completed across the full stretch.",
            "milestone": "Excavation and Grading",
            "delayReason": "",
            "evidence": [
                {
                    "fileName": "site_grading_complete.jpg",
                    "fileType": "JPG",
                    "fileReference": "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80",
                    "uploadedBy": "Arun Bhat",
                    "uploadedAt": "2026-08-05T10:00:00Z"
                }
            ],
            "status": "APPROVED",
            "governmentComment": "Site verified. Works match the reported progress level.",
            "reviewedBy": "Dr. Ramesh (BBMP Chief Engineer)",
            "reviewedAt": "2026-08-06T15:30:00Z",
            "submittedAt": "2026-08-05T10:00:00Z",
            "updatedAt": "2026-08-06T15:30:00Z"
        },
        {
            "id": "upd-demo-pending",
            "projectId": "proj-001",
            "projectName": "Ward 12 Road Development",
            "contractorId": "con-1",
            "contractorName": "Rajesh Infra & Construction Pvt Ltd",
            "submittedBy": "Arun Bhat",
            "progressPercentage": 75,
            "description": "Secondary grading, curb stone installation and utility duct alignment progress.",
            "milestone": "Curb and Ducting",
            "delayReason": "Shortage of raw material transport delays caused minor curb casting setbacks.",
            "evidence": [
                {
                    "fileName": "curbs_and_ducting.jpg",
                    "fileType": "JPG",
                    "fileReference": "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80",
                    "uploadedBy": "Arun Bhat",
                    "uploadedAt": "2026-08-12T11:00:00Z"
                }
            ],
            "status": "PENDING",
            "governmentComment": None,
            "reviewedBy": None,
            "reviewedAt": None,
            "submittedAt": "2026-08-12T11:00:00Z",
            "updatedAt": "2026-08-12T11:00:00Z"
        }
    ]
    for u in updates:
        updates_col.update_one({"id": u["id"]}, {"$set": u}, upsert=True)

    # ── 7. Citizen Observations ────────────────────────────────
    obs_col = db.get_collection("citizen_observations")
    obs_col.delete_many({"id": {"$nin": ["obs-demo-1", "obs-demo-2", "obs-demo-3"]}})
    observations = [
        {
            "id": "obs-demo-1",
            "projectId": "proj-001",
            "projectName": "Ward 12 Road Development",
            "citizenId": "u-cit-demo",
            "citizenName": "Citizen Observation",
            "citizenEmail": "citizen@civiclens.demo",
            "observationType": "PROGRESS_OBSERVATION",
            "description": "The western section of the road near the school appears unfinished. (CivicLens Demonstration Data)",
            "observationText": "The western section of the road near the school appears unfinished. (CivicLens Demonstration Data)",
            "location": {
                "description": "Near Ward 12 Government School",
                "lat": 12.9718,
                "lng": 77.5948
            },
            "evidence": [
                {
                    "fileName": "unfinished_road.jpg",
                    "fileType": "JPG",
                    "fileReference": "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80",
                    "uploadedBy": "Citizen",
                    "uploadedAt": "2026-08-12T12:00:00Z"
                }
            ],
            "photoUrl": "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80",
            "status": "SUBMITTED",
            "verificationStatus": "SUBMITTED",
            "createdAt": "2026-08-12T12:00:00Z",
            "updatedAt": "2026-08-12T12:00:00Z"
        },
        {
            "id": "obs-demo-2",
            "projectId": "proj-001",
            "projectName": "Ward 12 Road Development",
            "citizenId": "u-cit-demo",
            "citizenName": "Citizen Observation",
            "citizenEmail": "citizen@civiclens.demo",
            "observationType": "SITE_CONDITION",
            "description": "Drainage work is still visible along the northern side of the road. (CivicLens Demonstration Data)",
            "observationText": "Drainage work is still visible along the northern side of the road. (CivicLens Demonstration Data)",
            "location": {
                "description": "Northern Stretch, Ward 12",
                "lat": 12.9720,
                "lng": 77.5950
            },
            "evidence": [],
            "photoUrl": "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80",
            "status": "ACKNOWLEDGED",
            "verificationStatus": "ACKNOWLEDGED",
            "governmentComment": "Observation received and referred for site verification. (CivicLens Demonstration Data)",
            "reviewedBy": "Dr. Ramesh (BBMP Chief Engineer)",
            "reviewedAt": "2026-08-12T16:00:00Z",
            "createdAt": "2026-08-12T13:00:00Z",
            "updatedAt": "2026-08-12T16:00:00Z"
        },
        {
            "id": "obs-demo-3",
            "projectId": "proj-001",
            "projectName": "Ward 12 Road Development",
            "citizenId": "u-cit-demo",
            "citizenName": "Citizen Observation",
            "citizenEmail": "citizen@civiclens.demo",
            "observationType": "COMPLETION_OBSERVATION",
            "description": "Traffic is currently using the completed section while construction continues near the junction. (CivicLens Demonstration Data)",
            "observationText": "Traffic is currently using the completed section while construction continues near the junction. (CivicLens Demonstration Data)",
            "location": {
                "description": "Junction Area, Ward 12",
                "lat": 12.9712,
                "lng": 77.5942
            },
            "evidence": [],
            "photoUrl": "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80",
            "status": "SUBMITTED",
            "verificationStatus": "SUBMITTED",
            "createdAt": "2026-08-12T14:00:00Z",
            "updatedAt": "2026-08-12T14:00:00Z"
        }
    ]
    for o in observations:
        if not obs_col.find_one({"id": o["id"]}):
            obs_col.insert_one(o)
        else:
            obs_col.update_one({"id": o["id"]}, {"$set": o})

    logger.info("CivicLens Milestone 4 demo data seeded successfully.")


if __name__ == "__main__":
    seed_database()
