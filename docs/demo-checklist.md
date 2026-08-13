# CivicLens 5-Minute Hackathon Demo Script & Checklist

This document details the exact, step-by-step 5-minute live demonstration flow for CivicLens.

---

## Pre-Demo Setup & Environment Verification

1. **Start Backend Server**:
   ```bash
   python backend/run.py
   # Runs on http://localhost:5000
   ```
2. **Start Frontend Dev Server**:
   ```bash
   cd frontend
   npm run dev
   # Runs on http://localhost:5173
   ```
3. **Start Isolated AI Prototype Service**:
   ```bash
   cd ai-prototype
   python scripts/serve.py
   # Runs on http://localhost:8000
   ```

---

## 5-Minute Live Demo Walkthrough

### Step 1: Platform Introduction & Public Project Explorer (Minute 0:00 - 1:00)
- **Action**: Open browser at `http://localhost:5173`.
- **Narrative**: *"Welcome to CivicLens, the public transparency and proof platform for civic infrastructure projects."*
- **Screen**: Click **Explore Projects** (`/explore`).
- **Showcase**:
  - Filter by Ward (**Ward 12**) or Category (**Roads**).
  - Point out the Transparency Score (e.g. 85/100) on project cards.
  - Open hero project: **Ward 12 Road Development** (`/civic-projects/proj-001`).

---

### Step 2: Hero Project Detail — Promise vs Reality (Minute 1:00 - 2:00)
- **Action**: Scroll through `ProjectDetailPage` (`/civic-projects/proj-001`).
- **Showcase**:
  - **Sanctioned Budget**: ₹50.0 Lakh (Allocated & Released: ₹50,000,000).
  - **Official Progress**: **70%** (Verified Government Audit).
  - **Contractor Assigned**: ABC Constructions (Rep: Arun Bhat).
  - **Timeline Promise vs Reality**: Start date Jan 10, 2026, Expected completion June 30, 2026.
  - **Milestone Breakdown**: Utility Mapping (Completed), Sub-grade Preparation (Completed), Concrete White-topping (Completed), Pedestrian Footpath (Ongoing 40%).

---

### Step 3: Contractor Workflow — Submitting Proof of Progress (Minute 2:00 - 3:00)
- **Action**: Log in as Contractor (`contractor@civiclens.demo` / `Demo@123`).
- **Screen**: Contractor Dashboard (`/contractor/dashboard`).
- **Showcase**:
  - View assigned project: **Ward 12 Road Development**.
  - Click **Submit Progress Update** (`/contractor/projects/proj-001/update`).
  - Enter progress: **75%** (Submitting secondary grading & curb stone ducting).
  - Upload photo/document evidence: `curbs_and_ducting.jpg`.
  - Submit update.
- **Key Point**: *"Notice that submitting a progress update does NOT automatically change the public official progress. It enters PENDING VERIFICATION status."*

---

### Step 4: Government Verification & Audit Trail (Minute 3:00 - 3:45)
- **Action**: Log out and log in as Government Admin (`government@civiclens.demo` / `Demo@123`).
- **Screen**: Government Admin Dashboard (`/government/dashboard`).
- **Showcase**:
  - View Pending Review Queue.
  - Open update review (`/government/updates/upd-demo-pending`).
  - Compare contractor's claimed 75% against field inspection reports.
  - Click **Approve Update** with government verification comment.
  - Return to public project page to show Official Progress updated to **75%** in the public record and logged in the immutable Audit Trail.

---

### Step 5: Citizen Ground Observation & Ground Truth (Minute 3:45 - 4:15)
- **Action**: Log in as Citizen (`citizen@civiclens.demo` / `Demo@123`).
- **Screen**: Citizen Dashboard (`/citizen/dashboard`) → Open Ward 12 Road Development → Click **Report Citizen Observation** (`/citizen/projects/proj-001/observe`).
- **Showcase**:
  - Select Observation Type: **SITE_CONDITION**.
  - Enter description: *"Water pooling near incomplete curb drain at 4th Cross junction."*
  - Upload photo evidence and submit.
  - View observation listed on public page anonymously as **"Citizen Observation"** (protecting citizen privacy).

---

### Step 6: Ask CivicLens AI — Source-Backed Q&A with Page Citations (Minute 4:15 - 5:00)
- **Action**: Open CLI demo or API query (`python ai-prototype/scripts/ask.py` or FastAPI `/ai/ask`).
- **Query**: *"What is the budget of Ward 12 Road Development?"*
- **Response Showcase**:
  - Grounded Answer: *"Total Sanctioned Project Budget: Rs 50.0 Lakhs (Fifty Lakh Rupees / Rs 5,000,000)."*
  - Verified Citation: `Source 1: Ward 12 Project Report, Page 2` & `Source 2: Ward 12 Budget Report, Page 1`.
- **Anti-Hallucination Query**: *"What is the population of Tokyo?"*
- **Response Showcase**: *"I couldn't find sufficient information in the available CivicLens sources."* (Zero hallucinations).
- **Closing Tagline**: *"CivicLens bridges the gap between public funds, contractor promises, citizen observations, and verified government truth."*

---

## Pre-Demo Verification Checklist

| # | Item | Verified Status |
|---|------|-----------------|
| 1 | Demo user `citizen@civiclens.demo` logs in cleanly | **PASS** |
| 2 | Demo user `contractor@civiclens.demo` logs in cleanly | **PASS** |
| 3 | Demo user `government@civiclens.demo` logs in cleanly | **PASS** |
| 4 | Hero project budget displays **₹50 Lakh** / ₹5,000,000 | **PASS** |
| 5 | Official Progress vs Contractor Submitted distinction is clear | **PASS** |
| 6 | Contractor cannot edit projects of other contractors | **PASS** |
| 7 | Citizen observations hide private email/phone | **PASS** |
| 8 | Photo evidence upload validates extensions (PNG, JPG, PDF) | **PASS** |
| 9 | AI Q&A answers with page-level citations from PDF documents | **PASS** |
| 10 | Unsupported AI questions safely rejected without hallucination | **PASS** |
