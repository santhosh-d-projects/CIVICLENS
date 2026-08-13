# CivicLens: Civic Transparency & Accountability Platform

> **PROMISE → FUND → PROGRESS → PROOF**

CivicLens is a role-based civic technology platform designed to bring source-backed transparency and accountability to local government infrastructure projects.

---

## 1. Project Purpose

CivicLens connects:
- **Government commitments** (What was promised & scheduled)
- **Project funding** (Budget allocated, released, and spent)
- **Contractor progress** (Work milestones, % updates, site photos)
- **Government verification** (Official review and audit status)
- **Citizen observations** (Ground-level proof and evidence)

---

## 2. Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router, Axios, Lucide Icons, Leaflet
- **Backend**: Python, Flask, Flask-CORS, PyMongo, PyJWT, Werkzeug (bcrypt password hashing)
- **Database**: MongoDB (with embedded JSON file storage driver fallback for zero-config operation)
- **Auth**: JWT Tokens & Role-Based Access Control (`CITIZEN`, `CONTRACTOR`, `GOVERNMENT_ADMIN`, `CIVICLENS_ADMIN`)

---

## 3. Repository Structure

```text
hackover-civiclens/
├── backend/
│   ├── app.py                      # Flask application entry point
│   ├── run.py                      # Server launcher script
│   ├── config.py                   # Environment configuration loader
│   ├── db.py                       # Hybrid MongoDB / JSON Storage client
│   ├── seed_data.py                # Development seed script for demo accounts & projects
│   ├── rag_engine.py               # RAG document indexing & citation engine
│   ├── middleware/
│   │   └── auth.py                 # @jwt_required and @role_required decorators
│   ├── routes/
│   │   ├── auth.py                 # Authentication endpoints (/api/auth/*)
│   │   ├── health.py               # Health check (/api/health)
│   │   ├── projects.py             # Projects directory & details (/api/projects/*)
│   │   ├── contractor.py           # Contractor updates (/api/contractor/*)
│   │   ├── government.py           # Govt Admin management (/api/government/*)
│   │   ├── citizen.py              # Citizen observations (/api/citizen/*)
│   │   └── ai.py                   # RAG AI assistant & vision analysis (/api/ai/*)
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Header with role status & demo account switcher
│   │   │   └── ProtectedRoute.jsx  # Role-based route guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global JWT authentication provider
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Public landing page (Promise → Proof concept)
│   │   │   ├── LoginPage.jsx       # Login form & quick demo login presets
│   │   │   ├── RegisterPage.jsx    # Registration with role toggle (Citizen/Contractor/Govt)
│   │   │   ├── CitizenDashboard.jsx    # Citizen Portal (/citizen/dashboard)
│   │   │   ├── ContractorDashboard.jsx # Contractor Portal (/contractor/dashboard)
│   │   │   ├── GovernmentDashboard.jsx # Govt Admin Portal (/government/dashboard)
│   │   │   └── ExploreProjectsPage.jsx # Project directory list & search
│   │   ├── services/
│   │   │   └── api.js              # Axios wrapper with JWT token interceptor
│   │   ├── App.jsx                 # Routing configuration
│   │   ├── main.jsx
│   │   └── index.css               # Tailwind & glassmorphism styling
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 4. Setup & Running Instructions

### Prerequisites
- Python 3.9+
- Node.js v18+ & npm

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```
*The backend runs on `http://localhost:5000` and automatically seeds demo accounts on startup.*

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The frontend runs on `http://localhost:5173`.*

---

## 5. Demo Accounts

Use these pre-configured credentials to test role-based access:

| Role | Email | Password | Allowed Access |
|---|---|---|---|
| **Citizen** | `citizen@civiclens.demo` | `Demo@123` | `/citizen/dashboard`, `/explore` |
| **Contractor** | `contractor@civiclens.demo` | `Demo@123` | `/contractor/dashboard` |
| **Government Admin** | `government@civiclens.demo` | `Demo@123` | `/government/dashboard` |

*Quick-switch buttons are also available directly on the Login page and top Navbar.*

---

## 6. API Endpoints

### Public Endpoints
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Health check & DB status |
| `POST` | `/api/auth/register` | Public | Register new account (Citizen / Contractor / Govt) |
| `POST` | `/api/auth/login` | Public | Authenticate & return JWT token + user object |
| `GET` | `/api/auth/me` | JWT Required | Get currently authenticated user profile |
| `GET` | `/api/projects` | Public | Browse & filter civic project directory |
| `GET` | `/api/projects/:id` | Public | Get detailed project transparency breakdown |

### Government Admin Endpoints
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `GET` | `/api/government/projects` | Govt Admin | List all projects, including drafts |
| `POST` | `/api/government/projects` | Govt Admin | Create new civic project |
| `POST` | `/api/government/projects/:id/publish` | Govt Admin | Publish or unpublish a project |
| `DELETE` | `/api/government/projects/:id` | Govt Admin | Delete a project |
| `GET` | `/api/government/stats` | Govt Admin | Fetch compact admin stats strip |
| `GET` | `/api/government/updates` | Govt Admin | List contractor updates queue |
| `GET` | `/api/government/updates/:id` | Govt Admin | Fetch submission review details |
| `POST` | `/api/government/updates/:id/approve` | Govt Admin | Approve contractor submission |
| `POST` | `/api/government/updates/:id/reject` | Govt Admin | Reject contractor submission (requires comment) |

### Contractor Endpoints
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `GET` | `/api/contractor/projects` | Contractor | List contractor's assigned projects |
| `POST` | `/api/contractor/upload-evidence` | Contractor | Upload PNG, JPG, JPEG, or PDF evidence (5MB limit) |
| `POST` | `/api/contractor/projects/:id/updates` | Contractor | Submit progress report |
| `GET` | `/api/contractor/projects/:id/updates` | Contractor | Retrieve contractor's update history |

---

## 7. Future Milestones Roadmap

- **Milestone 1-3**: Completed & Verified (Foundation, Auth, Admin project CRUD, Contractor updates, Evidence upload, Government review verification cycle).
- **Milestone 4**: Citizen Ground Observations & Photo Uploads.
- **Milestone 5**: Promise vs Reality Tracker & Neutral Delay Detector.
- **Milestone 6**: Interactive Leaflet Project Map with Status Color Markers.
- **Milestone 7**: Source-Backed RAG CivicLens AI Assistant & Doc Simplifier.
- **Milestone 8**: Regional Language Support (Kannada) & Web Speech Voice Queries.
- **Milestone 9**: End-to-End System Audit, Testing & Deployment.
