# TrustBridge Kenya Phase Review

## Phase 2.1 — Backend Authentication System

This phase connects the frontend auth page to a real Flask authentication API.

### Added backend authentication

- `POST /api/signup`
- `POST /api/login`
- `GET /api/profile`
- `GET /api/protected`
- `GET /api/auth`

### Added database base

- `backend/sql/full_schema.sql`
- `backend/sql/seed.sql`

The first real table is:

- `users`

### Added user roles

- `member`
- `freelancer`
- `client`
- `admin`

Public signup only supports:

- `member`
- `freelancer`
- `client`

Admin accounts should be created through seed data or future admin management tools.

### Seed accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@trustbridge.co.ke | Admin@12345 |
| Client | client@trustbridge.co.ke | Client@12345 |
| Freelancer | freelancer@trustbridge.co.ke | Freelancer@12345 |
| Member | member@trustbridge.co.ke | Member@12345 |

### Frontend updates

- Auth page now calls the backend login/signup API.
- Preview role login is still available for UI testing.
- JWT token is saved in localStorage.
- User session is saved in localStorage.
- Axios automatically attaches the bearer token.
- Auth errors are shown inside the auth form.

### Run order

1. Import SQL schema.
2. Import seed data.
3. Start backend.
4. Start frontend.
5. Login using one of the seed accounts.


## Phase 2.2 — Jobs Backend System

This phase added the real MySQL jobs table and connected the Flask jobs route group to the frontend service layer.

Implemented backend routes:

```txt
GET /api/jobs
GET /api/jobs/<job_id>
POST /api/jobs
PUT /api/jobs/<job_id>
DELETE /api/jobs/<job_id>
```

Access rules:

```txt
Public and guest users:
  Can view jobs and job details.

Members and freelancers:
  Can view jobs and prepare application flow.
  Cannot post, update, or delete jobs.

Clients:
  Can create jobs.
  Can update or delete their own jobs.

Admins:
  Can create jobs.
  Can update or delete any job.
```

SQL updated:

```txt
backend/sql/full_schema.sql
backend/sql/seed.sql
```

Frontend updated:

```txt
frontend/src/services/jobsApi.js
frontend/src/pages/JobDetails.jsx
frontend/src/pages/ClientJobs.jsx
frontend/src/pages/PostJob.jsx
```

## Phase 2.3 — Talent Backend System

This phase added the real MySQL talent profile system and connected the Flask talent route group to the frontend service layer.

Implemented backend routes:

```txt
GET /api/talent
GET /api/talent/<profile_id>
POST /api/talent
PUT /api/talent/<profile_id>
DELETE /api/talent/<profile_id>
```

Access rules:

```txt
Public and guest users:
  Can view talent profiles and talent details.

Members:
  Can create one beginner talent profile.
  Can update or delete their own talent profile.

Freelancers:
  Can create one professional talent profile.
  Can update or delete their own talent profile.

Clients:
  Can view talent profiles.
  Cannot create, update, or delete talent profiles.

Admins:
  Can create profiles for testing/review.
  Can update or delete any talent profile.
```

SQL updated:

```txt
backend/sql/full_schema.sql
backend/sql/seed.sql
```

Tables added:

```txt
talent_profiles
profile_skills
portfolio_links
```

Frontend updated:

```txt
frontend/src/services/talentApi.js
frontend/src/pages/Talent.jsx
frontend/src/pages/TalentDetails.jsx
```

This phase keeps the client and freelancer workspaces separate. Clients can search and invite talent, but profile creation remains reserved for members, freelancers, and admins.

## Phase 2.4 — Applications and Invites Backend System

This phase added the real MySQL applications system and connected job applications plus talent invites to the Flask backend.

Implemented backend routes:

```txt
GET /api/applications
GET /api/applications/<application_id>
POST /api/applications
PATCH /api/applications/<application_id>/status
DELETE /api/applications/<application_id>
```

Access rules:

```txt
Members:
  Can create job applications.
  Can view their own records.
  Can delete records they sent.

Freelancers:
  Can create job applications.
  Can view their own records and client invites sent to them.
  Can delete records they sent.

Clients:
  Can create talent invites.
  Can view records connected to their jobs or invites.
  Can update status for records they own.

Admins:
  Can view all application and invite records.
  Can update any application status.
  Can delete any record.
```

SQL updated:

```txt
backend/sql/full_schema.sql
backend/sql/seed.sql
```

Table added:

```txt
applications
```

Frontend updated:

```txt
frontend/src/services/applicationsApi.js
frontend/src/pages/Applications.jsx
frontend/src/pages/ApplicationDetails.jsx
frontend/src/pages/ApplicationForm.jsx
frontend/src/pages/AdminApplications.jsx
frontend/src/components/StateNotice.jsx
frontend/src/styles/stateNotice.css
```

This phase keeps applications and invites separated by role. A freelancer applies to jobs. A client invites talent. The admin oversees all records from the admin workspace only.

---

## Phase 2.5 — Verification Backend System

Implemented backend routes:

```txt
GET /api/verification-requests
GET /api/verification-requests/<request_id>
POST /api/verification-requests
PATCH /api/verification-requests/<request_id>/status
DELETE /api/verification-requests/<request_id>
```

Access rules:

