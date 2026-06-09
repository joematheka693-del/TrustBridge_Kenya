import { CheckCircle2, Clock, ShieldCheck, XCircle } from 'lucide-react'
import { applicationStatuses } from '../data/demoApplications.js'
import '../styles/statusActionPanel.css'

const statusIcons = {
  pending: Clock,
  shortlisted: ShieldCheck,
  accepted: CheckCircle2,
  rejected: XCircle,
}

function StatusActionPanel({ currentStatus, canUpdate, onChange }) {
  return (
    <aside className="status-action-panel">
      <span className="section-kicker">Status control</span>
      <h2>{currentStatus}</h2>
      <p>{canUpdate ? 'Choose the next review status for this record.' : 'Only clients and admins can update application status in this phase.'}</p>

      <div className="status-action-list">
        {applicationStatuses.map((status) => {
          const Icon = statusIcons[status]
          const isActive = status === currentStatus

          return (
            <button type="button" disabled={!canUpdate} className={isActive ? 'active' : ''} key={status} onClick={() => onChange(status)}>
              <Icon size={16} /> {status}
            </button>
          )
        })}
      </div>
    </aside>
  )
}

export default StatusActionPanel
