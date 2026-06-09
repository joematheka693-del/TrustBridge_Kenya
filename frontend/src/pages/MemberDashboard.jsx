import { Link } from 'react-router-dom'
import { BriefcaseBusiness, ClipboardCheck, ShieldCheck, Star, UserCog } from 'lucide-react'
import DashboardLayout from './DashboardLayout.jsx'
import TrustScoreCard from '../components/TrustScoreCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { calculatePreviewScore } from '../data/demoTrustScoreEvents.js'
import '../styles/roleDashboard.css'

const memberCards = [
  { title: 'Starter profile', detail: 'Create a simple beginner profile before becoming a full freelancer.', icon: UserCog, to: '/profile-builder', status: 'Beginner ready' },
  { title: 'Explore jobs', detail: 'Browse trusted jobs and learn what clients are asking for.', icon: BriefcaseBusiness, to: '/jobs', status: 'Public market' },
  { title: 'First application', detail: 'Prepare your first job application with a clear message and timeline.', icon: ClipboardCheck, to: '/applications', status: 'Practice flow' },
  { title: 'Verification', detail: 'Submit starter evidence like portfolio links, certificates, or previous work.', icon: ShieldCheck, to: '/verification', status: 'Trust builder' },
]

function MemberDashboard() {
  const { user, role } = useAuth()

  return (
    <DashboardLayout title="Member Dashboard" kicker="member access" description="This starter dashboard is only for general members. It avoids client job-owner tools and admin controls.">
      <TrustScoreCard score={calculatePreviewScore(user)} role={role} summary="Your member score grows when you create a beginner profile, submit evidence, and apply responsibly." />

      <div className="role-dashboard-grid">
        {memberCards.map((card) => {
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

export default MemberDashboard
