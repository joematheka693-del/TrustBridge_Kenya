# TrustBridge Kenya Backend

## Phase 2.1 backend status

The backend now has real authentication endpoints connected to MySQL.

## Setup

```bash
cd trustbridge-kenya/backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
```

For PowerShell:

```bash
venv\Scripts\activate
```

Create `.env` from `.env.example`.

## Database setup

Run:

```bash
mysql -u root -p < sql/full_schema.sql
mysql -u root -p < sql/seed.sql
```

## Start backend

```bash
python app.py
```

## Auth routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/signup` | Create member, freelancer, or client account |
| POST | `/api/login` | Login and receive JWT token |
| GET | `/api/profile` | Load current logged-in user |
| GET | `/api/protected` | Test protected JWT access |
| GET | `/api/auth` | Auth route group information |

## Seed accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@trustbridge.co.ke | Admin@12345 |
| Client | client@trustbridge.co.ke | Client@12345 |
| Freelancer | freelancer@trustbridge.co.ke | Freelancer@12345 |
| Member | member@trustbridge.co.ke | Member@12345 |


## Phase 2.2 Jobs API

Public users can read jobs. Client and admin accounts can create jobs. A client can update or delete only jobs connected to their own account. Admin accounts can update or delete any job.

Routes now active:

```txt
GET /api/jobs
GET /api/jobs/<job_id>
POST /api/jobs
PUT /api/jobs/<job_id>
DELETE /api/jobs/<job_id>
```

Useful query parameters for `GET /api/jobs`:

```txt
q=react
category=Frontend Development
status=open
status=all
```

Required authenticated POST body:

```json
{
  "title": "React dashboard for small shop",
  "description": "Build a responsive dashboard.",
  "category": "Frontend Development",
  "location": "Remote, Kenya",
  "budget": "KES 18,000",
  "timeline": "10 days",
  "experience": "Beginner to intermediate",
  "skills": ["React", "Bootstrap", "Axios"]
}
```

## Phase 2.3 Talent API

Public users can read talent profiles. Member and freelancer accounts can create their own talent profile. Client accounts cannot create talent profiles. Admin accounts can manage any talent profile.

Routes now active:

```txt
GET /api/talent
GET /api/talent/<profile_id>
POST /api/talent
PUT /api/talent/<profile_id>
DELETE /api/talent/<profile_id>
```

Useful query parameters for `GET /api/talent`:

```txt
q=react
category=Frontend Developer
level=Intermediate
status=active
status=all
```

Required authenticated POST body:

```json
{
  "name": "Demo Freelancer",
  "email": "freelancer@trustbridge.co.ke",
  "category": "Full Stack Developer",
  "skillLevel": "Beginner+",
  "location": "Machakos, Kenya",
  "rate": "KES 2,000 / project day",
  "bio": "I build React and Flask web applications.",
  "skills": ["React", "Flask", "MySQL", "Bootstrap"],
  "portfolioLinks": [
    { "label": "Portfolio", "url": "https://example.com" }
  ]
}
```

Talent tables:

```txt
talent_profiles
profile_skills
portfolio_links
```

## Phase 2.4 Applications and Invites API

Authenticated users can work with application records based on their role. The API supports both job applications and talent invites.

Routes now active:

```txt
GET /api/applications
GET /api/applications/<application_id>
POST /api/applications
PATCH /api/applications/<application_id>/status
DELETE /api/applications/<application_id>
```

Useful query parameters for `GET /api/applications`:

```txt
q=react
type=job-application
type=talent-invite
type=all
status=pending
status=shortlisted
status=accepted
status=rejected
status=all
```

Job application body:

```json
{
  "type": "job-application",
  "sourceId": 1,
  "sourceTitle": "React dashboard for small shop",
  "applicantName": "Demo Freelancer",
  "applicantEmail": "freelancer@trustbridge.co.ke",
  "message": "I can build this dashboard cleanly.",
  "budget": "KES 18,000",
  "timeline": "10 days"
}
```

Talent invite body:

```json
{
  "type": "talent-invite",
  "sourceId": 1,
  "sourceTitle": "Invite: Amina Otieno",
  "applicantName": "Demo Client",
  "applicantEmail": "client@trustbridge.co.ke",
  "message": "We would like to invite you to this client project.",
  "budget": "KES 25,000",
  "timeline": "10 days"
}
```

Application table:

```txt
applications
```

## Phase 2.5 Verification API

Authenticated users can submit verification evidence. Members, freelancers, and clients can view their own verification records. Admin accounts can view the full queue, approve evidence, reject evidence, or request more evidence.

Routes now active:

```txt
GET /api/verification-requests
GET /api/verification-requests/<request_id>
POST /api/verification-requests
PATCH /api/verification-requests/<request_id>/status
DELETE /api/verification-requests/<request_id>
```

Useful query parameters for `GET /api/verification-requests`:

```txt
q=github
status=pending
status=approved
status=rejected
status=more_evidence_needed
status=all
```

Verification submission body:

```json
{
  "fullName": "Demo Freelancer",
  "email": "freelancer@trustbridge.co.ke",
  "role": "freelancer",
  "evidenceType": "GitHub link",
  "evidenceLink": "https://github.com/example-demo-freelancer",
  "notes": "Please review my public React and Flask projects."
}
```

Admin status update body:

```json
{
  "status": "approved",
  "reviewNotes": "Evidence is clear and matches the account."
}
```

Allowed admin status values:

```txt
approved
rejected
more_evidence_needed
```

Verification table:

```txt
verification_requests
```

When an admin approves, rejects, or requests more evidence, the matching talent profile verification value is also updated when a talent profile exists for that user/email.

## Phase 2.6 Trust Score API

Routes added:

```txt
GET /api/trust-score
GET /api/trust-score/<user_id>
GET /api/trust-score/events
POST /api/trust-score/events
```

`GET /api/trust-score` returns the logged-in user's score, score rules, and recent score events.

`GET /api/trust-score/<user_id>` is admin-only unless the requested user is the logged-in user.

`GET /api/trust-score/events` returns the logged-in user's events. Admins can view all events and filter by `user_id` or `event_type`.

`POST /api/trust-score/events` is admin-only and creates a manual trust score event.

---

## Phase 2.7 Admin Backend Routes

Admin routes are protected with `@roles_required('admin')`.

### Overview

```txt
GET /api/admin/overview
```

Returns totals for users, jobs, talent profiles, applications, verification requests, and trust score events.

### Users

```txt
GET /api/admin/users
PATCH /api/admin/users/<user_id>/role
PATCH /api/admin/users/<user_id>/status
DELETE /api/admin/users/<user_id>
```

Supported user roles:

```txt
member
freelancer
client
admin
```

Supported user statuses:

```txt
active
review
suspended
```

Safety rules:

```txt
The last admin cannot be demoted.
The last admin cannot be deleted.
An admin cannot delete their own account from this endpoint.
An admin cannot suspend their own admin account.
```

### Job moderation

```txt
PATCH /api/admin/jobs/<job_id>/status
```

Supported backend statuses:

```txt
open
paused
closed
under_review
```

The frontend moderation buttons normalize preview labels like approved/review/rejected into backend statuses.

### Admin trust events

```txt
POST /api/admin/trust-events
```

Creates a manual trust score event for a selected user.
