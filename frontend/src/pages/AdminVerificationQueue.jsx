import { useEffect, useMemo, useState } from 'react'
import AdminVerificationReviewPanel from '../components/AdminVerificationReviewPanel.jsx'
import EmptyState from '../components/EmptyState.jsx'
import VerificationCard from '../components/VerificationCard.jsx'
import VerificationFilterBar from '../components/VerificationFilterBar.jsx'
import { demoVerificationRequests } from '../data/demoVerificationRequests.js'
import { getVerificationRequests, updateVerificationRequestStatus } from '../services/verificationApi.js'
import '../styles/adminVerificationQueue.css'

function AdminVerificationQueue() {
  const [requests, setRequests] = useState(demoVerificationRequests)
  const [selectedId, setSelectedId] = useState(demoVerificationRequests[0]?.id || '')
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('all')
  const [reviewNote, setReviewNote] = useState('')
  const [backendMessage, setBackendMessage] = useState('Using preview verification queue until backend review routes are connected.')

  useEffect(() => {
    let isMounted = true

    getVerificationRequests()
      .then((data) => {
        if (!isMounted) return
        const nextRequests = Array.isArray(data) ? data : data?.requests
        if (Array.isArray(nextRequests)) {
          setRequests(nextRequests)
          setSelectedId(nextRequests[0]?.id || '')
          setBackendMessage('Admin verification queue loaded from the backend API.')
        }
      })
      .catch(() => {
        if (isMounted) {
          setBackendMessage('Backend verification API is unavailable. Preview queue is showing.')
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredRequests = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return requests.filter((request) => {
      const statusMatch = status === 'all' || request.status === status
      const searchMatch = [request.fullName, request.email, request.role, request.evidenceType, request.notes, request.reviewNotes]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)

      return statusMatch && searchMatch
    })
  }, [requests, searchTerm, status])

  const selectedRequest = requests.find((request) => request.id === selectedId) || filteredRequests[0]

  const handleStatusChange = async (nextStatus) => {
    if (!selectedRequest) return

    const updatedRequest = {
      ...selectedRequest,
      status: nextStatus,
      reviewNotes: reviewNote || selectedRequest.reviewNotes,
      reviewedDate: new Date().toISOString().slice(0, 10),
    }

    setRequests((current) => current.map((request) => (request.id === selectedRequest.id ? updatedRequest : request)))

    try {
      await updateVerificationRequestStatus(selectedRequest.id, {
        status: nextStatus,
        reviewNotes: updatedRequest.reviewNotes,
      })
      setBackendMessage('Verification status updated through the backend API.')
    } catch {
      setBackendMessage('Preview status updated locally because the backend PATCH route is unavailable.')
    }
  }

  return (
    <div className="admin-verification-queue-page">
      <section className="admin-verification-hero">
        <div>
          <span className="page-kicker">Admin only</span>
          <h1>Verification Queue</h1>
          <p>Review submitted evidence, approve credible users, reject weak evidence, or request more proof.</p>
        </div>
        <div className="admin-verification-stats">
          <span>{requests.filter((item) => item.status === 'pending').length}</span>
          <small>pending</small>
        </div>
      </section>

      <div className="backend-preview-note">{backendMessage}</div>

      <VerificationFilterBar
        searchTerm={searchTerm}
        status={status}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatus}
      />

      <section className="admin-verification-layout">
        <div className="admin-verification-list">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <button type="button" className="admin-verification-select" onClick={() => setSelectedId(request.id)} key={request.id}>
                <VerificationCard request={request} />
              </button>
            ))
          ) : (
            <EmptyState title="No verification requests found" description="Adjust filters to find matching verification requests." />
          )}
        </div>

        <AdminVerificationReviewPanel
          selectedRequest={selectedRequest}
          reviewNote={reviewNote}
          onReviewNoteChange={setReviewNote}
          onStatusChange={handleStatusChange}
        />
      </section>
    </div>
  )
}

export default AdminVerificationQueue
