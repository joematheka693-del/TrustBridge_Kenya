import '../styles/adminMetricGrid.css'

function AdminMetricGrid({ metrics }) {
  return (
    <div className="admin-metric-grid">
      {metrics.map((metric) => {
        const Icon = metric.icon

        return (
          <article className="admin-metric-card" key={metric.title}>
            <div className="admin-metric-icon"><Icon size={22} /></div>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.title}</p>
          </article>
        )
      })}
    </div>
  )
}

export default AdminMetricGrid
