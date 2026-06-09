import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
import JobCard from '../components/JobCard.jsx'
import JobFilterBar from '../components/JobFilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import StateNotice from '../components/StateNotice.jsx'
import { demoJobs } from '../data/demoJobs.js'
import { getJobs } from '../services/jobsApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/jobs.css'

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

function Jobs() {
  const { role } = useAuth()
  const [jobs, setJobs] = useState(demoJobs)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sourceMessage, setSourceMessage] = useState('Preview jobs are showing until the Flask backend is connected.')
  const [sourceType, setSourceType] = useState('empty')

  useEffect(() => {
    let isMounted = true

    async function loadJobs() {
      try {
        const data = await getJobs()
        const list = Array.isArray(data) ? data : data.jobs

        if (isMounted && Array.isArray(list) && list.length > 0) {
          setJobs(list.map(normalizeJob))
          setSourceMessage('Jobs loaded from the backend API.')
          setSourceType('success')
        }
      } catch {
        if (isMounted) {
          setSourceMessage('Backend is not connected yet, so preview jobs are being used.')
          setSourceType('empty')
        }
      }
    }

    loadJobs()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredJobs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return jobs.filter((job) => {
      const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory
      const searchable = [job.title, job.clientName, job.category, job.location, job.description, job.skills.join(' ')].join(' ').toLowerCase()
      const matchesSearch = !query || searchable.includes(query)

      return matchesCategory && matchesSearch
    })
  }, [jobs, searchTerm, selectedCategory])

  const canPostJob = role === 'client' || role === 'admin'

  return (
    <div className="jobs-page page-shell">
      <section className="jobs-hero container">
        <div>
          <p className="page-kicker">trusted jobs marketplace</p>
          <h1>Find safe work from reviewed clients.</h1>
          <p>
            Browse frontend, backend, full-stack, portfolio, and digital work opportunities prepared for Kenyan freelancers.
          </p>
        </div>

        {canPostJob && (
          <Link className="jobs-post-btn" to="/post-job">
            <PlusCircle size={18} /> Post a job
          </Link>
        )}
      </section>

      <div className="container">
        <JobFilterBar
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
        />

        <StateNotice type={sourceType} title="Jobs data source" description={sourceMessage} />

        {filteredJobs.length > 0 ? (
          <section className="jobs-grid">
            {filteredJobs.map((job) => (
              <JobCard job={job} key={job.id} />
            ))}
          </section>
        ) : (
          <EmptyState title="No jobs match your search" description="Try another keyword, category, skill, or location." />
        )}
      </div>
    </div>
  )
}

export default Jobs
