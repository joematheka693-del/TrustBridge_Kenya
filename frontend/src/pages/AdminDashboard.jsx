import { useEffect, useMemo, useState } from 'react'
import { Activity, BriefcaseBusiness, ClipboardCheck, DatabaseZap, Gauge, ShieldCheck, Star, UserCog, Users } from 'lucide-react'
import DashboardLayout from './DashboardLayout.jsx'
import AdminControlPanel from '../components/AdminControlPanel.jsx'
import TrustScoreCard from '../components/TrustScoreCard.jsx'
import StateNotice from '../components/StateNotice.jsx'
import { getAdminOverview } from '../services/adminApi.js'
import '../styles/roleDashboard.css'

const fallbackTotals = {
  users: 4,
  jobs: 3,
  talent_profiles: 3,
  applications: 3,
  verification_requests: 3,
  trust_score_events: 4,
}

function AdminDashboard() {
  const [totals, setTotals] = useState(fallbackTotals)
  const [backendMessage, setBackendMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadOverview() {
      try {
        const response = await getAdminOverview()
        if (isMounted) {
          setTotals(response?.totals || fallbackTotals)
          setBackendMessage('Admin overview API connected.')
        }
      } catch (error) {
        if (isMounted) {
          setTotals(fallbackTotals)
          setBackendMessage(error?.message || 'Admin overview API unavailable. Preview totals are shown.')
        }
      }
    }

    loadOverview()

    return () => {
      isMounted = false
    }
  }, [])

  const adminStats = useMemo(() => [
    { title: 'Total users', value: `${totals.users} accounts`, icon: Users, detail: 'Member, freelancer, client, and admin roles are separated.' },
    { title: 'Jobs control', value: `${totals.jobs} records`, icon: BriefcaseBusiness, detail: 'Admin-only route is connected for job status control.' },
    { title: 'Talent profiles', value: `${totals.talent_profiles} profiles`, icon: UserCog, detail: 'Admin can inspect freelancer/member profile records later.' },
    { title: 'Applications', value: `${totals.applications} records`, icon: ClipboardCheck, detail: 'Applications and talent invites are visible to admin oversight.' },
    { title: 'Verification queue', value: `${totals.verification_requests} requests`, icon: ShieldCheck, detail: 'Approve, reject, or request more evidence.' },
    { title: 'Trust events', value: `${totals.trust_score_events} events`, icon: Star, detail: 'Admin manual score events are connected.' },
    { title: 'System audit', value: 'Health checks', icon: Gauge, detail: 'Database tables, row counts, and health score checks are planned.' },
    { title: 'Activity feed', value: 'Platform oversight', icon: Activity, detail: 'Recent platform actions are pulled from backend records.' },
  ], [totals])

  return (
    <DashboardLayout title="Admin Dashboard" kicker="admin access" description="This is a separate admin command center. It does not share client or freelancer workspace controls.">
      {backendMessage && <StateNotice type={backendMessage.includes('connected') ? 'success' : 'warning'} title="Admin overview API status" description={backendMessage} />}
      <TrustScoreCard score={92} role="admin" summary="Admin reputation view monitors platform trust health, user evidence, job moderation, and manual trust events." />

      <div className="role-dashboard-grid admin-dashboard-grid">
        {adminStats.map((item) => {
          const Icon = item.icon

          return (
            <article className="role-dashboard-card admin-control-card" key={item.title}>
              <div className="dashboard-card-topline">
                <Icon size={24} />
                <span>{item.value}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          )
        })}
      </div>

      <AdminControlPanel />

      <section className="admin-activity-board">
        <div className="section-heading-row">
          <div>
            <p className="page-kicker">platform activity</p>
            <h2>Admin backend control summary</h2>
          </div>
          <span>Phase 2.7</span>
        </div>
        <div className="admin-activity-list">
          <article><DatabaseZap size={18} /><span>Admin overview counts are connected under /api/admin/overview.</span></article>
          <article><ShieldCheck size={18} /><span>User role, status, and delete controls are admin-only.</span></article>
          <article><Star size={18} /><span>Manual trust score events are routed through /api/admin/trust-events.</span></article>
          <article><BriefcaseBusiness size={18} /><span>Job moderation uses /api/admin/jobs/:job_id/status.</span></article>
        </div>
      </section>
    </DashboardLayout>
  )
}

export default AdminDashboard
