export const demoSystemAudit = {
  database: {
    connected: false,
    name: 'trustbridge_kenya',
    mode: 'frontend preview',
    healthScore: 78,
  },
  counts: {
    users: 4,
    jobs: 4,
    talent: 4,
    applications: 4,
    verification: 4,
    trustEvents: 5,
    admins: 1,
  },
  requiredTables: [
    { name: 'users', status: 'planned', rows: 4 },
    { name: 'jobs', status: 'planned', rows: 4 },
    { name: 'talent_profiles', status: 'planned', rows: 4 },
    { name: 'profile_skills', status: 'planned', rows: 12 },
    { name: 'portfolio_links', status: 'planned', rows: 6 },
    { name: 'applications', status: 'planned', rows: 4 },
    { name: 'verification_requests', status: 'planned', rows: 4 },
    { name: 'trust_score_events', status: 'planned', rows: 5 },
  ],
  recommendations: [
    'Backend connection is still in preview mode. Connect /api/system-audit in the backend phase.',
    'Create one protected admin account before public testing.',
    'Confirm all required MySQL tables exist before deployment.',
    'Keep admin role updates restricted to admin-only backend routes.',
  ],
}
