# Phase 3.2 Final Integration Polish Checklist

Use this checklist after extracting Phase 3.2 and before starting deployment.

## 1. Database setup

```bash
cd trustbridge-kenya/backend
mysql -u root -p < sql/full_schema.sql
mysql -u root -p < sql/seed.sql
mysql -u root -p < sql/schema_check.sql
```

Confirm these tables exist:

- `users`
- `jobs`
- `talent_profiles`
- `profile_skills`
- `portfolio_links`
- `applications`
- `verification_requests`
- `trust_score_events`

## 2. Backend startup

```bash
cd trustbridge-kenya/backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
python app.py
```

PowerShell activation:

```bash
venv\Scripts\activate
```

Open:

```txt
http://127.0.0.1:5000/api/health
```

## 3. Backend smoke test

With Flask running:

```bash
cd trustbridge-kenya/backend
python scripts/api_smoke_test.py
```

The script checks:

- Health endpoint
- Jobs endpoint
- Talent endpoint
- Admin login
- Admin overview
- System audit
- Trust score events

## 4. Frontend startup

```bash
cd trustbridge-kenya/frontend
npm install
npm run dev
```

Open:

```txt
http://localhost:5173
```

## 5. Login test accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@trustbridge.co.ke` | `Admin@12345` |
| Client | `client@trustbridge.co.ke` | `Client@12345` |
| Freelancer | `freelancer@trustbridge.co.ke` | `Freelancer@12345` |
| Member | `member@trustbridge.co.ke` | `Member@12345` |

## 6. Role separation test

Confirm:

- Guest navbar shows Login only.
- Client can access post-job and client jobs.
- Freelancer cannot access post-job.
- Client cannot access profile builder.
- Admin can access admin pages.
- Member, freelancer, and client cannot access admin pages.

## 7. Frontend build test

```bash
cd trustbridge-kenya/frontend
npm run build
```

The build should finish with no Vite import errors.

## 8. Backend compile test

```bash
cd trustbridge-kenya/backend
python -m py_compile app.py routes/*.py utils/*.py config/*.py
```

The command should finish without syntax errors.
