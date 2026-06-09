import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ClipboardCheck, Send, XCircle } from 'lucide-react'
import DashboardLayout from './DashboardLayout.jsx'
import AdminMetricGrid from '../components/AdminMetricGrid.jsx'
import ModerationPanel from '../components/ModerationPanel.jsx'
import StateNotice from '../components/StateNotice.jsx'
import { demoApplications } from '../data/demoApplications.js'
import { getApplications, updateApplicationStatus } from '../services/applicationsApi.js'
import '../styles/adminApplications.css'

function AdminApplications() {
  const [applications, setApplications] = useState(demoApplications)
  const [backendMessage, setBackendMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadApplications() {
      try {
        const response = await getApplications({ type: 'all', status: 'all' })
        const backendApplications = response?.data?.applications || response?.applications || []
        if (isMounted) {
          setApplications(backendApplications.length > 0 ? backendApplications : demoApplications)
          setBackendMessage(backendApplications.length > 0 ? 'Admin application oversight is connected to backend records.' : 'Backend returned no records, so preview records are shown.')
        }
      } catch (error) {
        if (isMounted) {
          setApplications(demoApplications)
          setBackendMessage(error?.normalizedMessage || 'Backend applications API unavailable. Preview records are shown.')
        }
      }
    }

    loadApplications()

    return () => {
      isMounted = false
    }
  }, [])

  const metrics = useMemo(() => [
    { title: 'Total applications and invites', label: 'records', value: applications.length, icon: ClipboardCheck },
    { title: 'Pending review', label: 'pending', value: applications.filter((item) => item.status === 'pending').length, icon: Send },
    { title: 'Accepted records', label: 'accepted', value: applications.filter((item) => item.status === 'accepted').length, icon: CheckCircle2 },
    { title: 'Rejected records', label: 'rejected', value: applications.filter((item) => item.status === 'rejected').length, icon: XCircle },
  ], [applications])

  const handleStatusChange = async (applicationId, status) => {
    const normalizedStatus = status === 'approved' ? 'accepted' : status
    setApplications((current) => current.map((item) => item.id === applicationId ? { ...item, status: normalizedStatus } : item))
    try {
      await updateApplicationStatus(applicationId, normalizedStatus)
      setBackendMessage('Application status updated in backend.')
    } catch (error) {
      setBackendMessage(error?.normalizedMessage || 'Preview status changed locally. Backend update failed.')
    }
  }

  return (
    <DashboardLayout title="Admin Application Oversight" kicker="admin only" description="Monitor job applications and client talent invites without mixing admin controls into client or freelancer dashboards.">
      {backendMessage && <StateNotice type={backendMessage.includes('updated') || backendMessage.includes('connected') ? 'success' : 'warning'} title="Applications API status" description={backendMessage} />}
      <AdminMetricGrid metrics={metrics} />
      <ModerationPanel title="Applications and invites oversight" subtitle="Admins can review suspicious applications, hiring invites, and status changes." items={applications} onStatusChange={handleStatusChange} />
    </DashboardLayout>
  )
}

export default AdminApplications
