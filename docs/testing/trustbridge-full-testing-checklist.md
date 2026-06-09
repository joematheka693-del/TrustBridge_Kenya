# TrustBridge Kenya — Full Testing Checklist

This checklist should be completed before moving to deployment preparation. Test in this order so that database problems are fixed before frontend/backend issues are confused with each other.

---

## 1. Project Folder Check

Confirm the project folder has the correct structure:

```txt
trustbridge-kenya/
  frontend/
  backend/
  docs/
  README.md
  .gitignore
```

Checklist:

- [ ] `frontend/` exists
- [ ] `backend/` exists
- [ ] `docs/` exists
- [ ] `backend/sql/full_schema.sql` exists
- [ ] `backend/sql/seed.sql` exists
- [ ] `backend/sql/schema_check.sql` exists
- [ ] `frontend/package.json` exists
- [ ] `backend/requirements.txt` exists
- [ ] `frontend/.env` exists or can be created from `.env.example`
- [ ] `backend/.env` exists or can be created from `.env.example`

---

## 2. Database Setup Test

Run these files in this order:

```bash
cd trustbridge-kenya/backend
mysql -u root -p < sql/full_schema.sql
mysql -u root -p < sql/seed.sql
mysql -u root -p < sql/schema_check.sql
```

If using phpMyAdmin:

1. Select or create `trustbridge_kenya`
2. Import/paste `full_schema.sql`
3. Import/paste `seed.sql`
4. Run/paste `schema_check.sql`

Checklist:

- [ ] Database `trustbridge_kenya` exists
- [ ] Active database is `trustbridge_kenya`
- [ ] `users` table exists
- [ ] `jobs` table exists
- [ ] `talent_profiles` table exists
- [ ] `profile_skills` table exists
- [ ] `portfolio_links` table exists
- [ ] `applications` table exists
- [ ] `verification_requests` table exists
- [ ] `trust_score_events` table exists
- [ ] Seed data inserted without red errors
- [ ] At least one admin account exists
- [ ] At least one client account exists
- [ ] At least one freelancer account exists
- [ ] Demo jobs exist
- [ ] Demo talent profiles exist

Quick database check:

```sql
USE trustbridge_kenya;

SELECT DATABASE() AS active_database;

SELECT 'users' AS table_name, COUNT(*) AS row_count FROM trustbridge_kenya.users
UNION ALL SELECT 'jobs', COUNT(*) FROM trustbridge_kenya.jobs
UNION ALL SELECT 'talent_profiles', COUNT(*) FROM trustbridge_kenya.talent_profiles
UNION ALL SELECT 'profile_skills', COUNT(*) FROM trustbridge_kenya.profile_skills
UNION ALL SELECT 'portfolio_links', COUNT(*) FROM trustbridge_kenya.portfolio_links
UNION ALL SELECT 'applications', COUNT(*) FROM trustbridge_kenya.applications
UNION ALL SELECT 'verification_requests', COUNT(*) FROM trustbridge_kenya.verification_requests
UNION ALL SELECT 'trust_score_events', COUNT(*) FROM trustbridge_kenya.trust_score_events;
```

Expected result:

- [ ] No `Unknown table` error
- [ ] No `information_schema` active database issue
- [ ] Row counts display for all tables

---

## 3. Backend Environment Test

Create backend `.env` from `.env.example`.

Expected local values:

```env
FLASK_ENV=development
FLASK_DEBUG=True
BACKEND_HOST=127.0.0.1
BACKEND_PORT=5000
FRONTEND_URL=http://localhost:5173
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=trustbridge_kenya
JWT_SECRET=change-this-before-production
```

Checklist:

- [ ] `.env` exists in `backend/`
- [ ] MySQL database name is `trustbridge_kenya`
- [ ] MySQL username is correct
- [ ] MySQL password is correct
- [ ] Backend port is `5000`
- [ ] Frontend URL is `http://localhost:5173`
- [ ] JWT secret is set

---

## 4. Backend Install and Run Test

Run:

```bash
cd trustbridge-kenya/backend
python -m venv venv
```

Git Bash:

```bash
source venv/Scripts/activate
```

PowerShell:

```bash
venv\Scripts\activate
```

Install:

```bash
pip install -r requirements.txt
python app.py
```

Checklist:

- [ ] Virtual environment created
- [ ] Virtual environment activated
- [ ] Requirements installed
- [ ] Flask starts without errors
- [ ] Backend runs on `http://localhost:5000`
- [ ] No MySQL connection error appears on startup

---

## 5. Backend Health Route Test

Open in browser or Postman:

```txt
GET http://localhost:5000/api/health
GET http://localhost:5000/api/health/database
```

Checklist:

