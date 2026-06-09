# TrustBridge Kenya Full Database Test Checklist

Use this before moving to deployment preparation.

## SQL setup

```bash
cd trustbridge-kenya/backend
mysql -u root -p < sql/full_schema.sql
mysql -u root -p < sql/seed.sql
mysql -u root -p < sql/schema_check.sql
```

## Required table checklist

- [ ] users
- [ ] jobs
- [ ] talent_profiles
- [ ] profile_skills
- [ ] portfolio_links
- [ ] applications
- [ ] verification_requests
- [ ] trust_score_events

## Seed data checklist

- [ ] Admin account exists
- [ ] Client account exists
- [ ] Freelancer account exists
- [ ] Member account exists
- [ ] Demo jobs exist
- [ ] Demo talent profiles exist
- [ ] Demo applications exist
- [ ] Demo verification requests exist
- [ ] Demo trust score events exist

## Backend route checklist

- [ ] `GET /api/health` works
- [ ] `GET /api/health/database` works
- [ ] `POST /api/login` works
- [ ] `GET /api/jobs` returns demo jobs
- [ ] `GET /api/talent` returns demo talent
- [ ] `GET /api/applications` works after login
- [ ] `GET /api/verification-requests` works after login
- [ ] `GET /api/trust-score` works after login
- [ ] `GET /api/admin/overview` works as admin
- [ ] `GET /api/system-audit` works as admin

## Frontend connection checklist

- [ ] Frontend `.env` has `VITE_API_BASE_URL=http://localhost:5000/api`
- [ ] Backend `.env` has `FRONTEND_URL=http://localhost:5173`
- [ ] Login page can log in with admin account
- [ ] Jobs page loads backend jobs
- [ ] Talent page loads backend profiles
- [ ] Admin system audit shows real database values
