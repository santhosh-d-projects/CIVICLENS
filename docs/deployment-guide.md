# CivicLens Deployment Guide

This guide provides step-by-step instructions for deploying the complete CivicLens architecture to production.

## Architecture Overview

- **Frontend**: React + Vite (Recommended: Vercel)
- **Backend**: Flask + Gunicorn (Recommended: Render)
- **AI Service**: FastAPI + Uvicorn (Recommended: Render)
- **Database**: MongoDB Atlas

---

## A. MongoDB Atlas Setup

1. Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Project and a free cluster (M0).
3. Under **Database Access**, create a user (e.g., `civiclens_admin`) and copy the password.
4. Under **Network Access**, add `0.0.0.0/0` to allow connections from anywhere (or restrict to your backend/Render IPs if known).
5. Click **Connect** -> **Connect your application** and copy the URI.
6. Replace `<password>` in the URI with your created password. This is your `<YOUR_MONGO_URI>`.

---

## B. Environment Variables Summary

Prepare the following secrets before deploying:

### Backend Secrets
- `MONGO_URI`: `<YOUR_MONGO_URI>`
- `JWT_SECRET`: `<YOUR_JWT_SECRET>` (generate a secure random 32+ char string)
- `SECRET_KEY`: `<YOUR_SECRET_KEY>` (generate a secure random string)
- `FLASK_ENV`: `production`
- `PORT`: `10000` (or leave default for Render)
- `FRONTEND_URL`: `<YOUR_FRONTEND_URL>` (e.g., `https://civiclens.vercel.app`)
- `AI_SERVICE_URL`: `<YOUR_AI_SERVICE_URL>` (e.g., `https://civiclens-ai.onrender.com`)

### AI Service Secrets
- `ANTHROPIC_API_KEY`: `<YOUR_API_KEY>` (Required for full RAG generation; if missing, falls back to rule-based synthesis)

### Frontend Secrets
- `VITE_API_URL`: `<YOUR_BACKEND_URL>/api` (e.g., `https://civiclens-backend.onrender.com/api`)

---

## C. AI Service Deployment (Render)

1. Connect your GitHub repository to Render.
2. Create a new **Web Service**.
3. Set the **Root Directory** to `ai-prototype`.
4. **Environment**: `Python 3`
5. **Build Command**: `pip install -r requirements.txt`
6. **Start Command**: `uvicorn scripts.serve:app --host 0.0.0.0 --port $PORT`
7. Add Environment Variables:
   - `ANTHROPIC_API_KEY`: `<YOUR_API_KEY>`
8. Deploy. Once successful, copy the service URL (this is your `<YOUR_AI_SERVICE_URL>`).

*Note on Memory/Startup:* The AI service loads a PyTorch SentenceTransformer model. The initial startup may take 1-2 minutes. On Render's free tier, cold starts will cause delays on the first query.

---

## D. Backend Deployment (Render)

1. Create another **Web Service** in Render.
2. Set the **Root Directory** to `backend`.
3. **Environment**: `Python 3`
4. **Build Command**: `pip install -r requirements.txt && pip install gunicorn requests`
5. **Start Command**: `gunicorn app:app -b 0.0.0.0:$PORT`
6. Add Environment Variables:
   - `MONGO_URI`: `<YOUR_MONGO_URI>`
   - `JWT_SECRET`: `<YOUR_JWT_SECRET>`
   - `SECRET_KEY`: `<YOUR_SECRET_KEY>`
   - `FLASK_ENV`: `production`
   - `FRONTEND_URL`: `<YOUR_FRONTEND_URL>`
   - `AI_SERVICE_URL`: `<YOUR_AI_SERVICE_URL>`
7. Deploy. Once successful, copy the service URL (this is your `<YOUR_BACKEND_URL>`).

*Limitation:* Uploads are currently written to the local filesystem (`backend/uploads/`). Render's free tier uses ephemeral disks, meaning uploaded files will be lost on restart. For the hackathon demo, this is acceptable, but production will require an S3 bucket or Cloudinary.

---

## E. Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel.
2. Set the **Framework Preset** to `Vite`.
3. Set the **Root Directory** to `frontend`.
4. In the **Environment Variables** section, add:
   - `VITE_API_URL`: `<YOUR_BACKEND_URL>/api`
5. Click **Deploy**. Vercel will automatically build (`npm run build`) and host the site.
6. The resulting URL is your `<YOUR_FRONTEND_URL>`. Update the Backend environment variable in Render if you didn't have it previously.

---

## F. CORS Configuration

CORS is dynamically controlled by the `FRONTEND_URL` environment variable in the backend. Setting `FRONTEND_URL=https://civiclens.vercel.app` in Render automatically restricts incoming requests to your Vercel deployment.

---

## G. Database Seeding

The database seeds itself automatically when the Flask application boots. The seed script (`seed_data.py`) uses idempotent `$set` upsert logic, so it is safe to run multiple times and will not create duplicate records on restart.

---

## H. Health Check

To verify the backend is online:
```bash
curl <YOUR_BACKEND_URL>/api/health
```
Expect a `200 OK` response with `{"status": "OK"}`.

---

## I. Demo Login Verification

Once deployed, visit your frontend URL and test the following demo credentials:

1. **Citizen**: `citizen@civiclens.demo` / `Demo@123`
2. **Contractor**: `contractor@civiclens.demo` / `Demo@123`
3. **Government Admin**: `government@civiclens.demo` / `Demo@123`

---

## J. Post-Deployment Testing

- **Map**: Verify the map loads (Leaflet works).
- **AI**: Go to a project and ask "What is the budget?" to verify the AI service answers correctly.
- **Uploads**: Test a citizen observation. (Note: Images will upload and work during the demo session, but may disappear if the Render server restarts).
