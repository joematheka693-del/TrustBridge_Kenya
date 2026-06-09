import { Link } from 'react-router-dom'
import { BriefcaseBusiness, ClipboardCheck, FilePlus2, Search, ShieldCheck, Star, Users } from 'lucide-react'
import DashboardLayout from './DashboardLayout.jsx'
import TrustScoreCard from '../components/TrustScoreCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { calculatePreviewScore } from '../data/demoTrustScoreEvents.js'
import '../styles/roleDashboard.css'

const clientCards = [
  { title: 'Post job', detail: 'Create job posts with budget, timeline, category, and skill requirements.', icon: FilePlus2, to: '/post-job', status: 'Client only' },
  { title: 'Client jobs', detail: 'Manage jobs posted by this client account only.', icon: BriefcaseBusiness, to: '/client/jobs', status: 'Owner area' },
  { title: 'Talent search', detail: 'Browse freelancer profiles and invite the right people to apply.', icon: Search, to: '/talent', status: 'Hiring' },
  { title: 'Applications and invites', detail: 'Review applications and track talent invitations.', icon: Users, to: '/applications', status: 'Pipeline' },
  { title: 'Business verification', detail: 'Submit business profile evidence so freelancers can trust you.', icon: ShieldCheck, to: '/verification', status: 'Evidence' },
  { title: 'Hiring trust', detail: 'Build trust through responsible hiring and verified business details.', icon: Star, to: '/trust-score', status: 'Reputation' },
]

function ClientDashboard() {
  const { user, role } = useAuth()

  return (
    <DashboardLayout title="Client Dashboard" kicker="client access" description="This dashboard is only for clients. Freelancer profile-builder controls and admin controls are separated.">
      <TrustScoreCard score={calculatePreviewScore(user)} role={role} summary="Your client score grows when you verify your business, post clear jobs, and handle applications professionally." />

      <div className="dashboard-split-strip client-strip">
        <article>
          <span>Open jobs</span>
          <strong>3 demo</strong>
          <p>Client-owned job management is separated from freelancer actions.</p>
        </article>
        <article>
          <span>Talent invites</span>
          <strong>5 demo</strong>
          <p>Invites use the applications system but stay inside the client workflow.</p>
        </article>
        <article>
          <span>Hiring safety</span>
          <strong>Active</strong>
          <p>Verification and trust score support safer hiring decisions.</p>
        </article>
      </div>

      <div className="role-dashboard-grid">
        {clientCards.map((card) => {
          const Icon = card.icon

          return (
            <Link className="role-dashboard-card dashboard-action-card" to={card.to} key={card.title}>
              <div className="dashboard-card-topline">
                <Icon size={24} />
                <span>{card.status}</span>
              </div>
              <h3>{card.title}</h3>
              <p>{card.detail}</p>
            </Link>
          )
        })}
      </div>
    </DashboardLayout>
  )
}

export default ClientDashboard
