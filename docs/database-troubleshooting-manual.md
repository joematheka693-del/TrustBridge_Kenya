# TrustBridge Kenya Database Troubleshooting Manual

## 1. MySQL refuses connection

Common error:

```txt
Can't connect to MySQL server on 'localhost:3306'
```

Fix:

```bash
# Start MySQL from XAMPP, Laragon, WAMP, MySQL Workbench service panel, or Windows Services.
# Then test:
mysql -u root -p
```

Check that your backend `.env` matches your MySQL setup:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=trustbridge_kenya
```

## 2. Unknown database

Common error:

```txt
Unknown database 'trustbridge_kenya'
```

Fix:

```bash
cd trustbridge-kenya/backend
mysql -u root -p < sql/full_schema.sql
mysql -u root -p < sql/seed.sql
```

## 3. Missing table errors

Common error:

```txt
Table 'trustbridge_kenya.jobs' doesn't exist
```

Fix:

```bash
cd trustbridge-kenya/backend
mysql -u root -p < sql/full_schema.sql
mysql -u root -p < sql/schema_check.sql
```

## 4. Duplicate demo data

If your job list or demo rows are duplicated, use the local reset script:

```bash
cd trustbridge-kenya/backend
mysql -u root -p < sql/reset_database.sql
```

Do not use reset on production because it drops the database.

## 5. Login fails even after seeding

Check that the seed accounts exist:

```sql
USE trustbridge_kenya;
SELECT user_id, name, email, role, status FROM users;
```

Use these demo credentials:

```txt
admin@trustbridge.co.ke       Admin@12345
client@trustbridge.co.ke      Client@12345
freelancer@trustbridge.co.ke  Freelancer@12345
member@trustbridge.co.ke      Member@12345
```

## 6. Backend database health route fails

Test directly:

```txt
http://localhost:5000/api/health/database
```

If it fails, check `.env`, MySQL service status, and whether the schema exists.

## 7. Recommended final local database test

```bash
cd trustbridge-kenya/backend
mysql -u root -p < sql/schema_check.sql
python app.py
```

Then open:

```txt
http://localhost:5000/api/health
http://localhost:5000/api/health/database
```
