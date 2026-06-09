import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BriefcaseBusiness, PlusCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useJobs } from '../context/JobContext.jsx'
import { createJob } from '../services/jobsApi.js'
import '../styles/postJobForm.css'

const initialForm = {
  title: '',
  category: 'Web Development',
  budget: '',
  timeline: '',
  level: 'Beginner',
  location: 'Remote, Kenya',
  description: '',
  skills: '',
  responsibilities: '',
}

function PostJobForm() {
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const { addPreviewJob } = useJobs()
  const [form, setForm] = useState(initialForm)
  const [statusMessage, setStatusMessage] = useState('')

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = {
      ...form,
      clientName: role === 'admin' ? 'TrustBridge Admin' : user?.name || 'TrustBridge Client',
      postedBy: user?.email || 'preview@trustbridge.co.ke',
      ownerRole: role,
      status: role === 'admin' ? 'review' : 'open',
      skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      responsibilities: form.responsibilities.split(',').map((item) => item.trim()).filter(Boolean),
    }

    const response = await createJob(payload)
    const nextJob = addPreviewJob(response.data)
    setStatusMessage(`Job saved in ${response.source} mode. You can now preview it.`)
    setForm(initialForm)
    navigate(`/jobs/${nextJob.id}`)
  }

  return (
    <section className="post-job-shell">
      <div className="post-job-hero">
        <span><BriefcaseBusiness size={18} /> Client/Admin workspace</span>
        <h1>Post a trusted job opportunity</h1>
        <p>Only clients and admins can access this page. Freelancers remain separated from job posting controls.</p>
      </div>

      <form className="post-job-form" onSubmit={handleSubmit}>
        <div className="form-grid two-columns">
          <label>
            Job title
            <input name="title" value={form.title} onChange={updateForm} required placeholder="Example: React dashboard UI" />
          </label>

          <label>
            Category
            <select name="category" value={form.category} onChange={updateForm}>
              <option>Web Development</option>
              <option>Profile Design</option>
              <option>Dashboard UI</option>
              <option>Backend Support</option>
            </select>
          </label>

          <label>
            Budget
            <input name="budget" value={form.budget} onChange={updateForm} required placeholder="KES 10,000 - 20,000" />
          </label>

          <label>
            Timeline
            <input name="timeline" value={form.timeline} onChange={updateForm} required placeholder="7 days" />
          </label>

          <label>
            Level
            <select name="level" value={form.level} onChange={updateForm}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>

          <label>
            Location
            <input name="location" value={form.location} onChange={updateForm} required />
          </label>
        </div>

        <label>
          Job description
          <textarea name="description" value={form.description} onChange={updateForm} required rows="5" placeholder="Explain what needs to be done and what success looks like." />
        </label>

        <label>
          Required skills
          <input name="skills" value={form.skills} onChange={updateForm} required placeholder="React, Bootstrap, Flask" />
        </label>

        <label>
          Responsibilities
          <input name="responsibilities" value={form.responsibilities} onChange={updateForm} placeholder="Build UI, connect API, test dashboard" />
        </label>

        {statusMessage && <div className="trust-alert success">{statusMessage}</div>}

        <button className="btn trust-primary-btn post-job-submit" type="submit">
          <PlusCircle size={18} /> Save job
        </button>
      </form>
    </section>
  )
}

export default PostJobForm
