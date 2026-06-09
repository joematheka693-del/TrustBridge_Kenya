# General User Manual

This manual explains how a normal visitor or registered user uses TrustBridge Kenya.

## 1. Opening the app

Open the frontend in the browser.

Local frontend address:

```bash
http://localhost:5173
```

Production frontend address will be the deployed Vercel or Netlify URL.

## 2. Public pages

Guests can view:

| Page | Purpose |
|---|---|
| Home | Understand what TrustBridge Kenya does |
| Jobs | Browse public job opportunities |
| Job Details | Read a full job description |
| Talent | Browse freelancer profiles |
| Talent Details | Review freelancer skills and portfolio links |
| Auth | Login or create an account |

Guests cannot apply, post jobs, submit verification, or access dashboards until they login.

## 3. Creating an account

Go to the auth page from the navbar.

The navbar shows only `Login` when the user is not logged in. The auth page contains both login and signup actions, so a new user can create an account from the same page.

During signup, select the correct role:

| Role | Choose this if |
|---|---|
| member | You are starting and want beginner access |
| freelancer | You want to build a talent profile and apply for jobs |
| client | You want to hire freelancers and post jobs |

Admin accounts should be created through seed data or by an existing admin.

## 4. Logging in

Use the auth page to login. After login, TrustBridge saves the JWT token and user session in the browser.

After login, the navbar changes from guest mode to account mode. The user dropdown appears with the active account information and logout action.

## 5. Dashboard redirect

After login, TrustBridge sends each user to the correct dashboard.

| Role | Dashboard |
|---|---|
| member | Member dashboard |
| freelancer | Freelancer dashboard |
| client | Client dashboard |
| admin | Admin dashboard |

## 6. Logging out

Use the navbar dropdown and select logout. The app clears the session and returns to guest mode.

## 7. Common user actions

| Action | Who can do it |
|---|---|
| Browse jobs | Everyone |
| Browse talent | Everyone |
| Apply for jobs | Members and freelancers |
| Post jobs | Clients and admins |
| Invite talent | Clients |
| Submit verification | Members, freelancers, clients |
| View trust score | Logged-in users |
| Moderate platform | Admin only |
