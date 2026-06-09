# TrustBridge Kenya SQL Manual

Phase 3.0 turns the SQL folder into the stable database foundation for the project. The database is still simple enough for local development, but it now has clearer constraints, indexes, seed rules, reset instructions, and schema-check tools.

## Files

```txt
backend/sql/full_schema.sql
backend/sql/seed.sql
backend/sql/schema_check.sql
backend/sql/reset_database.sql
```

## Recommended local setup

Run these from the project root:

```bash
cd trustbridge-kenya/backend
mysql -u root -p < sql/full_schema.sql
mysql -u root -p < sql/seed.sql
```

Then check the database:

```bash
mysql -u root -p < sql/schema_check.sql
```

## Full reset option

Use this when your local database is messy, duplicated, or missing tables:

```bash
mysql -u root -p < sql/reset_database.sql
```

This deletes and recreates the `trustbridge_kenya` database. Do not run it on production.

## Required tables

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

## Demo accounts

```txt
admin@trustbridge.co.ke       Admin@12345
client@trustbridge.co.ke      Client@12345
freelancer@trustbridge.co.ke  Freelancer@12345
member@trustbridge.co.ke      Member@12345
```

## Important database rules

- Users have unique emails.
- Jobs belong to a user account.
- Talent profiles belong to one user account.
- Profile skills and portfolio links belong to a talent profile.
- Applications can reference sender and receiver users.
- Verification requests belong to users and can be reviewed by admins.
- Trust score events belong to users and can optionally reference the admin who created/reviewed the event.
- Demo jobs are reset before inserting seed jobs to avoid repeated duplicate demo rows.

## Phase 3.0 improvements

- Added composite indexes for common dashboard queries.
- Added safer demo seed behavior.
- Fixed the talent invite seed row so the applications seed inserts correctly.
- Added schema check SQL.
- Added local reset SQL.
- Added database troubleshooting documentation.
