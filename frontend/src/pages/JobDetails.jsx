import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BriefcaseBusiness, CalendarDays, CheckCircle2, FileText, MapPin, Send, ShieldCheck } from 'lucide-react'
import StateNotice from '../components/StateNotice.jsx'
import { demoJobs } from '../data/demoJobs.js'
import { useAuth } from '../context/AuthContext.jsx'
import { getJobById } from '../services/jobsApi.js'
import '../styles/jobDetails.css'

function normalizeJob(job) {
  return {
    id: job.id || job.job_id,
    title: job.title,
    clientName: job.clientName || job.client_name || 'TrustBridge Client',
    category: job.category || 'General',
    location: job.location || 'Remote',
    budget: job.budget || 'Budget not set',
    timeline: job.timeline || 'Timeline not set',
    status: job.status || 'open',
    experience: job.experience || 'Open level',
    trustLevel: job.trustLevel || job.trust_level || 'Trust review pending',
    postedAt: job.postedAt || job.created_at || 'Recently posted',
    description: job.description || 'No description provided yet.',
    skills: Array.isArray(job.skills) ? job.skills : String(job.skills || '').split(',').filter(Boolean),
  }
}

function JobDetails() {
  const { jobId } = useParams()
  const { isAuthenticated, role } = useAuth()
  const fallbackJob = useMemo(() => demoJobs.find((item) => String(item.id) === String(jobId)), [jobId])
  const [job, setJob] = useState(fallbackJob || null)
  const [sourceMessage, setSourceMessage] = useState(fallbackJob ? 'Preview job is showing until the backend is connected.' : '')
  const [sourceType, setSourceType] = useState(fallbackJob ? 'empty' : 'error')

  useEffect(() => {
    let isMounted = true

    async function loadJob() {
      try {
        const data = await getJobById(jobId)
        const backendJob = data.job || data

        if (isMounted && backendJob) {
          setJob(normalizeJob(backendJob))
          setSourceMessage('Job loaded from the backend API.')
          setSourceType('success')
        }
      } catch {
        if (isMounted && fallbackJob) {
          setJob(fallbackJob)
          setSourceMessage('Backend is not connected yet, so the preview job is being used.')
          setSourceType('empty')
        }
      }
    }

    loadJob()

    return () => {
      isMounted = false
    }
  }, [jobId, fallbackJob])

  if (!job) {
    return (
      <main className="job-details-page page-shell">
        <section className="container job-details-missing">
          <h1>Job not found</h1>
          <p>The selected job is not available in the backend or preview list.</p>
          <Link className="job-back-link" to="/jobs"><ArrowLeft size={17} /> Back to jobs</Link>
        </section>
      </main>
    )
  }

  const canApply = isAuthenticated && ['member', 'freelancer'].includes(role)
  const canManage = isAuthenticated && ['client', 'admin'].includes(role)

  return (
    <main className="job-details-page page-shell">
      <section className="container job-details-shell">
        <Link className="job-back-link" to="/jobs"><ArrowLeft size={17} /> Back to jobs</Link>
        <StateNotice type={sourceType} title="Job data source" description={sourceMessage} />

        <div className="job-details-grid">
          <article className="job-main-panel">
            <div className="job-details-kicker"><BriefcaseBusiness size={16} /> {job.category}</div>
            <h1>{job.title}</h1>
            <p className="job-details-client">Posted by {job.clientName}</p>
            <p className="job-details-description">{job.description}</p>

            <div className="job-details-meta-grid">
              <span><MapPin size={17} /> {job.location}</span>
              <span><CalendarDays size={17} /> {job.timeline}</span>
              <span><ShieldCheck size={17} /> {job.trustLevel}</span>
              <span><FileText size={17} /> {job.experience}</span>
            </div>

            <div className="job-details-section">
              <h2>Required skills</h2>
              <div className="job-details-skills">
                {job.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>

            <div className="job-details-section">
              <h2>Safe working rules</h2>
              <ul className="job-safe-list">
                <li><CheckCircle2 size={17} /> Keep project communication inside TrustBridge when messaging is added.</li>
                <li><CheckCircle2 size={17} /> Confirm scope, timeline, and budget before starting work.</li>
                <li><CheckCircle2 size={17} /> Submit verification evidence to improve your trust score.</li>
              </ul>
            </div>
          </article>

          <aside className="job-side-panel">
            <p className="job-budget-label">Budget</p>
            <h2>{job.budget}</h2>
            <p>Status: <strong>{job.status}</strong></p>

            {canApply && (
              <Link className="job-action-primary" to={`/applications/new/job-application?sourceId=${job.id}`}>
                <Send size={17} /> Apply for this job
              </Link>
            )}

            {!isAuthenticated && (
              <Link className="job-action-primary" to="/auth">
                <Send size={17} /> Login to apply
              </Link>
            )}

            {canManage && (
              <Link className="job-action-secondary" to={role === 'admin' ? '/admin/jobs' : '/client/jobs'}>
                Manage job controls
              </Link>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}

export default JobDetails
