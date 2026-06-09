import { CheckCircle2, PauseCircle, Trash2 } from 'lucide-react'
import '../styles/moderationPanel.css'

function ModerationPanel({ title, subtitle, items, onStatusChange, statusKey = 'status' }) {
  return (
    <section className="moderation-panel">
      <div className="moderation-header">
        <div>
          <p className="page-kicker">moderation</p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <span>{items.length} records</span>
      </div>

      <div className="moderation-list">
        {items.map((item) => (
          <article className="moderation-item" key={item.id || item.jobId || item.applicationId}>
            <div>
              <span className={`status-pill status-${item[statusKey]}`}>{item[statusKey]}</span>
              <h3>{item.title || item.sourceTitle || item.name}</h3>
              <p>{item.description || item.message || item.detail}</p>
              <small>{item.category || item.type || item.budget}</small>
            </div>
            <div className="moderation-actions">
              <button type="button" onClick={() => onStatusChange(item.id || item.jobId || item.applicationId, 'approved')}><CheckCircle2 size={16} /> Approve</button>
              <button type="button" onClick={() => onStatusChange(item.id || item.jobId || item.applicationId, 'review')}><PauseCircle size={16} /> Review</button>
              <button type="button" className="danger-action" onClick={() => onStatusChange(item.id || item.jobId || item.applicationId, 'rejected')}><Trash2 size={16} /> Reject</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ModerationPanel
