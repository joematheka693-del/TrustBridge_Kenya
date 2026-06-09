# Troubleshooting Manual

This manual covers common TrustBridge Kenya setup and runtime issues.

## 1. Frontend does not start

Run:

```bash
cd trustbridge-kenya/frontend
npm install
npm run dev
```

Common fixes:

| Error | Fix |
|---|---|
| vite not found | Run `npm install` |
| module not found | Check import path and file name case |
| blank page | Open browser console and fix first import error |
| React Router error | Check route path in `App.jsx` |

## 2. Backend does not start

Run:

```bash
cd trustbridge-kenya/backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
python app.py
```

PowerShell activation:

```bash
venv\Scriptsctivate
```

Common fixes:

| Error | Fix |
|---|---|
| flask not found | Run `pip install -r requirements.txt` |
| pymysql not found | Run `pip install -r requirements.txt` |
| environment variable missing | Copy `.env.example` to `.env` |
| port already in use | Stop the old Flask process or change port |

## 3. MySQL connection refused

Check:

```txt
MySQL server is running
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=trustbridge_kenya
```

Then run:

```bash
mysql -u root -p < backend/sql/full_schema.sql
mysql -u root -p < backend/sql/seed.sql
```

## 4. CORS error

Make sure backend `.env` has:

```env
FRONTEND_URL=http://localhost:5173
```

Make sure frontend `.env` has:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 5. Login works but role page says unauthorized

The logged-in user role does not match the protected route. Use the correct demo account or change the role from admin user management.

## 6. 404 API route

Check whether the frontend is calling the correct path.

Correct pattern:

```txt
Frontend base: http://localhost:5000/api
Backend route: /api/jobs
Frontend service call: /jobs
```

## 7. 500 backend error

Check the Flask terminal. Most 500 errors come from wrong SQL table names, missing columns, or failed database connection.

## 8. Safe reset for local database

Use only locally:

```bash
mysql -u root -p < backend/sql/reset_database.sql
mysql -u root -p < backend/sql/full_schema.sql
mysql -u root -p < backend/sql/seed.sql
```

Do not run reset scripts on production.
