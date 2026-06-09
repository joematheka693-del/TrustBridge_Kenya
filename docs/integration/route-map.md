# TrustBridge Kenya Route Map

This document keeps the frontend, backend, and role rules aligned before deployment.

## Public frontend routes

| Frontend route | Purpose | Backend route used |
| --- | --- | --- |
| `/` | Landing page | Optional `/api/health` through banner |
| `/jobs` | Public jobs marketplace | `GET /api/jobs` |
| `/jobs/:jobId` | Public job details | `GET /api/jobs/:job_id` |
| `/talent` | Public talent marketplace | `GET /api/talent` |
| `/talent/:profileId` | Public talent details | `GET /api/talent/:profile_id` |
| `/auth` | Login and signup page | `POST /api/login`, `POST /api/signup` |

## Protected user routes

| Frontend route | Allowed roles | Backend route used |
| --- | --- | --- |
| `/dashboard` | signed-in users | frontend role redirect |
| `/member/dashboard` | member | dashboard preview data |
| `/freelancer/dashboard` | freelancer | dashboard preview data |
| `/client/dashboard` | client | dashboard preview data |
| `/profile-builder` | member, freelancer, admin | `POST /api/talent`, `PUT /api/talent/:profile_id` |
| `/post-job` | client, admin | `POST /api/jobs` |
| `/client/jobs` | client | `GET /api/jobs` |
| `/applications` | member, freelancer, client, admin | `GET /api/applications` |
| `/applications/:applicationId` | member, freelancer, client, admin | `GET /api/applications/:application_id` |
| `/applications/new/:applicationType` | member, freelancer, client, admin | `POST /api/applications` |
| `/verification` | member, freelancer, client, admin | `GET /api/verification-requests` |
| `/verification/new` | member, freelancer, client, admin | `POST /api/verification-requests` |
| `/trust-score` | member, freelancer, client, admin | `GET /api/trust-score`, `GET /api/trust-score/events` |

## Admin-only routes

| Frontend route | Backend route used |
| --- | --- |
| `/admin/dashboard` | `GET /api/admin/overview` |
| `/admin/users` | `GET /api/admin/users`, `PATCH /api/admin/users/:user_id/role`, `PATCH /api/admin/users/:user_id/status`, `DELETE /api/admin/users/:user_id` |
| `/admin/jobs` | `GET /api/jobs`, `PATCH /api/admin/jobs/:job_id/status` |
| `/admin/applications` | `GET /api/applications`, `PATCH /api/applications/:application_id/status` |
| `/admin/activity` | `GET /api/admin/activity` |
| `/admin/verification` | `GET /api/verification-requests`, `PATCH /api/verification-requests/:request_id/status` |
| `/admin/trust-controls` | `GET /api/trust-score/events`, `POST /api/admin/trust-events` |
| `/admin/system-audit` | `GET /api/system-audit` |

## Local API configuration

Frontend `.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:5000/api
VITE_API_TIMEOUT_MS=12000
```

Backend `.env`:

```env
FRONTEND_URL=http://localhost:5173
FLASK_RUN_PORT=5000
```

Using `localhost` for one side and `127.0.0.1` for the other usually works locally, but keeping the API base consistent reduces CORS/debug confusion.
