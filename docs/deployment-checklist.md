# CivicLens Deployment Checklist

This checklist is intended for the human operator performing the actual manual deployment to cloud hosting.

- [ ] MongoDB Atlas created
- [ ] Database URI configured (`MONGO_URI`)
- [ ] Backend deployed (Flask/Gunicorn)
- [ ] Backend health check passes (`GET /api/health`)
- [ ] AI service deployed (FastAPI/Uvicorn)
- [ ] `AI_SERVICE_URL` configured in the backend environment
- [ ] Frontend deployed (React/Vite)
- [ ] `VITE_API_URL` configured in the frontend environment
- [ ] CORS configured (`FRONTEND_URL` set in backend)
- [ ] Database seeded (Automatically executes on backend boot)
- [ ] Citizen login tested (`citizen@civiclens.demo`)
- [ ] Contractor login tested (`contractor@civiclens.demo`)
- [ ] Government login tested (`government@civiclens.demo`)
- [ ] Map tested
- [ ] Project details tested
- [ ] Citizen observation tested (Uploads)
- [ ] Contractor submission tested
- [ ] Government approval tested
- [ ] AI tested
- [ ] AI citations tested
- [ ] Production build tested (`npm run build` succeeds locally)
