import { useEffect, useMemo, useState } from 'react'
import { DatabaseZap, ShieldCheck, Table2, Users } from 'lucide-react'
import DashboardLayout from './DashboardLayout.jsx'
import AdminMetricGrid from '../components/AdminMetricGrid.jsx'
import SystemAuditCard from '../components/SystemAuditCard.jsx'
import StateNotice from '../components/StateNotice.jsx'
import { demoSystemAudit } from '../data/demoSystemAudit.js'
import { getSystemAudit } from '../services/systemAuditApi.js'
import '../styles/systemAudit.css'

function SystemAudit() {
  const [audit, setAudit] = useState(demoSystemAudit)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadAudit() {
      try {
        const data = await getSystemAudit()
        if (isMounted) {
          setAudit(data)
          setError('')
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || 'System audit backend is not reachable. Showing preview audit data.')
          setAudit(demoSystemAudit)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadAudit()

    return () => {
      isMounted = false
    }
  }, [])

  const metrics = useMemo(() => [
    { title: 'Health score', label: 'health', value: `${audit.database.healthScore}%`, icon: ShieldCheck },
    { title: 'Required tables', label: 'tables', value: audit.requiredTables.length, icon: Table2 },
    { title: 'Users counted', label: 'users', value: audit.counts.users, icon: Users },
    { title: 'Database mode', label: audit.database.mode, value: audit.database.connected ? 'Online' : 'Preview', icon: DatabaseZap },
  ], [audit])

  return (
    <DashboardLayout title="System Audit" kicker="admin only" description="Run the deployment-readiness checklist for database connection, required tables, row counts, admin count, and recommendations.">
      {loading && <StateNotice type="loading" title="Running audit" description="Checking backend database readiness..." />}
      {error && <StateNotice type="warning" title="Backend audit fallback" description={error} />}

      <AdminMetricGrid metrics={metrics} />

      <section className="audit-summary-card">
        <div>
          <p className="page-kicker">database</p>
          <h2>{audit.database.name || audit.database.expected_name || 'TrustBridge database'}</h2>
          <p>Current status: {audit.database.connected ? 'Connected to backend database' : 'Preview data shown until backend is reachable'}</p>
          {audit.deploymentReady !== undefined && <small>Deployment ready: {audit.deploymentReady ? 'Yes' : 'Not yet'}</small>}
        </div>
        <strong>{audit.database.healthScore}%</strong>
      </section>

      <section className="audit-table-grid">
        {audit.requiredTables.map((table) => <SystemAuditCard table={table} key={table.name} />)}
      </section>

      <section className="audit-recommendations">
        <div>
          <p className="page-kicker">recommendations</p>
          <h2>Before deployment</h2>
        </div>
        {audit.recommendations.map((item) => <article key={item}>{item}</article>)}
      </section>
    </DashboardLayout>
  )
}

export default SystemAudit
