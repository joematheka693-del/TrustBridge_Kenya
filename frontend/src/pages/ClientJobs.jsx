import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit3, Eye, PlusCircle, ShieldCheck, Trash2 } from 'lucide-react'
import StateNotice from '../components/StateNotice.jsx'
import { demoJobs } from '../data/demoJobs.js'
import { deleteJob, getJobs } from '../services/jobsApi.js'
import '../styles/clientJobs.css'

function normalizeJob(job) {
  return {
    id: job.id || job.job_id,
    title: job.title,
    category: job.category || 'General',
    budget: job.budget || 'Budget not set',
    timeline: job.timeline || 'Timeline not set',
    status: job.status || 'open',
  }
}

function ClientJobs() {
  const [jobs, setJobs] = useState(demoJobs.slice(0, 3))
  const [message, setMessage] = useState('Preview client jobs are showing until the backend is connected.')
  const [noticeType, setNoticeType] = useState('empty')

  useEffect(() => {
    let isMounted = true

    async function loadJobs() {
      try {
        const data = await getJobs({ status: 'all' })
        const list = data.jobs || []

        if (isMounted && list.length > 0) {
          setJobs(list.map(normalizeJob))
          setMessage('Client jobs loaded from the backend API.')
          setNoticeType('success')
        }
      } catch {
        if (isMounted) {
          setMessage('Backend is not connected yet, so preview client jobs are being used.')
          setNoticeType('empty')
        }
      }
    }

    loadJobs()

    return () => {
      isMounted = false
    }
  }, [])

  const handleDelete = async (jobId) => {
    try {
      await deleteJob(jobId)
      setJobs((current) => current.filter((job) => String(job.id) !== String(jobId)))
      setMessage('Job deleted from the backend successfully.')
      setNoticeType('success')
    } catch {
      setMessage('Delete needs the backend running and a client/admin account that owns the job.')
      setNoticeType('error')
    }
  }

  return (
    <main className="client-jobs-page page-shell">
      <section className="container client-jobs-header">
        <div>
          <p className="page-kicker">client workspace</p>
          <h1>Your posted jobs</h1>
          <p>Clients can review their own jobs. Admins use a separate moderation page.</p>
        </div>
        <Link className="client-jobs-create" to="/post-job"><PlusCircle size={18} /> Create new job</Link>
      </section>

      <section className="container">
        <StateNotice type={noticeType} title="Client jobs source" description={message} />
      </section>

      <section className="container client-jobs-list">
        {jobs.map((job) => (
          <article className="client-job-row" key={job.id}>
            <div>
              <span className="client-job-status"><ShieldCheck size={15} /> {job.status}</span>
              <h2>{job.title}</h2>
              <p>{job.category} · {job.budget} · {job.timeline}</p>
            </div>

            <div className="client-job-actions">
              <Link to={`/jobs/${job.id}`}><Eye size={16} /> View</Link>
              <Link to="/post-job"><Edit3 size={16} /> Edit</Link>
              <button type="button" onClick={() => handleDelete(job.id)}><Trash2 size={16} /> Delete</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

export default ClientJobs
