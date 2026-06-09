# Verification and Trust Score Manual

Verification and trust score are the core trust systems in TrustBridge Kenya.

## 1. Verification purpose

Verification allows users to prove credibility using external evidence.

Supported evidence examples:

| Evidence type | Best for |
|---|---|
| Portfolio link | Freelancers |
| GitHub link | Developers |
| Certificate link | Trained users |
| Business profile | Clients |
| Previous work proof | Freelancers and clients |
| Identity proof | Future upgrade |

## 2. Verification flow

1. User opens `/verification/new`.
2. User submits evidence.
3. Request status starts as `pending`.
4. Admin reviews from `/admin/verification`.
5. Admin approves, rejects, or requests more evidence.
6. Trust score event is created automatically.

## 3. Verification statuses

| Status | Meaning |
|---|---|
| pending | Waiting for admin review |
| approved | Evidence accepted |
| rejected | Evidence not accepted |
| more_evidence_needed | User must submit better proof |

## 4. Trust score formula

| Event | Points |
|---|---:|
| Base score | 45 |
| Approved verification | +15 |
| Rejected verification | -10 |
| More evidence needed | -3 |
| Talent profile completed | +8 |
| Application submitted | +2 |
| Job posted | +2 |
| Manual admin event | Admin-defined |

Minimum score is `0`. Maximum score is `100`.

## 5. Trust score routes

Backend routes:

```txt
GET /api/trust-score
GET /api/trust-score/<user_id>
GET /api/trust-score/events
POST /api/trust-score/events
```

Frontend routes:

```txt
/trust-score
/admin/trust-controls
```

## 6. Admin manual trust events

Admins can add manual events for exceptional cases.

Examples:

| Reason | Points |
|---|---:|
| Verified successful project outside automated flow | +5 |
| Fraud warning | -20 |
| Manual correction | Custom |

## 7. Recommended trust score interpretation

| Score range | Meaning |
|---|---|
| 0-39 | Low trust, needs improvement |
| 40-59 | New or moderate trust |
| 60-79 | Good trust |
| 80-100 | Strong trust |
