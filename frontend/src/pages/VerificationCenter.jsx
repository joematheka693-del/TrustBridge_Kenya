import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileCheck2, Plus, ShieldCheck } from 'lucide-react'
import EmptyState from '../components/EmptyState.jsx'
import VerificationCard from '../components/VerificationCard.jsx'
import VerificationFilterBar from '../components/VerificationFilterBar.jsx'
import { demoVerificationRequests } from '../data/demoVerificationRequests.js'
import { getVerificationRequests } from '../services/verificationApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/verificationCenter.css'

function VerificationCenter() {
  const { user, role } = useAuth()
  const [requests, setRequests] = useState(demoVerificationRequests)
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('all')
  const [backendMessage, setBackendMessage] = useState('Using preview verification data until the Flask backend is connected.')

  useEffect(() => {
    let isMounted = true

    getVerificationRequests()
      .then((data) => {
        if (!isMounted) return
        const nextRequests = Array.isArray(data) ? data : data?.requests
        if (Array.isArray(nextRequests)) {
          setRequests(nextRequests)
          setBackendMessage('Verification requests loaded from the backend API.')
        }
      })
      .catch(() => {
        if (isMounted) {
          setBackendMessage('Backend verification API is unavailable. Preview requests are showing.')
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const visibleRequests = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return requests.filter((request) => {
      const ownRequest = request.email === user?.email || role === 'admin'
      const statusMatch = status === 'all' || request.status === status
      const searchMatch = [request.fullName, request.email, request.role, request.evidenceType, request.notes]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)

      return ownRequest && statusMatch && searchMatch
    })
  }, [requests, role, searchTerm, status, user?.email])

  return (
    <div className="verification-center-page">
      <section className="verification-hero">
        <div>
          <span className="page-kicker">Trust evidence</span>
          <h1>Verification Center</h1>
          <p>
            Submit portfolio links, GitHub work, certificates, business profiles, and previous work proof so TrustBridge can review your credibility.
          </p>
        </div>
        <div className="verification-hero-actions">
          <Link to="/verification/new" className="btn btn-primary">
            <Plus size={18} />
            Submit evidence
          </Link>
          {role === 'admin' && (
            <Link to="/admin/verification" className="btn btn-outline-light">
              <ShieldCheck size={18} />
              Admin queue
            </Link>
          )}
        </div>
      </section>

      <section className="verification-summary-grid">
        <article>
          <FileCheck2 size={24} />
          <span>Total visible requests</span>
          <strong>{visibleRequests.length}</strong>
        </article>
        <article>
          <ShieldCheck size={24} />
          <span>Approved evidence</span>
          <strong>{visibleRequests.filter((item) => item.status === 'approved').length}</strong>
        </article>
        <article>
          <Plus size={24} />
          <span>Pending review</span>
          <strong>{visibleRequests.filter((item) => item.status === 'pending').length}</strong>
        </article>
      </section>

      <div className="backend-preview-note">{backendMessage}</div>

      <VerificationFilterBar
        searchTerm={searchTerm}
        status={status}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatus}
      />

      {visibleRequests.length > 0 ? (
        <section className="verification-grid">
          {visibleRequests.map((request) => (
            <VerificationCard request={request} key={request.id} showAdminLink={role === 'admin'} />
          ))}
        </section>
      ) : (
        <EmptyState title="No verification requests found" description="Submit evidence or adjust the filters to review matching verification records." />
      )}
    </div>
  )
}

export default VerificationCenter
