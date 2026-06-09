import { useEffect, useMemo, useState } from 'react'
import { BriefcaseBusiness, CheckCircle2, Clock3, ShieldAlert } from 'lucide-react'
import DashboardLayout from './DashboardLayout.jsx'
import AdminMetricGrid from '../components/AdminMetricGrid.jsx'
import ModerationPanel from '../components/ModerationPanel.jsx'
import StateNotice from '../components/StateNotice.jsx'
import { demoJobs } from '../data/demoJobs.js'
import { getJobs } from '../services/jobsApi.js'
import { updateAdminJobStatus } from '../services/adminApi.js'
import '../styles/adminJobModeration.css'

function AdminJobModeration() {
  const [jobs, setJobs] = useState(demoJobs.map((job, index) => ({ ...job, status: index === 0 ? 'open' : index === 1 ? 'under_review' : 'paused' })))
  const [backendMessage, setBackendMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadJobs() {
      try {
        const response = await getJobs({ status: 'all' })
        const backendJobs = response?.jobs || []
        if (isMounted) {
          setJobs(backendJobs.length > 0 ? backendJobs : demoJobs)
          setBackendMessage(backendJobs.length > 0 ? 'Admin job moderation API connected.' : 'Backend returned no jobs, so preview jobs are shown.')
        }
      } catch (error) {
        if (isMounted) {
          setJobs(demoJobs)
          setBackendMessage(error?.message || 'Jobs API unavailable. Preview jobs are shown.')
        }
      }
    }

    loadJobs()

    return () => {
      isMounted = false
    }
  }, [])

  const metrics = useMemo(() => [
    { title: 'Total job records', label: 'jobs', value: jobs.length, icon: BriefcaseBusiness },
    { title: 'Open jobs', label: 'open', value: jobs.filter((job) => job.status === 'open').length, icon: CheckCircle2 },
    { title: 'Waiting for review', label: 'review', value: jobs.filter((job) => job.status === 'under_review').length, icon: Clock3 },
    { title: 'Closed jobs', label: 'safety', value: jobs.filter((job) => job.status === 'closed').length, icon: ShieldAlert },
  ], [jobs])

  const handleStatusChange = async (jobId, status) => {
    const normalizedStatus = status === 'approved' ? 'open' : status === 'review' ? 'under_review' : status === 'rejected' ? 'closed' : status
    setJobs((current) => current.map((job) => (job.id || job.job_id) === jobId ? { ...job, status: normalizedStatus } : job))
    try {
      await updateAdminJobStatus(jobId, normalizedStatus)
      setBackendMessage('Job status updated in backend.')
    } catch (error) {
      setBackendMessage(error?.message || 'Job status changed locally, but backend update failed.')
    }
  }

  return (
    <DashboardLayout title="Admin Job Moderation" kicker="admin only" description="Review job posts, approve safe opportunities, flag risky posts, and keep client posting controls separate from freelancer access.">
      {backendMessage && <StateNotice type={backendMessage.includes('updated') || backendMessage.includes('connected') ? 'success' : 'warning'} title="Admin jobs API status" description={backendMessage} />}
      <AdminMetricGrid metrics={metrics} />
      <ModerationPanel title="Job moderation queue" subtitle="Only admins can approve, review, or reject jobs at platform level." items={jobs} onStatusChange={handleStatusChange} />
    </DashboardLayout>
  )
}

export default AdminJobModeration
