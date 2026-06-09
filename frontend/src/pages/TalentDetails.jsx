import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, ExternalLink, Mail, MapPin, Star } from 'lucide-react'
import { demoTalentProfiles } from '../data/demoTalent.js'
import { getTalentProfile } from '../services/talentApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/talentDetails.css'

function TalentDetails() {
  const { profileId } = useParams()
  const { isAuthenticated, role } = useAuth()
  const [profile, setProfile] = useState(() => demoTalentProfiles.find((item) => String(item.id) === String(profileId)))
  const [statusMessage, setStatusMessage] = useState('Opening talent profile preview while backend data loads.')

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      try {
        const data = await getTalentProfile(profileId)
        const nextProfile = data?.profile || data?.data?.profile

        if (isMounted && nextProfile) {
          setProfile(nextProfile)
          setStatusMessage('Talent profile loaded from the backend API.')
        }
      } catch {
        if (isMounted) {
          const fallbackProfile = demoTalentProfiles.find((item) => String(item.id) === String(profileId))
          setProfile(fallbackProfile)
          setStatusMessage('Backend not connected yet. Showing matching frontend preview profile where available.')
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [profileId])

  if (!profile) {
    return (
      <section className="talent-details-page">
        <div className="container">
          <div className="talent-missing-card">
            <h1>Talent profile not found</h1>
            <p>The profile may have been removed or the backend may not be connected yet.</p>
            <Link className="btn trust-primary-btn" to="/talent">Back to talent</Link>
          </div>
        </div>
      </section>
    )
  }

  const canInviteTalent = isAuthenticated && ['client', 'admin'].includes(role)
  const profileKey = profile.id || profile.profile_id

  return (
    <section className="talent-details-page">
      <div className="container">
        <Link className="talent-back-link" to="/talent"><ArrowLeft size={17} /> Back to talent</Link>
        <div className="talent-details-status">{statusMessage}</div>

        <div className="talent-details-hero">
          <div>
            <span className="section-kicker">Talent profile</span>
            <h1>{profile.name}</h1>
            <p>{profile.bio}</p>

            <div className="talent-detail-actions">
              {canInviteTalent ? (
                <Link className="btn trust-primary-btn" to={`/applications/new/talent-invite?sourceId=${profileKey}`}>Invite talent</Link>
              ) : (
                <Link className="btn trust-primary-btn" to="/auth">Login as client to invite</Link>
              )}
              {['freelancer', 'member', 'admin'].includes(role) && (
                <Link className="btn talent-detail-outline" to="/profile-builder">Open profile builder</Link>
              )}
            </div>
          </div>

          <aside className="talent-trust-panel">
            <Star size={24} />
            <strong>{profile.trustScore || profile.trust_score}</strong>
            <span>Trust score</span>
            <small>{profile.verification} verification</small>
          </aside>
        </div>

        <div className="talent-details-grid">
          <article className="talent-detail-card">
            <h2>Professional info</h2>
            <div className="talent-info-list">
              <span><BadgeCheck size={17} /> {profile.category}</span>
              <span><BriefcaseBusiness size={17} /> {profile.skillLevel || profile.skill_level}</span>
              <span><MapPin size={17} /> {profile.location}</span>
              <span><Mail size={17} /> {profile.email}</span>
            </div>
          </article>

          <article className="talent-detail-card">
            <h2>Work summary</h2>
            <div className="talent-summary-row">
              <div><small>Completed jobs</small><strong>{profile.completedJobs || profile.completed_jobs || 0}</strong></div>
              <div><small>Rate</small><strong>{profile.rate}</strong></div>
              <div><small>Availability</small><strong>{profile.availability}</strong></div>
            </div>
          </article>

          <article className="talent-detail-card talent-wide-card">
            <h2>Skills</h2>
            <div className="talent-detail-skills">
              {(profile.skills || []).map((skill) => <span key={skill}>{skill}</span>)}
            </div>
          </article>

          <article className="talent-detail-card talent-wide-card">
            <h2>Portfolio links</h2>
            <div className="talent-links-list">
              {(profile.portfolioLinks || profile.portfolio_links || []).map((link) => (
                <a href={link.url} target="_blank" rel="noreferrer" key={`${link.label}-${link.url}`}>
                  {link.label} <ExternalLink size={15} />
                </a>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

export default TalentDetails
