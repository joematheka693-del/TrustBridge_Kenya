# TrustBridge Kenya

TrustBridge Kenya is a trust-focused jobs and talent marketplace for Kenyan freelancers, clients, admins, and general members.

## Current phase

Phase 2.0: Backend foundation with Flask, MySQL config, route blueprints, health checks, and auth helpers.

## Project structure

```txt
trustbridge-kenya/
  frontend/
  backend/
  docs/
  README.md
  .gitignore
```

## Frontend setup

```bash
cd trustbridge-kenya/frontend
npm install
npm run dev
```

## Frontend build test

```bash
npm run build
```

## Required frontend modules

```bash
npm install @vitejs/plugin-react vite react react-dom react-router-dom axios bootstrap lucide-react
```

## Environment setup

Create `frontend/.env` from `frontend/.env.example` when the Flask backend starts.

```bash
VITE_API_BASE_URL=http://127.0.0.1:5000/api
```

## Important frontend routes

```txt
/
/jobs
/jobs/:jobId
/talent
/talent/:profileId
/auth
/dashboard
/member/dashboard
/freelancer/dashboard
/client/dashboard
/admin/dashboard
/profile-builder
/post-job
/client/jobs
/applications
/applications/:applicationId
/applications/new/job-application
/applications/new/talent-invite
/verification
/verification/new
/trust-score
/admin/users
/admin/jobs
/admin/applications
/admin/activity
/admin/verification
/admin/trust-controls
/admin/system-audit
/unauthorized
```

## Phase 1.9 theme engine work

```txt
ThemeContext provider
Navbar theme switcher dropdown
Persistent localStorage theme preference
CSS variable-based theme tokens
Trust Blue theme
Frost System theme
Emerald Secure theme
Midnight Admin theme
Global UI inheritance through CSS variables
```

## Backend setup

```bash
cd trustbridge-kenya/backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
python app.py
```

For Windows PowerShell activation:

```bash
venv\Scripts\activate
```

Create `backend/.env` from `backend/.env.example` before connecting MySQL.

## Backend phase 2.0 routes

```txt
GET /
GET /api/health
GET /api/health/database
GET /api/auth
GET /api/jobs
GET /api/talent
GET /api/applications
GET /api/verification-requests
GET /api/trust-score
GET /api/admin
GET /api/system-audit
```

## Backend status

The Flask backend foundation is ready. It has route folders, blueprints, MySQL connection utilities, JWT helpers, role helpers, health checks, CORS setup, and standard response helpers. Full auth, SQL schema, and CRUD logic come in the next backend phases.


## Phase 2.1 — Backend Authentication System

This phase adds real Flask + MySQL authentication.

### Backend routes added

- `POST /api/signup`
- `POST /api/login`
- `GET /api/profile`
- `GET /api/protected`
- `GET /api/auth`

### SQL files added

- `backend/sql/full_schema.sql`
- `backend/sql/seed.sql`

### Seed accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@trustbridge.co.ke | Admin@12345 |
| Client | client@trustbridge.co.ke | Client@12345 |
| Freelancer | freelancer@trustbridge.co.ke | Freelancer@12345 |
| Member | member@trustbridge.co.ke | Member@12345 |

### Backend run commands

```bash
cd trustbridge-kenya/backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
python app.py
```

### Frontend run commands

```bash
cd trustbridge-kenya/frontend
npm install
npm run dev
```


## Phase 2.3 — Talent Backend System

The backend now includes a real talent profile API connected to MySQL.

Added tables:

```txt
talent_profiles
profile_skills
portfolio_links
```

Added routes:

```txt
GET /api/talent
GET /api/talent/<profile_id>
POST /api/talent
PUT /api/talent/<profile_id>
DELETE /api/talent/<profile_id>
```

Frontend talent pages now attempt backend loading first and fall back to preview data when the Flask API is not running.

## Latest phase: 2.6

Phase 2.6 adds the Trust Score backend system. The project now has a real `trust_score_events` table, score calculation API, automatic score event hooks, and admin manual trust score controls.


## Current Phase

Phase 2.7 — Admin Backend System

Admin backend controls are now connected for overview totals, user management, job moderation, activity logs, and manual trust events.


Current phase: Phase 2.9 Backend Hardening and Integration Cleanup


## Phase 3.0 Database Setup

Run the database setup from the backend folder:

```bash
cd trustbridge-kenya/backend
mysql -u root -p < sql/full_schema.sql
mysql -u root -p < sql/seed.sql
mysql -u root -p < sql/schema_check.sql
```

For a full local reset only:

```bash
mysql -u root -p < sql/reset_database.sql
```

Do not run the reset script on production.


## Phase 3.1 Documentation Pack

The project now includes a complete documentation pack under `docs/`.

Important files:

```txt
docs/manuals/manual-overview.md
docs/manuals/general-user-manual.md
docs/manuals/client-manual.md
docs/manuals/freelancer-manual.md
docs/manuals/admin-manual.md
docs/manuals/auth-account-manual.md
docs/manuals/verification-trust-score-manual.md
docs/manuals/backend-system-audit-manual.md
docs/manuals/troubleshooting-manual.md
docs/deployment/deployment-guide.md
docs/testing/full-integration-test-checklist.md
```

Use the manuals before deployment to confirm role behavior, API connection, database setup, and admin safety rules.


## Phase 3.2 — Final Integration Testing and Polish

This phase adds final pre-deployment integration polish:

- Shared frontend API response normalizer
- Cleaner applications and trust-score service response handling
- Backend API smoke-test script
- Frontend/backend route map
- Final integration polish checklist
- Updated backend health phase metadata

Useful checks:

```bash
cd backend
python scripts/api_smoke_test.py
```

```bash
cd frontend
npm run build
```

Read these files before deployment preparation:

```txt
docs/integration/route-map.md
docs/testing/final-integration-polish-checklist.md
```
# TrustBridge_Kenya
