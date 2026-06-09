import { SearchX } from 'lucide-react'
import '../styles/emptyState.css'

function EmptyState({ title, description }) {
  return (
    <section className="empty-state-card">
      <SearchX size={34} />
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  )
}

export default EmptyState
