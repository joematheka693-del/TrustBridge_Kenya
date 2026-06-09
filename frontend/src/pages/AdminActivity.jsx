import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, ClipboardList, ShieldCheck } from 'lucide-react'
import DashboardLayout from './DashboardLayout.jsx'
import AdminMetricGrid from '../components/AdminMetricGrid.jsx'
import StateNotice from '../components/StateNotice.jsx'
import { demoAdminActivity } from '../data/demoAdminActivity.js'
import { getAdminActivity } from '../services/adminApi.js'
import '../styles/adminActivity.css'

function AdminActivity() {
  const [activity, setActivity] = useState(demoAdminActivity)
  const [backendMessage, setBackendMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadActivity() {
      try {
        const response = await getAdminActivity()
        const backendActivity = response?.activity || []
        if (isMounted) {
          setActivity(backendActivity.length > 0 ? backendActivity : demoAdminActivity)
          setBackendMessage(backendActivity.length > 0 ? 'Admin activity API connected.' : 'Backend returned no activity, so preview activity is shown.')
        }
      } catch (error) {
        if (isMounted) {
          setActivity(demoAdminActivity)
          setBackendMessage(error?.message || 'Admin activity API unavailable. Preview activity is shown.')
        }
      }
    }

    loadActivity()

    return () => {
      isMounted = false
    }
  }, [])

  const metrics = useMemo(() => [
    { title: 'Activity records', label: 'events', value: activity.length, icon: Activity },
    { title: 'High priority events', label: 'high', value: activity.filter((item) => item.severity === 'high').length, icon: AlertTriangle },
    { title: 'Verification/job events', label: 'review', value: activity.filter((item) => ['verification', 'job'].includes(item.type)).length, icon: ShieldCheck },
    { title: 'Audit-ready actions', label: 'logs', value: activity.length, icon: ClipboardList },
  ], [activity])

  return (
    <DashboardLayout title="Admin Platform Activity" kicker="admin only" description="A separated admin activity feed for reviewing jobs, verification, trust events, security notes, and platform actions.">
      {backendMessage && <StateNotice type={backendMessage.includes('connected') ? 'success' : 'warning'} title="Admin activity API status" description={backendMessage} />}
      <AdminMetricGrid metrics={metrics} />

      <section className="admin-activity-page-list">
        {activity.map((item) => (
          <article className={`activity-row activity-${item.severity}`} key={item.id}>
            <div>
              <span>{item.type}</span>
              <h3>{item.target}</h3>
              <p>{item.detail}</p>
            </div>
            <aside>
              <strong>{item.actor}</strong>
              <small>{item.time}</small>
            </aside>
          </article>
        ))}
      </section>
    </DashboardLayout>
  )
}

export default AdminActivity
