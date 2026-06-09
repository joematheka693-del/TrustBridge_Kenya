import { AlertTriangle, CheckCircle2, Info, LoaderCircle, SearchX } from 'lucide-react'
import '../styles/stateNotice.css'

const icons = {
  loading: LoaderCircle,
  error: AlertTriangle,
  empty: SearchX,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
}

function StateNotice({ type = 'empty', tone, title, description, message, action }) {
  const activeType = tone || type
  const Icon = icons[activeType] || SearchX

  return (
    <section className={`state-notice state-notice-${activeType}`}>
      <div className="state-notice-icon">
        <Icon size={22} />
      </div>
      <div>
        <h2>{title}</h2>
        <p>{description || message}</p>
        {action && <div className="state-notice-action">{action}</div>}
      </div>
    </section>
  )
}

export default StateNotice
