import { Link } from 'react-router-dom'
import { CheckCircle2, Clock3, ExternalLink, FileWarning, ShieldCheck, XCircle } from 'lucide-react'
import '../styles/verificationCard.css'

const statusMap = {
  pending: { label: 'Pending review', icon: Clock3 },
  approved: { label: 'Approved', icon: CheckCircle2 },
  rejected: { label: 'Rejected', icon: XCircle },
  more_evidence_needed: { label: 'More evidence needed', icon: FileWarning },
}

function VerificationCard({ request, showAdminLink = false }) {
  const statusData = statusMap[request.status] || statusMap.pending
  const StatusIcon = statusData.icon

  return (
    <article className={`verification-card verification-card-${request.status}`}>
      <div className="verification-card-top">
        <div>
          <span className="verification-card-kicker">{request.evidenceType}</span>
          <h3>{request.fullName}</h3>
          <p>{request.email}</p>
        </div>
        <span className="verification-role-pill">{request.role}</span>
      </div>

      <div className="verification-status-row">
        <span className="verification-status-pill">
          <StatusIcon size={16} />
          {statusData.label}
        </span>
        <span>{request.createdDate}</span>
      </div>

      <p className="verification-notes">{request.notes}</p>

      <div className="verification-card-actions">
        <a href={request.evidenceLink} target="_blank" rel="noreferrer" className="verification-evidence-link">
          <ExternalLink size={16} />
          Open evidence
        </a>
        {showAdminLink && (
          <Link to="/admin/verification" className="verification-review-link">
            <ShieldCheck size={16} />
            Review queue
          </Link>
        )}
      </div>
    </article>
  )
}

export default VerificationCard
