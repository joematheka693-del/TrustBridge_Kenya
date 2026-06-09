# Phase 1.2 — Jobs Frontend System

## Goal

This phase adds the first real marketplace section for TrustBridge Kenya.

## What was added

- Jobs listing page with cards
- Job search, category filter, and level filter
- Job details route
- Client/admin post-job form
- Client/admin job management shell
- Job preview fallback data
- Jobs API service file using Axios
- JobContext for shared frontend job state
- Separate styles for job cards, filters, details, post-job form, and client job controls

## Role separation

Guests can browse jobs and open job details.

Members and freelancers can browse jobs and access the apply path.

Clients can post jobs and manage client jobs.

Admins can post jobs and access moderation-style job controls.

Freelancers cannot access the post-job route.

Clients cannot access freelancer-only profile builder tools.

## Important routes

- /jobs
- /jobs/:jobId
- /post-job
- /client/jobs
- /admin/jobs

## Frontend files added

- src/data/demoJobs.js
- src/context/JobContext.jsx
- src/services/jobsApi.js
- src/components/JobCard.jsx
- src/components/JobFilters.jsx
- src/components/PostJobForm.jsx
- src/pages/JobDetails.jsx
- src/pages/PostJob.jsx
- src/pages/ClientJobs.jsx
- src/styles/jobCard.css
- src/styles/jobFilters.css
- src/styles/jobs.css
- src/styles/jobDetails.css
- src/styles/postJobForm.css
- src/styles/clientJobs.css

## Test result

The frontend build was tested successfully with npm run build.
