import { CheckCircle2, Database, TriangleAlert } from 'lucide-react'
import '../styles/systemAuditCard.css'

function SystemAuditCard({ table }) {
  const Icon = table.status === 'ready' ? CheckCircle2 : table.status === 'missing' ? TriangleAlert : Database

  return (
    <article className={`audit-table-card audit-${table.status}`}>
      <div className="audit-table-icon"><Icon size={20} /></div>
      <h3>{table.name}</h3>
      <p>Status: {table.status}</p>
      <strong>{table.rows} rows</strong>
    </article>
  )
}

export default SystemAuditCard
