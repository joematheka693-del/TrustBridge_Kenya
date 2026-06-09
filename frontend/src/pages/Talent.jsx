import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Users } from 'lucide-react'
import TalentCard from '../components/TalentCard.jsx'
import TalentFilterBar from '../components/TalentFilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { demoTalentProfiles } from '../data/demoTalent.js'
import { getTalentProfiles } from '../services/talentApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/talent.css'

function Talent() {
  const { isAuthenticated, role } = useAuth()
  const [profiles, setProfiles] = useState(demoTalentProfiles)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('All categories')
  const [level, setLevel] = useState('All levels')
  const [statusMessage, setStatusMessage] = useState('Showing safe preview talent until the backend is connected.')

  useEffect(() => {
    let isMounted = true

    async function loadTalentProfiles() {
      try {
        const data = await getTalentProfiles()
        const nextProfiles = Array.isArray(data) ? data : data?.profiles || data?.data?.profiles

        if (isMounted && Array.isArray(nextProfiles) && nextProfiles.length > 0) {
          setProfiles(nextProfiles)
          setStatusMessage('Talent profiles loaded from the backend API.')
        }
      } catch {
        if (isMounted) {
          setProfiles(demoTalentProfiles)
          setStatusMessage('Backend not connected yet. Showing frontend preview talent data.')
        }
      }
    }

    loadTalentProfiles()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredProfiles = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return profiles.filter((profile) => {
      const matchesSearch = !normalizedSearch || [
        profile.name,
        profile.category,
        profile.location,
        profile.skillLevel,
        profile.bio,
        ...(profile.skills || []),
      ].join(' ').toLowerCase().includes(normalizedSearch)

      const matchesCategory = category === 'All categories' || profile.category === category
      const matchesLevel = level === 'All levels' || profile.skillLevel === level

      return matchesSearch && matchesCategory && matchesLevel
    })
  }, [profiles, searchTerm, category, level])

  const canBuildProfile = isAuthenticated && ['member', 'freelancer', 'admin'].includes(role)
  const canInviteTalent = isAuthenticated && ['client', 'admin'].includes(role)

  return (
    <section className="talent-page">
      <div className="container">
        <div className="talent-hero-card">
          <div>
            <span className="section-kicker">Talent marketplace</span>
            <h1>Find Kenyan talent with profile proof and trust signals.</h1>
            <p>
              Clients can discover freelancers, freelancers can build profiles, and admins can review quality without mixing the different workspaces.
            </p>
            <div className="talent-hero-actions">
              {canBuildProfile && <Link className="btn trust-primary-btn" to="/profile-builder">Build my profile</Link>}
              {canInviteTalent && <Link className="btn talent-outline-btn" to="/applications">Manage invites</Link>}
              {!isAuthenticated && <Link className="btn trust-primary-btn" to="/auth">Login to interact</Link>}
            </div>
          </div>

          <div className="talent-hero-panel">
            <Users size={28} />
            <strong>{profiles.length}</strong>
            <span>talent profiles</span>
            <small><ShieldCheck size={14} /> Verification-ready marketplace</small>
          </div>
        </div>

        <div className="talent-status-line">{statusMessage}</div>

        <TalentFilterBar
          searchTerm={searchTerm}
          category={category}
          level={level}
          onSearchChange={setSearchTerm}
          onCategoryChange={setCategory}
          onLevelChange={setLevel}
        />

        {filteredProfiles.length > 0 ? (
          <div className="talent-grid">
            {filteredProfiles.map((profile) => (
              <TalentCard profile={profile} key={profile.id} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No talent matched your filters"
            description="Change the search term, category, or skill level to see more preview profiles."
          />
        )}
      </div>
    </section>
  )
}

export default Talent