- [ ] `/api/health` returns success
- [ ] `/api/health/database` returns success
- [ ] Database name is correct
- [ ] No CORS error appears
- [ ] No Flask traceback appears

---

## 6. Authentication API Test

Test signup:

```txt
POST http://localhost:5000/api/signup
```

Body:

```json
{
  "name": "Test User",
  "email": "testuser@trustbridge.co.ke",
  "password": "Test@12345",
  "role": "member"
}
```

Test login:

```txt
POST http://localhost:5000/api/login
```

Body:

```json
{
  "email": "admin@trustbridge.co.ke",
  "password": "Admin@12345"
}
```

Checklist:

- [ ] Signup works
- [ ] Duplicate email is rejected
- [ ] Login works for admin
- [ ] Login works for client
- [ ] Login works for freelancer
- [ ] Login works for member
- [ ] Wrong password is rejected
- [ ] JWT token is returned
- [ ] User role is returned
- [ ] Password hash is not exposed

Test profile with token:

```txt
GET http://localhost:5000/api/profile
Authorization: Bearer YOUR_TOKEN
```

Checklist:

- [ ] Profile route works with token
- [ ] Profile route fails without token
- [ ] Protected route works with token
- [ ] Protected route fails without token

---

## 7. Frontend Environment Test

Create frontend `.env` from `.env.example`.

Expected local value:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Checklist:

- [ ] `.env` exists in `frontend/`
- [ ] API base URL points to Flask backend
- [ ] Frontend and backend are on different ports correctly
- [ ] No spelling mistake in `VITE_API_BASE_URL`

---

## 8. Frontend Install and Run Test

Run:

```bash
cd trustbridge-kenya/frontend
npm install
npm run dev
```

Checklist:

- [ ] `npm install` finishes successfully
- [ ] `npm run dev` starts Vite
- [ ] Frontend opens at `http://localhost:5173`
- [ ] No blank white screen
- [ ] No missing import errors
- [ ] No console errors on page load
- [ ] Bootstrap styles load
- [ ] Theme engine works

Build test:

```bash
npm run build
```

Checklist:

- [ ] Build completes successfully
- [ ] No React import errors
- [ ] No router errors
- [ ] No missing CSS errors

---

## 9. Guest User Frontend Test

Open frontend without logging in.

Checklist:

- [ ] Navbar shows only Login auth action
- [ ] Home page loads
- [ ] Jobs page is visible publicly
- [ ] Job details page is visible publicly
- [ ] Talent page is visible publicly
- [ ] Talent details page is visible publicly
- [ ] Guest cannot access dashboard
- [ ] Guest cannot access applications
- [ ] Guest cannot access verification
- [ ] Guest cannot access admin pages
- [ ] Unauthorized page appears when needed

---

## 10. Auth Page Frontend Test

Go to:

```txt
/auth
```

Checklist:

- [ ] Login form appears
- [ ] Signup option is on the same auth page
- [ ] User can switch between login and signup
- [ ] Backend login works from frontend
- [ ] Backend signup works from frontend
- [ ] Auth errors show clearly
- [ ] JWT token is saved after login
- [ ] User role is saved after login
- [ ] Navbar changes after login
- [ ] Dropdown appears after login
- [ ] Logout clears user session

---

## 11. Role Redirect Test

Login with each account and open `/dashboard`.

Demo accounts:

```txt
Admin: admin@trustbridge.co.ke / Admin@12345
Client: client@trustbridge.co.ke / Client@12345
Freelancer: freelancer@trustbridge.co.ke / Freelancer@12345
Member: member@trustbridge.co.ke / Member@12345
```

Checklist:

- [ ] Admin goes to admin dashboard
- [ ] Client goes to client dashboard
- [ ] Freelancer goes to freelancer dashboard
- [ ] Member goes to member dashboard
- [ ] Each role sees different dashboard content
- [ ] Sidebar changes based on role
- [ ] Admin sidebar does not appear for normal users
- [ ] Client tools do not appear for freelancers
- [ ] Freelancer tools do not appear for clients

---

## 12. Jobs System Test

Guest/public tests:

- [ ] Jobs page loads
- [ ] Job cards display
- [ ] Job search works
- [ ] Job details page opens

Client tests:

- [ ] Client can access `/post-job`
- [ ] Client can create job
- [ ] Client can view client jobs page
- [ ] Client can update own job if supported in UI/API
- [ ] Client can delete own job if supported in UI/API

Freelancer/member tests:

- [ ] Freelancer cannot access post-job page
- [ ] Member cannot access post-job page
- [ ] Freelancer can view jobs
- [ ] Member can view jobs

Admin tests:

- [ ] Admin can view all jobs
- [ ] Admin can access job moderation
- [ ] Admin can update job status

