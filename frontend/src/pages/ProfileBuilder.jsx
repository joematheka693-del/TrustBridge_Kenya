import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { BadgeCheck, Link as LinkIcon, Save, UserRoundPen } from 'lucide-react'
import { createTalentProfile } from '../services/talentApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/profileBuilder.css'

const initialProfile = {
  name: '',
  email: '',
  category: 'Frontend Developer',
  skillLevel: 'Beginner',
  location: '',
  rate: '',
  bio: '',
  skills: '',
  portfolioLink: '',
}

function ProfileBuilder() {
  const { user, role } = useAuth()
  const [formData, setFormData] = useState({
    ...initialProfile,
    name: user?.name || '',
    email: user?.email || '',
  })
  const [message, setMessage] = useState('This frontend form is ready. Backend saving will activate when the Flask talent routes are added.')

  if (role === 'client') {
    return <Navigate to="/unauthorized" replace />
  }

  const completionScore = useMemo(() => {
    const fields = Object.values(formData)
    const completed = fields.filter((value) => String(value).trim().length > 0).length
    return Math.round((completed / fields.length) * 100)
  }, [formData])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = {
      ...formData,
      skills: formData.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      portfolioLinks: formData.portfolioLink ? [{ label: 'Main portfolio', url: formData.portfolioLink }] : [],
    }

    try {
      await createTalentProfile(payload)
      setMessage('Profile submitted to the backend successfully.')
    } catch {
      setMessage('Backend not connected yet. Your profile form is working in frontend preview mode.')
    }
  }

  return (
    <section className="profile-builder-page">
      <div className="container">
        <div className="profile-builder-hero">
          <div>
            <span className="section-kicker">Profile builder</span>
            <h1>Create a TrustBridge talent profile.</h1>
            <p>
              Members and freelancers can build talent profiles here. Clients are blocked from this workspace, while admins can review it for testing.
            </p>
          </div>

          <div className="profile-completion-card">
            <UserRoundPen size={26} />
            <strong>{completionScore}%</strong>
            <span>profile completion</span>
          </div>
        </div>

        <div className="profile-builder-layout">
          <form className="profile-builder-form" onSubmit={handleSubmit}>
            <div className="form-section-title">
              <BadgeCheck size={19} />
              <h2>Professional details</h2>
            </div>

            <div className="profile-form-grid">
              <label>
                Full name
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" required />
              </label>

              <label>
                Email
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required />
              </label>

              <label>
                Category
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>Full Stack Developer</option>
                  <option>UI Designer</option>
                  <option>Content Writer</option>
                  <option>Virtual Assistant</option>
                </select>
              </label>

              <label>
                Skill level
                <select name="skillLevel" value={formData.skillLevel} onChange={handleChange}>
                  <option>Beginner</option>
                  <option>Beginner+</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </label>

              <label>
                Location
                <input name="location" value={formData.location} onChange={handleChange} placeholder="Machakos, Kenya" />
              </label>

              <label>
                Rate
                <input name="rate" value={formData.rate} onChange={handleChange} placeholder="KES 2,000 / project day" />
              </label>
            </div>

            <label className="full-width-label">
              Bio
              <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Explain what you do, who you help, and the type of work you can deliver." rows="5" />
            </label>

            <label className="full-width-label">
              Skills
              <input name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Flask, MySQL, Bootstrap" />
            </label>

            <label className="full-width-label">
              Portfolio link
              <input name="portfolioLink" value={formData.portfolioLink} onChange={handleChange} placeholder="https://your-portfolio-link.com" />
            </label>

            <button className="btn trust-primary-btn profile-save-btn" type="submit"><Save size={18} /> Save profile preview</button>
          </form>

          <aside className="profile-preview-card">
            <span className="section-kicker">Live preview</span>
            <h2>{formData.name || 'Your name'}</h2>
            <p>{formData.bio || 'Your profile bio will appear here as you type.'}</p>

            <div className="profile-preview-meta">
              <span>{formData.category}</span>
              <span>{formData.skillLevel}</span>
              <span>{formData.location || 'Location pending'}</span>
              <span>{formData.rate || 'Rate pending'}</span>
            </div>

            <div className="profile-preview-skills">
              {formData.skills.split(',').map((skill) => skill.trim()).filter(Boolean).slice(0, 6).map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>

            <div className="profile-preview-link"><LinkIcon size={16} /> {formData.portfolioLink || 'Portfolio link pending'}</div>
          </aside>
        </div>

        <div className="profile-builder-message">{message}</div>
      </div>
    </section>
  )
}

export default ProfileBuilder
