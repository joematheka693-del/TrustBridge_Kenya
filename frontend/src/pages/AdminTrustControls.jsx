import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from './DashboardLayout.jsx'
import TrustEventCard from '../components/TrustEventCard.jsx'
import StateNotice from '../components/StateNotice.jsx'
import { createTrustScoreEvent, getTrustScoreEvents } from '../services/trustScoreApi.js'
import { pickList, pickMessage } from '../services/responseNormalizer.js'
import { demoTrustScoreEvents } from '../data/demoTrustScoreEvents.js'
import '../styles/adminTrustControls.css'

const initialForm = {
  userId: '',
  userName: '',
  userRole: 'freelancer',
  eventType: 'manual_admin_event',
  points: 5,
  reason: '',
}

function AdminTrustControls() {
  const [form, setForm] = useState(initialForm)
  const [manualEvents, setManualEvents] = useState([])
  const [backendEvents, setBackendEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState({ tone: '', title: '', message: '' })

  const previewEvents = useMemo(() => {
    const source = backendEvents.length ? backendEvents : demoTrustScoreEvents
    return [...manualEvents, ...source]
  }, [manualEvents, backendEvents])

  useEffect(() => {
    let ignore = false

    async function loadEvents() {
      try {
        const result = await getTrustScoreEvents()
        if (!ignore) setBackendEvents(pickList(result, ['events']))
      } catch {
        if (!ignore) setBackendEvents([])
      }
    }

    loadEvents()
    return () => {
      ignore = true
    }
  }, [])

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setNotice({ tone: '', title: '', message: '' })

    try {
      const payload = {
        userId: Number(form.userId),
        eventType: form.eventType,
        points: Number(form.points),
        reason: form.reason.trim(),
      }
      const result = await createTrustScoreEvent(payload)
      const savedEvent = result?.event
      setManualEvents((current) => savedEvent ? [savedEvent, ...current] : current)
      setForm(initialForm)
      setNotice({ tone: 'success', title: 'Trust event saved', message: 'The backend stored the manual trust score event successfully.' })
    } catch (requestError) {
      const nextEvent = {
        id: `manual-${Date.now()}`,
        userId: Number(form.userId) || Date.now(),
        userName: form.userName.trim() || 'Preview User',
        userRole: form.userRole,
        eventType: form.eventType,
        points: Number(form.points),
        reason: form.reason.trim() || 'Manual admin trust score preview event.',
        createdAt: new Date().toISOString().slice(0, 10),
      }

      setManualEvents((current) => [nextEvent, ...current])
      setNotice({ tone: 'warning', title: 'Preview event created', message: pickMessage(requestError, 'Backend trust score API is not available. Preview event was added locally.') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Trust Score Controls" kicker="admin only" description="Admins can create manual trust score events and review the latest reputation activity stored in the backend.">
      <section className="admin-trust-controls-page">

        {notice.message && <StateNotice tone={notice.tone} title={notice.title} message={notice.message} />}

        <div className="admin-trust-grid">
          <form className="admin-trust-form" onSubmit={handleSubmit}>
            <h2>Add manual trust event</h2>

            <label>
              User ID
              <input type="number" min="1" value={form.userId} onChange={(event) => updateForm('userId', event.target.value)} placeholder="Example: 2" required />
            </label>

            <label>
              Preview user name
              <input value={form.userName} onChange={(event) => updateForm('userName', event.target.value)} placeholder="Example: Jane Freelancer" />
            </label>

            <label>
              Preview user role
              <select value={form.userRole} onChange={(event) => updateForm('userRole', event.target.value)}>
                <option value="member">Member</option>
                <option value="freelancer">Freelancer</option>
                <option value="client">Client</option>
              </select>
            </label>

            <label>
              Event type
              <select value={form.eventType} onChange={(event) => updateForm('eventType', event.target.value)}>
                <option value="manual_admin_event">Manual admin event</option>
                <option value="approved_verification">Approved verification</option>
                <option value="rejected_verification">Rejected verification</option>
                <option value="more_evidence_needed">More evidence needed</option>
                <option value="dispute_warning">Dispute warning</option>
              </select>
            </label>

            <label>
              Points
              <input type="number" min="-30" max="30" value={form.points} onChange={(event) => updateForm('points', event.target.value)} />
            </label>

            <label>
              Reason
              <textarea value={form.reason} onChange={(event) => updateForm('reason', event.target.value)} placeholder="Explain why this trust event is being added." required />
            </label>

            <button className="btn btn-trust" type="submit" disabled={loading}>{loading ? 'Saving event...' : 'Add trust event'}</button>
          </form>

          <section className="admin-trust-preview">
            <div className="section-heading-row">
              <div>
                <p className="page-kicker">event log</p>
                <h2>Latest trust activity</h2>
              </div>
              <span>{previewEvents.length} events</span>
            </div>

            <div className="admin-trust-event-list">
              {previewEvents.slice(0, 5).map((event) => <TrustEventCard event={event} key={event.id || event.eventId} />)}
            </div>
          </section>
        </div>
      </section>
    </DashboardLayout>
  )
}

export default AdminTrustControls
