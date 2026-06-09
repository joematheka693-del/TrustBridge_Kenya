import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BriefcaseBusiness, CalendarDays, Mail, MessageSquareText, Send } from 'lucide-react'
import StatusActionPanel from '../components/StatusActionPanel.jsx'
import StateNotice from '../components/StateNotice.jsx'
import { demoApplications } from '../data/demoApplications.js'
import { useAuth } from '../context/AuthContext.jsx'
import { getApplicationById, updateApplicationStatus } from '../services/applicationsApi.js'
import '../styles/applicationDetails.css'

function ApplicationDetails() {
  const { applicationId } = useParams()
  const { role } = useAuth()
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [currentStatus, setCurrentStatus] = useState('pending')
  const [backendMessage, setBackendMessage] = useState('')
  const [isMissing, setIsMissing] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadApplication() {
      try {
        const response = await getApplicationById(applicationId)
        const backendApplication = response?.data?.application || response?.application
        if (backendApplication && isMounted) {
          setSelectedApplication(backendApplication)
          setCurrentStatus(backendApplication.status || 'pending')
          setBackendMessage('Connected to backend application details API.')
          setIsMissing(false)
        }
      } catch (error) {
        const previewApplication = demoApplications.find((item) => String(item.id) === String(applicationId))
        if (isMounted) {
          setSelectedApplication(previewApplication || null)
          setCurrentStatus(previewApplication?.status || 'pending')
          setBackendMessage(error?.normalizedMessage || 'Backend application details API unavailable. Preview record is shown if available.')
          setIsMissing(!previewApplication)
        }
      }
    }

    loadApplication()

    return () => {
      isMounted = false
    }
  }, [applicationId])

  const handleStatusChange = async (nextStatus) => {
    setCurrentStatus(nextStatus)
    try {
      const response = await updateApplicationStatus(applicationId, nextStatus)
      const updatedApplication = response?.data?.application || response?.application
      if (updatedApplication) {
        setSelectedApplication(updatedApplication)
        setCurrentStatus(updatedApplication.status)
        setBackendMessage('Application status updated in the backend.')
      }
    } catch (error) {
      setBackendMessage(error?.normalizedMessage || 'Preview status changed locally. Backend status update failed.')
    }
  }

  if (isMissing || !selectedApplication) {
    return (
      <main className="application-details-page page-shell">
        <section className="container application-missing-card">
          <h1>Application not found</h1>
          <p>The selected record is not available in backend or preview data.</p>
          <Link className="btn trust-primary-btn" to="/applications">Back to applications</Link>
        </section>
      </main>
    )
  }

  const canUpdate = ['client', 'admin'].includes(role)

  return (
    <main className="application-details-page page-shell">
      <section className="container application-details-shell">
        <Link className="application-back-link" to="/applications"><ArrowLeft size={17} /> Back to applications</Link>

        {backendMessage && <StateNotice type={backendMessage.includes('Connected') || backendMessage.includes('updated') ? 'success' : 'warning'} title="Application API status" description={backendMessage} />}

        <div className="application-details-grid">
          <article className="application-main-panel">
            <span className="section-kicker">{selectedApplication.type}</span>
            <h1>{selectedApplication.sourceTitle}</h1>
            <p>{selectedApplication.message}</p>

            <div className="application-detail-list">
              <span><Send size={17} /> Sender: {selectedApplication.applicantName}</span>
              <span><Mail size={17} /> {selectedApplication.applicantEmail}</span>
              <span><BriefcaseBusiness size={17} /> Budget: {selectedApplication.budget || 'Not specified'}</span>
              <span><CalendarDays size={17} /> Timeline: {selectedApplication.timeline || 'Not specified'}</span>
              <span><MessageSquareText size={17} /> Created: {selectedApplication.createdAt || 'Pending backend date'}</span>
            </div>

            <div className="application-review-note">
              <h2>Role separation</h2>
              <p>Freelancers and members submit job applications. Clients create talent invites and review hiring records. Admins oversee all application and invite records.</p>
            </div>
          </article>

          <StatusActionPanel currentStatus={currentStatus} canUpdate={canUpdate} onChange={handleStatusChange} />
        </div>
      </section>
    </main>
  )
}

export default ApplicationDetails
