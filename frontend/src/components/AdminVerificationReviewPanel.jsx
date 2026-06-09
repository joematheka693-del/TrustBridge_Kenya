import { CheckCircle2, FileWarning, ShieldAlert, XCircle } from 'lucide-react'
import '../styles/adminVerificationReviewPanel.css'

const reviewActions = [
  { status: 'approved', label: 'Approve', icon: CheckCircle2 },
  { status: 'more_evidence_needed', label: 'Need more evidence', icon: FileWarning },
  { status: 'rejected', label: 'Reject', icon: XCircle },
]

function AdminVerificationReviewPanel({ selectedRequest, reviewNote, onReviewNoteChange, onStatusChange }) {
  if (!selectedRequest) {
    return (
      <aside className="admin-verification-panel empty-review-panel">
        <ShieldAlert size={28} />
        <h2>Select a request</h2>
        <p>Choose a verification request from the queue to preview admin review controls.</p>
      </aside>
    )
  }

  return (
    <aside className="admin-verification-panel">
      <span className="panel-kicker">Admin review</span>
      <h2>{selectedRequest.fullName}</h2>
      <p>{selectedRequest.evidenceType}</p>

      <div className="admin-review-meta">
        <span>{selectedRequest.email}</span>
        <span>{selectedRequest.status.replaceAll('_', ' ')}</span>
      </div>

      <label className="admin-review-field">
        Review notes
        <textarea
          rows="5"
          value={reviewNote}
          onChange={(event) => onReviewNoteChange(event.target.value)}
          placeholder="Write admin notes before approving, rejecting, or requesting more evidence."
        />
      </label>

      <div className="admin-review-actions">
        {reviewActions.map((action) => {
          const Icon = action.icon

          return (
            <button type="button" key={action.status} onClick={() => onStatusChange(action.status)}>
              <Icon size={16} />
              {action.label}
            </button>
          )
        })}
      </div>
    </aside>
  )
}

export default AdminVerificationReviewPanel
