# Client Manual

Clients use TrustBridge Kenya to post jobs, search talent, invite freelancers, and manage hiring activity.

## 1. Client access

Login using a client account. Demo account:

```txt
Email: client@trustbridge.co.ke
Password: Client@12345
```

After login, the app opens the client dashboard.

## 2. Client dashboard

The client dashboard should show:

| Section | Purpose |
|---|---|
| Post job shortcut | Create a new job quickly |
| Client jobs | View jobs posted by the client |
| Talent search | Find freelancers |
| Applications/invites | Review incoming applications and sent invites |
| Hiring trust | View trust-related client activity |

## 3. Posting a job

Go to `/post-job` or use the sidebar shortcut.

Required job information:

| Field | Meaning |
|---|---|
| Title | Job name |
| Category | Job type |
| Budget | Client budget |
| Timeline | Expected delivery time |
| Location | Remote, Nairobi, Kenya, hybrid, etc. |
| Description | Full job explanation |

Clients can create jobs. Freelancers cannot post jobs.

## 4. Managing client jobs

Go to `/client/jobs`.

Clients can view their own jobs and prepare updates or deletion. Admins can moderate all jobs.

## 5. Searching talent

Go to `/talent`.

Clients can filter talent by category, skill level, location, rate, and skills. Talent profiles are public so clients can inspect freelancer work before inviting them.

## 6. Inviting talent

From a talent details page, clients can start a talent invite.

Invite records include:

| Field | Purpose |
|---|---|
| Source title | Talent or job target |
| Message | Invitation details |
| Budget | Offer budget |
| Timeline | Expected duration |
| Status | pending, shortlisted, rejected, or accepted |

## 7. Verification for clients

Clients can submit business profile evidence to increase trust. This is useful before hiring freelancers.

Evidence examples:

| Evidence type | Example |
|---|---|
| Business profile | Company website or registration page |
| Previous work proof | Portfolio or completed project proof |
| Certificate | Business or training certificate |

## 8. Client restrictions

Clients cannot create freelancer talent profiles. Clients cannot access admin pages. Clients cannot approve verification requests or change user roles.
