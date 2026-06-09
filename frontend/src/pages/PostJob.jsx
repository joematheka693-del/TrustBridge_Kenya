import { useState } from 'react'
import { BriefcaseBusiness, CheckCircle2, Send } from 'lucide-react'
import { createJob } from '../services/jobsApi.js'
import '../styles/postJob.css'

const initialForm = {
  title: '',
  category: 'Frontend Development',
  location: 'Remote, Kenya',
  budget: '',
  timeline: '',
  skills: '',
  description: '',
}

function PostJob() {
  const [formData, setFormData] = useState(initialForm)
  const [message, setMessage] = useState('This form is ready for /api/jobs. Until the backend is running, it saves as a frontend preview action.')

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = {
      ...formData,
      skills: formData.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
    }

    try {
      const data = await createJob(payload)
      const createdTitle = data.job?.title || payload.title
      setMessage(`Job submitted to the backend successfully: ${createdTitle}.`)
      setFormData(initialForm)
    } catch {
      setMessage('Backend is not connected yet. The form structure is complete and ready for Flask integration.')
    }
  }

  return (
    <main className="post-job-page page-shell">
      <section className="container post-job-header">
        <p className="page-kicker">client/admin job control</p>
        <h1>Post a trusted job opportunity.</h1>
        <p>Only clients and admins can access this page. Freelancers are blocked by the protected route.</p>
      </section>

      <section className="container post-job-grid">
        <form className="post-job-form" onSubmit={handleSubmit}>
          <div className="form-section-title"><BriefcaseBusiness size={18} /> Job details</div>

          <label>
            Job title
            <input value={formData.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Example: React dashboard for small business" required />
          </label>

          <div className="post-job-two-col">
            <label>
              Category
              <select value={formData.category} onChange={(event) => updateField('category', event.target.value)}>
                <option>Frontend Development</option>
                <option>Backend Development</option>
                <option>Full Stack Development</option>
                <option>Profile Improvement</option>
                <option>Design and Branding</option>
              </select>
            </label>

            <label>
              Location
              <input value={formData.location} onChange={(event) => updateField('location', event.target.value)} required />
            </label>
          </div>

          <div className="post-job-two-col">
            <label>
              Budget
              <input value={formData.budget} onChange={(event) => updateField('budget', event.target.value)} placeholder="KES 20,000" required />
            </label>

            <label>
              Timeline
              <input value={formData.timeline} onChange={(event) => updateField('timeline', event.target.value)} placeholder="7 days" required />
            </label>
          </div>

          <label>
            Skills
            <input value={formData.skills} onChange={(event) => updateField('skills', event.target.value)} placeholder="React, Bootstrap, Flask" required />
          </label>

          <label>
            Description
            <textarea value={formData.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Explain the project scope, expectations, deliverables, and safe payment agreement." required />
          </label>

          <button className="post-job-submit" type="submit"><Send size={17} /> Submit job</button>
        </form>

        <aside className="post-job-rules-card">
          <h2>Posting rules</h2>
          <p>TrustBridge jobs should be clear, fair, and safe for Kenyan freelancers.</p>
          <ul>
            <li><CheckCircle2 size={17} /> State the real budget before publishing.</li>
            <li><CheckCircle2 size={17} /> Explain all expected deliverables.</li>
            <li><CheckCircle2 size={17} /> Avoid suspicious off-platform payment requests.</li>
            <li><CheckCircle2 size={17} /> Admins can moderate unsafe job posts.</li>
          </ul>
          <div className="post-job-message">{message}</div>
        </aside>
      </section>
    </main>
  )
}

export default PostJob
