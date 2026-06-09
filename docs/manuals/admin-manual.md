# Admin Manual

Admins control TrustBridge Kenya operations, safety, quality, roles, verification, trust score events, moderation, and system audit.

## 1. Admin access

Demo admin account:

```txt
Email: admin@trustbridge.co.ke
Password: Admin@12345
```

After login, the admin dashboard and admin sidebar controls become available.

## 2. Admin dashboard

The admin dashboard includes:

| Control | Purpose |
|---|---|
| Users | View, suspend, delete, or update roles |
| Role manager | Change user role safely |
| Job moderation | Review and moderate jobs |
| Application review | Inspect platform applications and invites |
| Verification queue | Approve, reject, or request more evidence |
| Trust controls | Add manual trust score events |
| Activity logs | Review recent platform activity |
| System audit | Check database and deployment readiness |

## 3. User management

Route:

```txt
/admin/users
```

Admins can:

| Action | Rule |
|---|---|
| View users | Admin only |
| Change roles | Admin only |
| Suspend users | Admin only |
| Delete users | Admin only |

Safety rules already included:

| Rule | Reason |
|---|---|
| Last admin cannot be demoted | Prevent losing admin access |
| Last admin cannot be deleted | Prevent platform lockout |
| Admin cannot suspend their own admin account | Prevent accidental lockout |
| Admin cannot delete self from admin endpoint | Prevent accidental lockout |

## 4. Job moderation

Route:

```txt
/admin/jobs
```

Admins can update job status and moderate poor-quality jobs.

Recommended statuses:

| Status | Use case |
|---|---|
| active | Job is visible |
| under_review | Job needs admin review |
| closed | Job is no longer active |
| rejected | Job violates platform standards |

## 5. Verification queue

Route:

```txt
/admin/verification
```

Admins can:

| Action | Meaning |
|---|---|
| Approve | Evidence is acceptable |
| Reject | Evidence is invalid |
| Request more evidence | User must provide better proof |

Verification decisions create trust score events.

## 6. Trust controls

Route:

```txt
/admin/trust-controls
```

Admins can add manual trust events for special cases.

Examples:

| Event | Points |
|---|---:|
| Excellent platform conduct | +5 |
| Confirmed dispute warning | -12 |
| Manual correction | Custom |

## 7. System audit

Route:

```txt
/admin/system-audit
```

Admins should run system audit before deployment and after database resets.

## 8. Admin restrictions

Admin access must not be shared with clients or freelancers. Admin routes must remain protected on both frontend and backend.
