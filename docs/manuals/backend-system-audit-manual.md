# Backend System Audit Manual

The system audit checks whether TrustBridge Kenya is ready for testing or deployment.

## 1. Audit route

Backend route:

```txt
GET /api/system-audit
```

Frontend route:

```txt
/admin/system-audit
```

Only admins can access the audit page.

## 2. What the audit checks

| Check | Purpose |
|---|---|
| Database connection | Confirms Flask can connect to MySQL |
| Database name | Confirms correct database is selected |
| Required tables | Confirms core tables exist |
| Missing tables | Shows setup errors |
| Row counts | Shows whether seed data exists |
| Admin count | Confirms admin access exists |
| Health score | Gives readiness score |
| Recommendations | Explains what to fix |

## 3. Required tables

```txt
users
jobs
talent_profiles
profile_skills
portfolio_links
applications
verification_requests
trust_score_events
```

## 4. When to run audit

Run audit after:

| Time | Reason |
|---|---|
| Fresh SQL setup | Confirm tables and seeds |
| Backend changes | Confirm routes still see DB |
| Before deployment | Confirm readiness |
| After deployment | Confirm production DB works |
| After errors | Identify missing tables or failed connection |

## 5. Audit troubleshooting

| Issue | Fix |
|---|---|
| Database connection failed | Check MySQL is running and `.env` credentials are correct |
| Missing tables | Run `full_schema.sql` |
| No admin user | Run `seed.sql` |
| Low health score | Read audit recommendations |
| 403 on audit route | Login as admin |