Backend checks:

- [ ] `GET /api/jobs` works
- [ ] `GET /api/jobs/<job_id>` works
- [ ] `POST /api/jobs` requires client/admin token
- [ ] `PUT /api/jobs/<job_id>` checks ownership/admin role
- [ ] `DELETE /api/jobs/<job_id>` checks ownership/admin role

---

## 13. Talent System Test

Public tests:

- [ ] Talent page loads
- [ ] Talent cards display
- [ ] Talent search works
- [ ] Talent details page opens

Freelancer/member tests:

- [ ] Freelancer can access profile builder
- [ ] Member can access profile builder
- [ ] Freelancer can create talent profile
- [ ] Member can create beginner profile
- [ ] Profile skills save correctly
- [ ] Portfolio links save correctly

Client tests:

- [ ] Client can browse talent
- [ ] Client cannot create talent profile
- [ ] Client can open talent invite flow

Admin tests:

- [ ] Admin can view talent profiles
- [ ] Admin can manage talent data if needed

Backend checks:

- [ ] `GET /api/talent` works
- [ ] `GET /api/talent/<profile_id>` works
- [ ] `POST /api/talent` requires member/freelancer/admin role
- [ ] `PUT /api/talent/<profile_id>` checks owner/admin
- [ ] `DELETE /api/talent/<profile_id>` checks owner/admin

---

## 14. Applications and Invites Test

Freelancer/member tests:

- [ ] Freelancer can apply for a job
- [ ] Member can apply for a job
- [ ] Application appears in applications workspace
- [ ] Application details page opens

Client tests:

- [ ] Client can invite talent
- [ ] Talent invite appears in applications workspace
- [ ] Client can update application/invite status

Admin tests:

- [ ] Admin can view all applications/invites
- [ ] Admin can update any status
- [ ] Admin can delete records if needed

Backend checks:

- [ ] `GET /api/applications` returns role-filtered records
- [ ] `GET /api/applications/<application_id>` respects access rules
- [ ] `POST /api/applications` creates job applications and talent invites
- [ ] `PATCH /api/applications/<application_id>/status` works for owner/admin
- [ ] `DELETE /api/applications/<application_id>` works for owner/admin

Statuses to test:

- [ ] pending
- [ ] shortlisted
- [ ] rejected
- [ ] accepted

---

## 15. Verification System Test

User tests:

- [ ] Member can submit verification
- [ ] Freelancer can submit verification
- [ ] Client can submit business verification
- [ ] User can view own verification requests
- [ ] User cannot view other users' verification requests

Admin tests:

- [ ] Admin can open verification queue
- [ ] Admin can approve verification
- [ ] Admin can reject verification
- [ ] Admin can request more evidence
- [ ] Admin review notes save correctly

Backend checks:

- [ ] `GET /api/verification-requests` returns role-filtered records
- [ ] `GET /api/verification-requests/<request_id>` respects access rules
- [ ] `POST /api/verification-requests` works for logged-in users
- [ ] `PATCH /api/verification-requests/<request_id>/status` requires admin
- [ ] `DELETE /api/verification-requests/<request_id>` respects access rules

Statuses to test:

- [ ] pending
- [ ] approved
- [ ] rejected
- [ ] more_evidence_needed

---

## 16. Trust Score System Test

User tests:

- [ ] User can open trust score page
- [ ] User sees own trust score
- [ ] User sees own trust score events
- [ ] Score does not go below 0
- [ ] Score does not go above 100

Automatic event tests:

- [ ] Creating talent profile adds score event
- [ ] Posting job adds score event
- [ ] Submitting application adds score event
- [ ] Approved verification adds score event
- [ ] Rejected verification adds negative event
- [ ] More evidence status adds negative/small penalty event

Admin tests:

- [ ] Admin can open trust controls
- [ ] Admin can create manual trust event
- [ ] Manual event affects selected user score

Backend checks:

- [ ] `GET /api/trust-score` works for logged-in user
- [ ] `GET /api/trust-score/<user_id>` works for admin
- [ ] `GET /api/trust-score/events` returns correct events
- [ ] `POST /api/trust-score/events` requires admin

---

## 17. Admin System Test

Admin dashboard:

- [ ] Admin dashboard loads
- [ ] Total users display
- [ ] Total jobs display
- [ ] Total talent profiles display
- [ ] Total applications display
- [ ] Verification requests display
- [ ] Trust score events display
- [ ] Recent activity displays

Admin users:

- [ ] Admin users page loads
- [ ] Admin can view users
- [ ] Admin can change user role
- [ ] Last admin cannot be demoted
- [ ] Last admin cannot be deleted
- [ ] Admin cannot delete self
- [ ] Admin cannot suspend self

