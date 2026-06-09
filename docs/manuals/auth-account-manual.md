# Authentication and Account Manual

This manual explains signup, login, JWT storage, role redirects, and protected route behavior.

## 1. Main auth routes

Backend routes:

```txt
POST /api/signup
POST /api/login
GET /api/profile
GET /api/protected
```

Frontend route:

```txt
/auth
```

## 2. Guest navbar behavior

When a visitor is not logged in, the navbar shows only the Login action. Login opens the auth page. The auth page supports both login and signup.

## 3. Signup flow

Signup creates a new user record in the `users` table.

Allowed public signup roles:

```txt
member
freelancer
client
```

Admin accounts should be seeded or created by an existing admin.

## 4. Login flow

Login validates email and password. If valid, the backend returns a JWT token and user data.

The frontend stores:

| Item | Purpose |
|---|---|
| token | Used in Authorization header |
| user | Used for navbar, role routes, and dashboards |

## 5. JWT request format

Authenticated requests use:

```txt
Authorization: Bearer TOKEN_HERE
```

The Axios client attaches this token automatically after login.

## 6. Dashboard redirect

Role redirect rules:

| Role | Redirect |
|---|---|
| member | `/dashboard/member` |
| freelancer | `/dashboard/freelancer` |
| client | `/dashboard/client` |
| admin | `/admin/dashboard` |

## 7. Protected routes

Protected routes check login status. Role-protected routes also check user role.

Examples:

| Route | Access |
|---|---|
| `/profile-builder` | member, freelancer, admin |
| `/post-job` | client, admin |
| `/admin/users` | admin only |
| `/admin/system-audit` | admin only |

## 8. Common auth problems

| Problem | Likely cause | Fix |
|---|---|---|
| Login fails | Wrong password or missing backend | Check backend terminal and credentials |
| Profile route fails | Token missing or expired | Logout and login again |
| 403 forbidden | Role not allowed | Login using the correct role |
| CORS error | Wrong frontend/backend URL config | Check `FRONTEND_URL` and `VITE_API_BASE_URL` |