```txt
Members:
  Can submit verification evidence.
  Can view their own verification records.
  Can delete their own pending or more-evidence-needed requests.

Freelancers:
  Can submit portfolio, GitHub, certificate, and previous work proof.
  Can view their own verification records.
  Can delete their own pending or more-evidence-needed requests.

Clients:
  Can submit business profile evidence.
  Can view their own verification records.
  Can delete their own pending or more-evidence-needed requests.

Admins:
  Can view the full verification queue.
  Can approve, reject, or request more evidence.
  Can delete any verification request.
```

SQL updated:

```txt
backend/sql/full_schema.sql
backend/sql/seed.sql
```

Table added:

```txt
verification_requests
```

Frontend updated:

```txt
frontend/src/services/verificationApi.js
frontend/src/pages/VerificationCenter.jsx
frontend/src/pages/VerificationForm.jsx
frontend/src/pages/AdminVerificationQueue.jsx
```

This phase connects verification requests to the backend and keeps admin review separated from normal user verification views.

## Phase 2.6 — Trust Score Backend System

This phase connects the TrustBridge reputation engine to the backend and database.

Added backend features:

- `trust_score_events` SQL table
- `GET /api/trust-score`
- `GET /api/trust-score/<user_id>`
- `GET /api/trust-score/events`
- `POST /api/trust-score/events`
- Admin-only manual trust score events
- Score calculation with base score 45, minimum 0, maximum 100
- Automatic score hooks for job posting, application submission, talent profile completion, and verification review

Score events now support:

- `approved_verification`
- `rejected_verification`
- `more_evidence_needed`
- `talent_profile_completed`
- `application_submitted`
- `job_posted`
- `manual_admin_event`
- `dispute_warning`

Frontend updates:

- Trust score page now calls the backend API
- Admin trust controls now post manual trust events to the backend
- Preview fallback remains available when backend/MySQL is offline
- Trust event cards support backend and preview field names

Testing completed:

- Backend Python compile check passed
- Frontend production build passed

---

## Phase 2.7 — Admin Backend System

This phase connected the separated admin frontend pages to real backend controls.

### Backend added

- `GET /api/admin/overview`
- `GET /api/admin/users`
- `GET /api/admin/activity`
- `PATCH /api/admin/users/<user_id>/role`
- `PATCH /api/admin/users/<user_id>/status`
- `DELETE /api/admin/users/<user_id>`
- `PATCH /api/admin/jobs/<job_id>/status`
- `POST /api/admin/trust-events`

### Admin rules added

- Only users with role `admin` can access admin API routes.
- Admin can list users and see role/status/trust metadata.
- Admin can change user roles.
- Admin can change user status to `active`, `review`, or `suspended`.
- Admin cannot demote or delete the final admin account.
- Admin cannot delete their own account from the admin delete endpoint.
- Admin can moderate job status.
- Admin can create manual trust score events.

### Frontend connected

- Admin dashboard now pulls overview totals.
- Admin user management now pulls backend users.
- Admin user role/status/delete controls call backend routes.
- Admin job moderation now calls backend job moderation route.
- Admin activity page now pulls platform activity from backend records.

### Stabilization fix

- Fixed the job details route so viewing a job does not accidentally create a trust score event.
- Job posting is the only job route that creates `job_posted` trust events.


## Phase 2.9 — Backend Hardening and Integration Cleanup

Added central backend error handlers, validation helper utilities, real admin-only system audit checks, frontend health checking, corrected system audit API usage, and final integration cleanup notes.


## Phase 3.0 — Full SQL and Final Database Polish

Phase 3.0 stabilizes the MySQL side before deployment preparation. It reviews the full schema, improves indexes, fixes seed consistency, adds reset/check scripts, and adds database troubleshooting documentation.

### Added

```txt
backend/sql/schema_check.sql
backend/sql/reset_database.sql
docs/database-troubleshooting-manual.md
docs/full-database-test-checklist.md
```

### Improved

```txt
backend/sql/full_schema.sql
backend/sql/seed.sql
backend/sql/README.md
```

### Important fix

The demo talent invite seed row was corrected so the `applications` table seed inserts cleanly. Demo jobs are also cleared before seed insertion to reduce duplicate local demo rows.


---

## Phase 3.1 — Manuals and Documentation Pack

Phase 3.1 added the full documentation layer for TrustBridge Kenya.

### Added manuals

- General user manual
- Client manual
- Freelancer manual
- Admin manual
- Authentication and account manual
- Verification and trust score manual
- Backend system audit manual
- Troubleshooting manual

### Added deployment/testing documentation

- Deployment guide
- Full integration test checklist
- Manual overview index

### Purpose

This phase makes the project easier to test, explain, present, deploy, and maintain. It also gives each role a separate usage guide so admin, client, freelancer, member, and guest behavior remains clearly separated.


## Phase 3.2 — Final Integration Testing and Polish

### Goal

Prepare TrustBridge Kenya for the deployment-preparation stage by checking integration consistency between frontend routes, backend API routes, role rules, and database readiness.

### Added

- `frontend/src/services/responseNormalizer.js`
- `backend/scripts/api_smoke_test.py`
- `docs/integration/route-map.md`
- `docs/testing/final-integration-polish-checklist.md`

### Improved

- Applications service now unwraps backend `data` consistently.
- Trust score service now unwraps backend `data` consistently.
- Applications page now uses shared API list/message helpers.
- Trust score page now handles backend and preview data more safely.
- Admin trust controls now read backend event payloads consistently.
- Backend health metadata now reports Phase 3.2.

### Test commands

```bash
cd frontend
npm install
npm run build
```

```bash
cd backend
python -m py_compile app.py routes/*.py utils/*.py config/*.py
python scripts/api_smoke_test.py
```
