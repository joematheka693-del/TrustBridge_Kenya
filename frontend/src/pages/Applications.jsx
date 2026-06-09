import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck, Plus, ShieldCheck } from 'lucide-react'
import ApplicationCard from '../components/ApplicationCard.jsx'
import ApplicationFilterBar from '../components/ApplicationFilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import StateNotice from '../components/StateNotice.jsx'
import { demoApplications } from '../data/demoApplications.js'
import { useAuth } from '../context/AuthContext.jsx'
import { getApplications } from '../services/applicationsApi.js'
import { pickList, pickMessage } from '../services/responseNormalizer.js'
import '../styles/applications.css'

function Applications() {
  const { role, user } = useAuth()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const [applications, setApplications] = useState(demoApplications)
  const [backendMessage, setBackendMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadApplications() {
      setIsLoading(true)
      try {
        const response = await getApplications({ type, status, q: search })
        const backendApplications = pickList(response, ['applications', 'records', 'items'])
        if (isMounted) {
          setApplications(backendApplications.length > 0 ? backendApplications : demoApplications)
          setBackendMessage(backendApplications.length > 0 ? 'Connected to backend applications API.' : 'Backend returned no records, so preview records are shown.')
        }
      } catch (error) {
        if (isMounted) {
          setApplications(demoApplications)
          setBackendMessage(pickMessage(error, 'Backend applications API unavailable. Preview records are shown.'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadApplications()

    return () => {
      isMounted = false
    }
  }, [search, status, type])

  const visibleApplications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return applications.filter((item) => {
      const matchesRole = role === 'admin'
        || (role === 'client' && (item.applicantEmail === user?.email || item.ownerEmail === user?.email))
        || (['freelancer', 'member'].includes(role) && (item.ownerEmail === user?.email || item.applicantEmail === user?.email))
        || item.applicantEmail === user?.email
        || item.ownerEmail === user?.email
      const matchesType = type === 'all' || item.type === type
      const matchesStatus = status === 'all' || item.status === status
      const matchesSearch = !normalizedSearch
        || String(item.sourceTitle || '').toLowerCase().includes(normalizedSearch)
        || String(item.applicantName || '').toLowerCase().includes(normalizedSearch)
        || String(item.message || '').toLowerCase().includes(normalizedSearch)

      return matchesRole && matchesType && matchesStatus && matchesSearch
    })
  }, [applications, role, search, status, type, user?.email])

  const isClient = role === 'client'
  const isAdmin = role === 'admin'

  return (
    <main className="applications-page page-shell">
      <section className="container applications-hero">
        <div>
          <span className="section-kicker"><ClipboardCheck size={16} /> Applications and invites</span>
          <h1>{isAdmin ? 'Admin application review center' : isClient ? 'Client hiring workspace' : 'Your application workspace'}</h1>
          <p>
            {isAdmin
              ? 'Review all job applications and talent invitations using the connected backend application records.'
              : isClient
                ? 'Track talent invites and applications coming from freelancers.'
                : 'Track job applications and client invitations without mixing client controls into your workspace.'}
          </p>
        </div>

        <div className="applications-actions">
          {['freelancer', 'member'].includes(role) && <Link className="btn trust-primary-btn" to="/applications/new/job-application"><Plus size={17} /> Apply for job</Link>}
          {isClient && <Link className="btn trust-primary-btn" to="/applications/new/talent-invite"><Plus size={17} /> Invite talent</Link>}
          {isAdmin && <Link className="btn trust-primary-btn" to="/admin/dashboard"><ShieldCheck size={17} /> Admin dashboard</Link>}
        </div>
      </section>

      <section className="container applications-content">
        {backendMessage && <StateNotice type={backendMessage.includes('Connected') ? 'success' : 'warning'} title={backendMessage.includes('Connected') ? 'Backend connected' : 'Preview fallback'} description={backendMessage} />}

        <ApplicationFilterBar
          search={search}
          type={type}
          status={status}
          onSearchChange={setSearch}
          onTypeChange={setType}
          onStatusChange={setStatus}
        />

        {isLoading ? (
          <StateNotice type="info" title="Loading applications" description="Checking the backend application and invite records." />
        ) : visibleApplications.length > 0 ? (
          <div className="applications-grid">
            {visibleApplications.map((application) => <ApplicationCard application={application} role={role} key={application.id} />)}
          </div>
        ) : (
          <EmptyState title="No application records found" description="Try another filter or create a new application/invite for your role." />
        )}
      </section>
    </main>
  )
}

export default Applications
