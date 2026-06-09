import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, BriefcaseBusiness, Send, UserRoundCheck } from 'lucide-react'
import { demoJobs } from '../data/demoJobs.js'
import { demoTalentProfiles } from '../data/demoTalent.js'
import { useAuth } from '../context/AuthContext.jsx'
import { createApplication } from '../services/applicationsApi.js'
import StateNotice from '../components/StateNotice.jsx'
import '../styles/applicationForm.css'

const emptyForm = {
  sourceTitle: '',
  applicantName: '',
  applicantEmail: '',
  message: '',
  budget: '',
  timeline: '',
}

function ApplicationForm() {
  const { applicationType } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { role, user } = useAuth()
  const [formData, setFormData] = useState({
    ...emptyForm,
    applicantName: user?.name || '',
    applicantEmail: user?.email || '',
  })
  const [notice, setNotice] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const normalizedType = applicationType === 'talent-invite' ? 'talent-invite' : 'job-application'
  const isInvite = normalizedType === 'talent-invite'
  const sourceId = searchParams.get('sourceId')

  const sourceTitle = useMemo(() => {
    if (isInvite) {
      return demoTalentProfiles.find((profile) => String(profile.id) === String(sourceId))?.name || ''
    }

    return demoJobs.find((job) => String(job.id) === String(sourceId))?.title || ''
  }, [isInvite, sourceId])

  const canUseForm = isInvite ? ['client', 'admin'].includes(role) : ['freelancer', 'member', 'admin'].includes(role)
  const Icon = isInvite ? UserRoundCheck : BriefcaseBusiness

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setNotice(null)

    try {
      await createApplication({
        type: normalizedType,
        sourceId,
        sourceTitle: formData.sourceTitle || sourceTitle,
        applicantName: formData.applicantName,
        applicantEmail: formData.applicantEmail,
        message: formData.message,
        budget: formData.budget,
        timeline: formData.timeline,
      })
      navigate('/applications')
    } catch (error) {
      setNotice(error?.normalizedMessage || 'Backend save failed. Check your API connection and login token.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!canUseForm) {
    return (
      <main className="application-form-page page-shell">
        <section className="container application-form-denied">
          <h1>Wrong workspace</h1>
          <p>{isInvite ? 'Only clients and admins can create talent invites.' : 'Only members, freelancers, and admins can create job applications.'}</p>
          <Link className="btn trust-primary-btn" to="/applications">Back to applications</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="application-form-page page-shell">
      <section className="container application-form-shell">
        <Link className="application-back-link" to="/applications"><ArrowLeft size={17} /> Back to applications</Link>

        <div className="application-form-heading">
          <span className="section-kicker"><Icon size={16} /> {isInvite ? 'Talent invite' : 'Job application'}</span>
          <h1>{isInvite ? 'Invite verified talent' : 'Apply for a job'}</h1>
          <p>{isInvite ? 'Send a structured invite from the client side without mixing freelancer controls.' : 'Submit a clear application from the freelancer/member side.'}</p>
        </div>

        {notice && <StateNotice type="warning" title="Application not saved" description={notice} />}

        <form className="application-form-card" onSubmit={handleSubmit}>
          <div className="form-grid-two">
            <label>
              Source title
              <input name="sourceTitle" value={formData.sourceTitle || sourceTitle} onChange={handleChange} placeholder={isInvite ? 'Talent profile or project title' : 'Job title'} required />
            </label>
            <label>
              Budget
              <input name="budget" value={formData.budget} onChange={handleChange} placeholder="KES 15,000" />
            </label>
            <label>
              Your name
              <input name="applicantName" value={formData.applicantName} onChange={handleChange} placeholder="Full name" required />
            </label>
            <label>
              Your email
              <input name="applicantEmail" value={formData.applicantEmail} onChange={handleChange} placeholder="email@example.com" required />
            </label>
            <label>
              Timeline
              <input name="timeline" value={formData.timeline} onChange={handleChange} placeholder="7 days" />
            </label>
          </div>

          <label>
            Message
            <textarea name="message" value={formData.message} onChange={handleChange} placeholder={isInvite ? 'Explain the work opportunity and expectations.' : 'Explain why you are a good fit for this job.'} rows="6" required />
          </label>

          <button className="btn trust-primary-btn" type="submit" disabled={isSaving}><Send size={17} /> {isSaving ? 'Saving...' : 'Save application record'}</button>
        </form>
      </section>
    </main>
  )
}

export default ApplicationForm
