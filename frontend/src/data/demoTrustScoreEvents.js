export const demoTrustScoreEvents = [
  {
    id: 'trust-001',
    userId: 2,
    userName: 'Demo Freelancer',
    userRole: 'freelancer',
    eventType: 'approved_verification',
    points: 15,
    reason: 'GitHub and portfolio evidence approved by admin review.',
    createdAt: '2026-06-02',
  },
  {
    id: 'trust-002',
    userId: 2,
    userName: 'Demo Freelancer',
    userRole: 'freelancer',
    eventType: 'talent_profile_completed',
    points: 8,
    reason: 'Profile contains category, bio, skills, rate, and portfolio links.',
    createdAt: '2026-06-03',
  },
  {
    id: 'trust-003',
    userId: 3,
    userName: 'Demo Client',
    userRole: 'client',
    eventType: 'job_posted',
    points: 2,
    reason: 'Client posted a complete job with budget and timeline.',
    createdAt: '2026-06-04',
  },
  {
    id: 'trust-004',
    userId: 1,
    userName: 'Demo Member',
    userRole: 'member',
    eventType: 'application_submitted',
    points: 2,
    reason: 'Member submitted a clear beginner application.',
    createdAt: '2026-06-05',
  },
  {
    id: 'trust-005',
    userId: 2,
    userName: 'Demo Freelancer',
    userRole: 'freelancer',
    eventType: 'manual_admin_event',
    points: 6,
    reason: 'Admin added trust points for consistent delivery proof.',
    createdAt: '2026-06-06',
  },
  {
    id: 'trust-006',
    userId: 3,
    userName: 'Demo Client',
    userRole: 'client',
    eventType: 'more_evidence_needed',
    points: -3,
    reason: 'Business evidence needs clearer company profile details.',
    createdAt: '2026-06-07',
  },
]

export const scoreRules = [
  { label: 'Base trust score', points: 45, tone: 'neutral' },
  { label: 'Approved verification', points: 15, tone: 'positive' },
  { label: 'Completed talent profile', points: 8, tone: 'positive' },
  { label: 'Application submitted', points: 2, tone: 'positive' },
  { label: 'Job posted', points: 2, tone: 'positive' },
  { label: 'Rejected verification', points: -10, tone: 'negative' },
  { label: 'Manual admin event', points: 'custom', tone: 'admin' },
]

export function calculatePreviewScore(user, events = demoTrustScoreEvents) {
  const baseScore = 45
  const userEvents = events.filter((event) => event.userId === user?.id || event.userRole === user?.role)
  const eventTotal = userEvents.reduce((total, event) => total + Number(event.points || 0), 0)
  return Math.max(0, Math.min(100, baseScore + eventTotal))
}
