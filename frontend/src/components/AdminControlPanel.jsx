import { Link } from 'react-router-dom'
import { Activity, BriefcaseBusiness, ClipboardCheck, DatabaseZap, Gavel, ShieldCheck, SlidersHorizontal, UserCog, Users } from 'lucide-react'
import '../styles/adminControlPanel.css'

const adminControls = [
  { title: 'User control', text: 'Review users, assign roles, and remove unsafe accounts.', to: '/admin/users', icon: Users, tag: 'users' },
  { title: 'Role manager', text: 'Prepare member, freelancer, client, and admin role updates.', to: '/admin/users', icon: UserCog, tag: 'roles' },
  { title: 'Job moderation', text: 'Inspect job posts and prepare approval or suspension decisions.', to: '/admin/jobs', icon: BriefcaseBusiness, tag: 'jobs' },
  { title: 'Application review', text: 'Track job applications and talent invites across the platform.', to: '/admin/applications', icon: ClipboardCheck, tag: 'apps' },
  { title: 'Verification queue', text: 'Approve, reject, or request more freelancer/client evidence.', to: '/admin/verification', icon: ShieldCheck, tag: 'verify' },
  { title: 'Trust controls', text: 'Prepare manual trust score adjustments and event records.', to: '/admin/trust-controls', icon: SlidersHorizontal, tag: 'trust' },
  { title: 'Policy moderation', text: 'Prepare report, dispute, and suspicious activity controls.', to: '/admin/jobs', icon: Gavel, tag: 'safety' },
  { title: 'Platform activity', text: 'Review activity logs for users, jobs, verification, and trust events.', to: '/admin/activity', icon: Activity, tag: 'logs' },
  { title: 'System audit', text: 'Check database tables, row counts, admin count, and health score.', to: '/admin/system-audit', icon: DatabaseZap, tag: 'audit' },
]

function AdminControlPanel() {
  return (
    <section className="admin-control-panel">
      <div className="section-heading-row">
        <div>
          <p className="page-kicker">admin command center</p>
          <h2>Separated admin controls</h2>
        </div>
        <Link className="btn btn-trust-outline" to="/admin/system-audit">Open audit</Link>
      </div>

      <div className="admin-control-grid">
        {adminControls.map((control) => {
          const Icon = control.icon

          return (
            <Link to={control.to} className="admin-control-tile" key={control.title}>
              <div className="admin-control-icon"><Icon size={21} /></div>
              <span>{control.tag}</span>
              <h3>{control.title}</h3>
              <p>{control.text}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default AdminControlPanel
