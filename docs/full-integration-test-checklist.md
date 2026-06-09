# Full Integration Test Checklist

Use this checklist before deployment and after major changes.

## 1. Environment setup

| Test | Pass |
|---|---|
| Frontend `.env` has `VITE_API_BASE_URL` | [ ] |
| Backend `.env` has database credentials | [ ] |
| Backend `.env` has `FRONTEND_URL` | [ ] |
| MySQL is running | [ ] |
| Schema loaded | [ ] |
| Seed data loaded | [ ] |

## 2. Frontend test

| Test | Pass |
|---|---|
| `npm install` works | [ ] |
| `npm run dev` works | [ ] |
| `npm run build` works | [ ] |
| Home page opens | [ ] |
| Navbar works | [ ] |
| Theme switcher works | [ ] |
| Sidebar works on dashboards | [ ] |
| Mobile layout is usable | [ ] |

## 3. Backend test

| Test | Pass |
|---|---|
| `pip install -r requirements.txt` works | [ ] |
| `python app.py` starts Flask | [ ] |
| `/api/health` works | [ ] |
| `/api/health/database` works | [ ] |
| No Flask startup errors | [ ] |

## 4. Authentication test

| Test | Pass |
|---|---|
| Signup works | [ ] |
| Login works | [ ] |
| JWT is saved | [ ] |
| `/api/profile` works | [ ] |
| Logout clears session | [ ] |
| Guest navbar shows only Login | [ ] |
| Logged-in navbar shows account dropdown | [ ] |

## 5. Role routing test

| Test | Pass |
|---|---|
| Member redirects to member dashboard | [ ] |
| Freelancer redirects to freelancer dashboard | [ ] |
| Client redirects to client dashboard | [ ] |
| Admin redirects to admin dashboard | [ ] |
| Freelancer cannot access `/post-job` | [ ] |
| Client cannot access `/profile-builder` | [ ] |
| Non-admin cannot access `/admin/users` | [ ] |

## 6. Jobs test

| Test | Pass |
|---|---|
| Public user can view jobs | [ ] |
| Public user can view job details | [ ] |
| Client can post job | [ ] |
| Admin can post job | [ ] |
| Freelancer cannot post job | [ ] |
| Client can see own jobs | [ ] |
| Admin can moderate jobs | [ ] |

## 7. Talent test

| Test | Pass |
|---|---|
| Public user can view talent | [ ] |
| Public user can view talent details | [ ] |
| Freelancer can build profile | [ ] |
| Member can build beginner profile | [ ] |
| Client cannot create talent profile | [ ] |
| Admin can manage talent | [ ] |

## 8. Applications and invites test

| Test | Pass |
|---|---|
| Freelancer can apply for job | [ ] |
| Member can apply for job | [ ] |
| Client can invite talent | [ ] |
| User can view own applications | [ ] |
| Client can view related applications | [ ] |
| Admin can view all applications | [ ] |
| Admin/client can update allowed statuses | [ ] |

## 9. Verification test

| Test | Pass |
|---|---|
| User can submit verification | [ ] |
| User can view own verification records | [ ] |
| Admin can view verification queue | [ ] |
| Admin can approve verification | [ ] |
| Admin can reject verification | [ ] |
| Admin can request more evidence | [ ] |

## 10. Trust score test

| Test | Pass |
|---|---|
| User can view trust score | [ ] |
| Approved verification adds points | [ ] |
| Rejected verification removes points | [ ] |
| Job posting creates trust event | [ ] |
| Talent profile creates trust event | [ ] |
| Application creates trust event | [ ] |
| Admin can add manual trust event | [ ] |

## 11. Admin test

| Test | Pass |
|---|---|
| Admin overview loads | [ ] |
| Admin users page loads | [ ] |
| Admin can update role | [ ] |
| Last admin cannot be demoted | [ ] |
| Last admin cannot be deleted | [ ] |
| Admin activity loads | [ ] |
| Admin job moderation loads | [ ] |
| System audit loads | [ ] |

## 12. Deployment readiness

| Test | Pass |
|---|---|
| Frontend build passes | [ ] |
| Backend compile check passes | [ ] |
| System audit health is acceptable | [ ] |
| No console errors on main pages | [ ] |
| No Flask errors during common actions | [ ] |
| `.env` files are not committed | [ ] |
| Production URLs are configured | [ ] |