Admin job moderation:

- [ ] Admin can view jobs
- [ ] Admin can change job status
- [ ] Job status update saves

Admin application oversight:

- [ ] Admin can view all applications
- [ ] Admin can update application statuses

Admin activity:

- [ ] Activity page loads
- [ ] Activity records show recent platform actions

Backend checks:

- [ ] `GET /api/admin/overview` requires admin
- [ ] `GET /api/admin/users` requires admin
- [ ] `GET /api/admin/activity` requires admin
- [ ] `PATCH /api/admin/users/<user_id>/role` requires admin
- [ ] `PATCH /api/admin/users/<user_id>/status` requires admin
- [ ] `DELETE /api/admin/users/<user_id>` requires admin
- [ ] `PATCH /api/admin/jobs/<job_id>/status` requires admin
- [ ] `POST /api/admin/trust-events` requires admin

---

## 18. System Audit Test

Open:

```txt
/admin/system-audit
```

Checklist:

- [ ] Only admin can access system audit page
- [ ] Audit page loads without crashing
- [ ] Database connection status displays
- [ ] Database name displays
- [ ] Required table checks display
- [ ] Missing tables display if any are missing
- [ ] Row counts display
- [ ] Admin count displays
- [ ] Health score displays
- [ ] Recommendations display

Backend check:

```txt
GET http://localhost:5000/api/system-audit
```

Checklist:

- [ ] Requires admin token
- [ ] Returns JSON response
- [ ] Includes required table list
- [ ] Includes row counts
- [ ] Includes health score

---

## 19. UI and Responsiveness Test

Desktop:

- [ ] Navbar layout is clean
- [ ] User dropdown works
- [ ] Theme switcher works
- [ ] Sidebar layout is clean
- [ ] Cards are aligned
- [ ] Forms are readable
- [ ] Buttons have consistent styling

Mobile:

- [ ] Navbar is responsive
- [ ] Sidebar does not break layout
- [ ] Dashboard cards stack correctly
- [ ] Forms fit screen width
- [ ] Tables do not overflow badly
- [ ] Buttons remain clickable

Theme engine:

- [ ] Trust Blue works
- [ ] Frost System works
- [ ] Emerald Secure works
- [ ] Midnight Admin works
- [ ] Theme stays saved after refresh

---

## 20. Browser Console Test

Open DevTools Console.

Checklist:

- [ ] No red React errors
- [ ] No missing import errors
- [ ] No failed CSS imports
- [ ] No React Router errors
- [ ] No infinite render loop
- [ ] No Axios base URL issue
- [ ] No CORS error
- [ ] No unauthorized errors where user should be authorized

---

## 21. Network/API Test

Open DevTools Network tab.

Checklist:

- [ ] API requests go to `http://localhost:5000/api`
- [ ] Login request returns 200
- [ ] Profile request includes Bearer token
- [ ] Unauthorized requests return 401/403 correctly
- [ ] Public requests do not require token
- [ ] Admin requests require admin token
- [ ] No frontend request points to the wrong port

---

## 22. Security Test

Checklist:

- [ ] Passwords are hashed in database
- [ ] JWT token is required for protected API routes
- [ ] Admin routes require admin role
- [ ] Client cannot access freelancer-only actions
- [ ] Freelancer cannot post jobs
- [ ] Client cannot create talent profile
- [ ] Guest cannot access private pages
- [ ] `.env` is not pushed to GitHub
- [ ] `.env.example` is safe to share
- [ ] No plaintext passwords are exposed by API responses

---

## 23. Final Local Run Test

Run all three systems:

Terminal 1:

```bash
cd trustbridge-kenya/backend
python app.py
```

Terminal 2:

```bash
cd trustbridge-kenya/frontend
npm run dev
```

MySQL:

- [ ] MySQL service is running
- [ ] Database exists
- [ ] Tables exist
- [ ] Seed data exists

Final checklist:

- [ ] Home works
- [ ] Auth works
- [ ] Dashboards work
- [ ] Jobs work
- [ ] Talent works
- [ ] Applications work
- [ ] Verification works
- [ ] Trust score works
- [ ] Admin works
- [ ] System audit works
- [ ] No console errors
- [ ] No Flask errors
- [ ] No MySQL errors

---

## 24. Ready for Deployment Decision

Only move to deployment preparation when all are true:

- [ ] Frontend builds successfully
- [ ] Backend starts successfully
- [ ] Database schema loads successfully
- [ ] Seed data loads successfully
- [ ] Login works
- [ ] Role redirects work
- [ ] Admin dashboard works
- [ ] System audit works
- [ ] API smoke test passes
- [ ] No major console errors
- [ ] No major backend errors

If any item fails, fix it before deployment.
