import { Link } from 'react-router-dom'
import { BriefcaseBusiness, ClipboardCheck, ShieldCheck, Star, Trophy, UserCog } from 'lucide-react'
import DashboardLayout from './DashboardLayout.jsx'
import TrustScoreCard from '../components/TrustScoreCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { calculatePreviewScore } from '../data/demoTrustScoreEvents.js'
import '../styles/roleDashboard.css'

const freelancerCards = [
  { title: 'Profile builder', detail: 'Create a strong talent profile with skills, rate, bio, and portfolio links.', icon: UserCog, to: '/profile-builder', status: 'Profile' },
  { title: 'Available jobs', detail: 'Find jobs that match your category, skill level, and timeline.', icon: BriefcaseBusiness, to: '/jobs', status: 'Marketplace' },
  { title: 'Applications', detail: 'Track pending, shortlisted, accepted, and rejected job applications.', icon: ClipboardCheck, to: '/applications', status: 'Pipeline' },
  { title: 'Verification', detail: 'Submit GitHub, certificates, portfolio, and previous work proof.', icon: ShieldCheck, to: '/verification', status: 'Evidence' },
  { title: 'Trust score', detail: 'See how your verification and profile activity affects reputation.', icon: Star, to: '/trust-score', status: 'Reputation' },
  { title: 'Growth target', detail: 'Prepare for reviews, ratings, completed jobs, and portfolio upgrades.', icon: Trophy, to: '/talent', status: 'Future' },
]

function FreelancerDashboard() {
  const { user, role } = useAuth()

  return (
    <DashboardLayout title="Freelancer Dashboard" kicker="freelancer access" description="This dashboard is only for freelancers. Client posting controls and admin controls are not mixed into this workspace.">
      <TrustScoreCard score={calculatePreviewScore(user)} role={role} summary="Your freelancer score grows from verified evidence, complete profile details, applications, and successful platform activity." />

      <div className="dashboard-split-strip">
        <article>
          <span>Profile readiness</span>
          <strong>78%</strong>
          <p>Skills, portfolio, rate, category, and bio are ready for backend storage.</p>
        </article>
        <article>
          <span>Application pipeline</span>
          <strong>4 demo</strong>
          <p>Pending, shortlisted, accepted, and rejected states are prepared.</p>
        </article>
        <article>
          <span>Verification level</span>
          <strong>Growing</strong>
          <p>Evidence records will later connect to admin approvals.</p>
        </article>
      </div>

      <div className="role-dashboard-grid">
        {freelancerCards.map((card) => {
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

export default FreelancerDashboard
