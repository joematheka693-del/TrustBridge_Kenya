import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from './DashboardLayout.jsx'
import TrustScoreCard from '../components/TrustScoreCard.jsx'
import TrustEventCard from '../components/TrustEventCard.jsx'
import StateNotice from '../components/StateNotice.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getMyTrustScore, getTrustScoreEvents } from '../services/trustScoreApi.js'
import { pickList, pickMessage } from '../services/responseNormalizer.js'
import { calculatePreviewScore, demoTrustScoreEvents, scoreRules } from '../data/demoTrustScoreEvents.js'
import '../styles/trustScore.css'

function TrustScore() {
  const { user, role } = useAuth()
  const [filter, setFilter] = useState(role === 'admin' ? 'all' : role)
  const [scoreData, setScoreData] = useState(null)
  const [events, setEvents] = useState(demoTrustScoreEvents)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const previewScore = useMemo(() => calculatePreviewScore(user), [user])
  const activeScore = scoreData?.score ?? (role === 'admin' ? 92 : previewScore)
  const activeRules = scoreData?.rules?.length ? scoreData.rules.map((rule) => ({
    label: rule.label,
    points: rule.points,
    tone: Number(rule.points) < 0 ? 'negative' : rule.eventType === 'manual_admin_event' ? 'admin' : 'positive',
  })) : scoreRules

  useEffect(() => {
    let ignore = false

    async function loadTrustScore() {
      setLoading(true)
      setError('')
      try {
        const [scoreResult, eventsResult] = await Promise.all([
          getMyTrustScore(),
          getTrustScoreEvents(),
        ])

        if (!ignore) {
          setScoreData(scoreResult)
          const backendEvents = pickList(eventsResult, ['events'])
          setEvents(backendEvents.length ? backendEvents : demoTrustScoreEvents)
        }
      } catch (requestError) {
        if (!ignore) {
          setError(pickMessage(requestError, 'Backend trust score API is not available yet. Showing preview score data.'))
          setEvents(demoTrustScoreEvents)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadTrustScore()
    return () => {
      ignore = true
    }
  }, [])

  const visibleEvents = events.filter((event) => {
    if (filter === 'all') return true
    return event.userRole === filter || event.userId === user?.id
  })

  return (
    <DashboardLayout title="Trust Score System" kicker="reputation engine" description="This page explains how TrustBridge builds reputation from verification, profile completion, jobs, applications, and admin trust events.">
      <section className="trust-score-page">

        {error && <StateNotice tone="warning" title="Preview fallback active" message={error} />}
        {loading && <StateNotice tone="info" title="Loading trust score" message="Checking the backend trust score engine and score event history." />}

        <TrustScoreCard
          score={activeScore}
          role={role}
          summary={scoreData ? `Base ${scoreData.baseScore} plus event total ${scoreData.eventTotal}.` : role === 'admin' ? 'Admins can inspect platform trust activity and create manual trust score events.' : 'Improve this score by completing your profile, submitting evidence, and using the platform safely.'}
        />

        <div className="trust-score-actions">
          <Link className="btn btn-trust" to="/verification">Go to verification</Link>
          {['freelancer', 'member', 'admin'].includes(role) && <Link className="btn btn-trust-outline" to="/profile-builder">Improve profile</Link>}
          {role === 'admin' && <Link className="btn btn-trust-outline" to="/admin/trust-controls">Admin trust controls</Link>}
        </div>

        <section className="trust-rules-panel">
          <div className="section-heading-row">
            <div>
              <p className="page-kicker">score formula</p>
              <h2>Backend scoring rules</h2>
            </div>
            <span className="trust-score-cap">0 minimum · 100 maximum</span>
          </div>

          <div className="trust-rules-grid">
            {activeRules.map((rule) => (
              <article className={`trust-rule-card ${rule.tone}`} key={rule.label}>
                <span>{rule.points}</span>
                <h3>{rule.label}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="trust-events-panel">
          <div className="section-heading-row">
            <div>
              <p className="page-kicker">score history</p>
              <h2>Trust score events</h2>
            </div>

            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="all">All roles</option>
              <option value="member">Members</option>
              <option value="freelancer">Freelancers</option>
              <option value="client">Clients</option>
            </select>
          </div>

          <div className="trust-events-grid">
            {visibleEvents.map((event) => <TrustEventCard event={event} key={event.id || event.eventId} />)}
          </div>
        </section>
      </section>
    </DashboardLayout>
  )
}

export default TrustScore
