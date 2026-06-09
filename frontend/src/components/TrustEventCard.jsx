import { CalendarDays, CircleDollarSign, UserRoundCheck } from 'lucide-react'
import '../styles/trustEventCard.css'

function TrustEventCard({ event }) {
  const isPositive = Number(event.points) >= 0
  const eventType = event.eventType || event.event_type || 'manual_admin_event'
  const userName = event.userName || event.user_name || 'TrustBridge User'
  const userRole = event.userRole || event.user_role || 'member'
  const createdAt = event.createdAt || event.created_at || 'Today'

  return (
    <article className="trust-event-card">
      <div className="trust-event-topline">
        <span className={`trust-event-points ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}{event.points}
        </span>
        <span>{eventType.replaceAll('_', ' ')}</span>
      </div>

      <h3>{userName}</h3>
      <p>{event.reason}</p>

      <div className="trust-event-footer">
        <span><UserRoundCheck size={15} /> {userRole}</span>
        <span><CalendarDays size={15} /> {createdAt}</span>
        <span><CircleDollarSign size={15} /> score event</span>
      </div>
    </article>
  )
}

export default TrustEventCard
