# TrustBridge Kenya Deployment Guide

This guide explains how to prepare TrustBridge Kenya for deployment.

## 1. Recommended deployment split

| Part | Recommended hosts |
|---|---|
| Frontend | Vercel or Netlify |
| Backend | Render, Railway, AlwaysData, PythonAnywhere, or similar Python host |
| Database | Hosted MySQL provider |

## 2. Local ports

Local development should use:

```txt
Frontend: http://localhost:5173
Backend: http://localhost:5000
MySQL: localhost:3306
API base: http://localhost:5000/api
```

Different localhost ports do not interfere if CORS and API URLs are correct.

## 3. Frontend environment

Create:

```txt
frontend/.env
```

Local:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Production:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

## 4. Backend environment

Create:

```txt
backend/.env
```

Local example:

```env
APP_NAME=TrustBridge Kenya API
FLASK_ENV=development
FLASK_DEBUG=True
BACKEND_HOST=0.0.0.0
BACKEND_PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=change-this-secret-before-production
JWT_EXPIRES_HOURS=24
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=trustbridge_kenya
```

Production changes:

| Setting | Production requirement |
|---|---|
| FLASK_DEBUG | False |
| FRONTEND_URL | Deployed frontend URL |
| JWT_SECRET | Strong secret value |
| DB_HOST | Hosted database hostname |
| DB_PASSWORD | Production database password |

## 5. Frontend deployment checklist

```bash
cd trustbridge-kenya/frontend
npm install
npm run build
```

Deploy the `frontend` folder to Vercel or Netlify.

Build command:

```bash
npm run build
```

Output folder:

```txt
dist
```

## 6. Backend deployment checklist

```bash
cd trustbridge-kenya/backend
pip install -r requirements.txt
python -m py_compile app.py routes/*.py utils/*.py config/*.py
```

Production start command depends on host. For many hosts:

```bash
gunicorn app:app
```

## 7. Database deployment checklist

Run schema and seed once on the production MySQL database:

```bash
mysql -h DB_HOST -u DB_USER -p DB_NAME < backend/sql/full_schema.sql
mysql -h DB_HOST -u DB_USER -p DB_NAME < backend/sql/seed.sql
```

After deployment, login as admin and open:

```txt
/admin/system-audit
```

## 8. Security checklist before production

| Item | Required |
|---|---|
| `.env` is not uploaded to GitHub | Yes |
| JWT secret changed | Yes |
| Debug disabled | Yes |
| CORS uses production frontend URL | Yes |
| Database password is strong | Yes |
| Admin password changed | Yes |
| System audit passes | Yes |

## 9. Deployment verification

After deployment, test:

| Test | Expected result |
|---|---|
| Open frontend | Loads home page |
| Health route | Backend returns OK |
| Signup | Creates account |
| Login | Returns token and user |
| Jobs page | Loads jobs from API |
| Talent page | Loads talent from API |
| Admin audit | Shows database checks |
