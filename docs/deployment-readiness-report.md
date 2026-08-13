# CivicLens Deployment Readiness Report

**Date**: 2026-08-13
**Status**: Ready for Manual Deployment

---

## 1. Recommended Hosting Architecture

- **Frontend**: React + Vite → **Vercel**
- **Backend**: Flask + Gunicorn → **Render** (Web Service)
- **AI Service**: FastAPI + Uvicorn → **Render** (Web Service)
- **Database**: MongoDB → **MongoDB Atlas**

---

## 2. Files Created/Modified

- `frontend/.env.example`: Created with placeholder for `VITE_API_URL`.
- `backend/app.py`: Updated CORS configuration to respect `FRONTEND_URL` environment variable for production security instead of wildcard.
- `.gitignore`: Updated to explicitly ignore user uploads (`backend/uploads/*`).
- `docs/deployment-guide.md`: Detailed step-by-step deployment instructions.
- `docs/deployment-checklist.md`: Interactive checklist for the person deploying.

---

## 3. Environment Variables Required

### Frontend (Vercel)
- `VITE_API_URL`

### Backend (Render)
- `MONGO_URI`
- `JWT_SECRET`
- `SECRET_KEY`
- `FLASK_ENV=production`
- `FRONTEND_URL`
- `AI_SERVICE_URL`

### AI Service (Render)
- `ANTHROPIC_API_KEY`

---

## 4. Backend Deployment Command

**Build Command**:
```bash
pip install -r requirements.txt && pip install gunicorn requests
```
*(Note: `gunicorn` and `requests` are required for production and AI proxying.)*

**Start Command**:
```bash
gunicorn app:app -b 0.0.0.0:$PORT
```

---

## 5. AI Deployment Command

**Build Command**:
```bash
pip install -r requirements.txt
```

**Start Command**:
```bash
uvicorn scripts.serve:app --host 0.0.0.0 --port $PORT
```

---

## 6. Frontend Deployment Command

**Build Command**:
```bash
npm run build
```
*(Note: This completes automatically on Vercel).*

---

## 7. MongoDB Requirements

- **Type**: MongoDB Atlas (Free M0 cluster is sufficient)
- **Network**: Allow IP `0.0.0.0/0` (or Render's specific outbound IPs)
- **Seeding**: Automatically runs on backend boot.

---

## 8. Upload-Storage Limitation

**CURRENT IMPLEMENTATION**: Local filesystem uploads (`backend/uploads/`).
**LIMITATION**: Cloud hosting (like Render) uses ephemeral file systems. Any image uploaded by a citizen/contractor will function immediately but **will be deleted if the server restarts or re-deploys**.
**VERDICT**: Acceptable for a hackathon demo. Production requires an S3 bucket or Cloudinary.

---

## 9. Security Status

- `.env` and `.env.*` are ignored in `.gitignore`.
- Secrets and API keys are completely absent from the codebase.
- MongoDB credentials are not hardcoded.
- Debug mode is automatically disabled via `FLASK_ENV=production`.
- Demo credentials are standard and safe for testing.
- AI endpoint allows public access for published projects (by design) and is protected for drafts.
- CORS is restricted to the exact `FRONTEND_URL`.

---

## 10. Git Status

- Working tree is clean (except for the deployment docs and config changes made in this session).
- `node_modules`, `dist`, `__pycache__`, `.venv`, and `backend/uploads/*` are properly ignored.

---

## 11. Production Build Result

`npm run build` ran successfully locally (zero errors, built in ~4.8s).

---

## 12. Manual Action Required

### READY AUTOMATICALLY
- Codebase
- Security guards
- CORS logic
- Production Build compatibility
- Idempotent Seeding

### REQUIRES USER CREDENTIALS/ACTION (Do Not Automate)
- Creating MongoDB Atlas database
- Creating Vercel/Render accounts
- Setting real Environment Variables (API Keys, Secrets)
- Triggering the initial deployments from the cloud dashboards
