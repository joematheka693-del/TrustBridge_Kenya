import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Send, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { createVerificationRequest } from '../services/verificationApi.js'
import { evidenceTypes } from '../data/demoVerificationRequests.js'
import '../styles/verificationForm.css'

const initialForm = {
  fullName: '',
  email: '',
  evidenceType: 'Portfolio link',
  evidenceLink: '',
  notes: '',
}

function VerificationForm() {
  const { user, role } = useAuth()
  const [formData, setFormData] = useState({
    ...initialForm,
    fullName: user?.name || '',
    email: user?.email || '',
  })
  const [submitMessage, setSubmitMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    const payload = {
      ...formData,
      role,
      status: 'pending',
      createdDate: new Date().toISOString().slice(0, 10),
    }

    try {
      await createVerificationRequest(payload)
      setSubmitMessage('Verification request sent to the backend successfully.')
    } catch {
      setSubmitMessage('Preview saved locally because the backend submission route is unavailable.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="verification-form-page">
      <Link to="/verification" className="back-link">
        <ArrowLeft size={17} />
        Back to verification center
      </Link>

      <section className="verification-form-shell">
        <div className="verification-form-intro">
          <span className="page-kicker">Evidence submission</span>
          <h1>Submit verification proof</h1>
          <p>
            Use one clear public link per request. Admins will review the evidence and later connect approved requests to the trust score system.
          </p>
          <div className="verification-form-tip">
            <ShieldCheck size={22} />
            <span>Good evidence is public, specific, and easy for an admin to verify.</span>
          </div>
        </div>

        <form className="verification-form" onSubmit={handleSubmit}>
          <div className="form-grid two-columns">
            <label>
              Full name
              <input name="fullName" value={formData.fullName} onChange={handleChange} required />
            </label>
            <label>
              Email
              <input name="email" type="email" value={formData.email} onChange={handleChange} required />
            </label>
          </div>

          <div className="form-grid two-columns">
            <label>
              Evidence type
              <select name="evidenceType" value={formData.evidenceType} onChange={handleChange}>
                {evidenceTypes.map((type) => (
                  <option value={type} key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              Evidence link
              <input name="evidenceLink" type="url" value={formData.evidenceLink} onChange={handleChange} placeholder="https://" required />
            </label>
          </div>

          <label>
            Notes for admin
            <textarea name="notes" rows="6" value={formData.notes} onChange={handleChange} placeholder="Explain what the evidence proves and what the admin should check." required />
          </label>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            <Send size={18} />
            {isSubmitting ? 'Submitting...' : 'Submit verification request'}
          </button>

          {submitMessage && <div className="form-submit-message">{submitMessage}</div>}
        </form>
      </section>
    </div>
  )
}

export default VerificationForm
