import { Link } from 'react-router-dom'
import { ArrowRight, BriefcaseBusiness, CalendarDays, Mail, Send, UserRoundCheck } from 'lucide-react'
import '../styles/applicationCard.css'

const typeLabels = {
  'job-application': 'Job application',
  'talent-invite': 'Talent invite',
}

function ApplicationCard({ application, role = 'member' }) {
  const isInvite = application.type === 'talent-invite'
  const Icon = isInvite ? UserRoundCheck : BriefcaseBusiness
  const viewerLabel = role === 'client' ? 'From' : role === 'freelancer' ? 'For' : 'Record'

  return (
    <article className={`application-card application-card-${application.status}`}>
      <div className="application-card-top">
        <span className="application-type-pill"><Icon size={15} /> {typeLabels[application.type]}</span>
        <span className="application-status-pill">{application.status}</span>
      </div>

      <h2>{application.sourceTitle}</h2>
      <p className="application-message">{application.message}</p>

      <div className="application-meta-grid">
        <span><Send size={16} /> {viewerLabel}: {application.applicantName}</span>
        <span><Mail size={16} /> {application.applicantEmail}</span>
        <span><CalendarDays size={16} /> {application.timeline}</span>
        <span><BriefcaseBusiness size={16} /> {application.budget}</span>
      </div>

      <Link className="application-card-link" to={`/applications/${application.id}`}>
        Review details <ArrowRight size={16} />
      </Link>
    </article>
  )
}

export default ApplicationCard
