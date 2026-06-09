import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Jobs from './pages/Jobs.jsx'
import JobDetails from './pages/JobDetails.jsx'
import PostJob from './pages/PostJob.jsx'
import ClientJobs from './pages/ClientJobs.jsx'
import Talent from './pages/Talent.jsx'
import TalentDetails from './pages/TalentDetails.jsx'
import ProfileBuilder from './pages/ProfileBuilder.jsx'
import AuthPage from './pages/AuthPage.jsx'
import DashboardRouter from './pages/DashboardRouter.jsx'
import MemberDashboard from './pages/MemberDashboard.jsx'
import FreelancerDashboard from './pages/FreelancerDashboard.jsx'
import ClientDashboard from './pages/ClientDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import PagePlaceholder from './pages/PagePlaceholder.jsx'
import Applications from './pages/Applications.jsx'
import ApplicationDetails from './pages/ApplicationDetails.jsx'
import ApplicationForm from './pages/ApplicationForm.jsx'
import VerificationCenter from './pages/VerificationCenter.jsx'
import VerificationForm from './pages/VerificationForm.jsx'
import AdminVerificationQueue from './pages/AdminVerificationQueue.jsx'
import TrustScore from './pages/TrustScore.jsx'
import AdminTrustControls from './pages/AdminTrustControls.jsx'
import AdminUsers from './pages/AdminUsers.jsx'
import AdminJobModeration from './pages/AdminJobModeration.jsx'
import AdminApplications from './pages/AdminApplications.jsx'
import AdminActivity from './pages/AdminActivity.jsx'
import SystemAudit from './pages/SystemAudit.jsx'
import Unauthorized from './pages/Unauthorized.jsx'
import NotFound from './pages/NotFound.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import './styles/app.css'

const freelancerOnlyCards = [
  { title: 'Create profile', description: 'The next phase will connect the profile builder form to talent services.', status: 'Frontend shell' },
  { title: 'Skills and portfolio', description: 'Skills, GitHub, certificates, and portfolio links will be added here.', status: 'Prepared' },
  { title: 'Trust readiness', description: 'Profile completion will later feed the trust score system.', status: 'Next phase' },
]

const clientOnlyCards = [
  { title: 'Job form', description: 'Clients will create jobs with category, budget, timeline, and required skills.', status: 'Frontend shell' },
  { title: 'Owner controls', description: 'Only clients and admins will access job posting controls.', status: 'Protected' },
  { title: 'Applications', description: 'Posted jobs will later receive freelancer applications.', status: 'Next phase' },
]

const adminCards = [
  { title: 'Admin control', description: 'This admin-only page is ready for backend moderation APIs.', status: 'Admin only' },
  { title: 'Data review', description: 'The admin will review users, jobs, verification, and applications.', status: 'Prepared' },
  { title: 'Safety', description: 'Admin-only authorization is enforced before rendering this page.', status: 'Protected' },
]

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:jobId" element={<JobDetails />} />
          <Route path="/talent" element={<Talent />} />
          <Route path="/talent/:profileId" element={<TalentDetails />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/signup" element={<Navigate to="/auth" replace />} />
          <Route path="/dashboard" element={<DashboardRouter />} />

          <Route path="/member/dashboard" element={<ProtectedRoute allowedRoles={['member']}><MemberDashboard /></ProtectedRoute>} />
          <Route path="/freelancer/dashboard" element={<ProtectedRoute allowedRoles={['freelancer']}><FreelancerDashboard /></ProtectedRoute>} />
          <Route path="/client/dashboard" element={<ProtectedRoute allowedRoles={['client']}><ClientDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

          <Route path="/profile-builder" element={<ProtectedRoute allowedRoles={['freelancer', 'member', 'admin']}><ProfileBuilder /></ProtectedRoute>} />
          <Route path="/post-job" element={<ProtectedRoute allowedRoles={['client', 'admin']}><PostJob /></ProtectedRoute>} />
          <Route path="/client/jobs" element={<ProtectedRoute allowedRoles={['client']}><ClientJobs /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute allowedRoles={['member', 'freelancer', 'client', 'admin']}><Applications /></ProtectedRoute>} />
          <Route path="/applications/:applicationId" element={<ProtectedRoute allowedRoles={['member', 'freelancer', 'client', 'admin']}><ApplicationDetails /></ProtectedRoute>} />
          <Route path="/applications/new/:applicationType" element={<ProtectedRoute allowedRoles={['member', 'freelancer', 'client', 'admin']}><ApplicationForm /></ProtectedRoute>} />
          <Route path="/verification" element={<ProtectedRoute allowedRoles={['member', 'freelancer', 'client', 'admin']}><VerificationCenter /></ProtectedRoute>} />
          <Route path="/verification/new" element={<ProtectedRoute allowedRoles={['member', 'freelancer', 'client', 'admin']}><VerificationForm /></ProtectedRoute>} />
          <Route path="/trust-score" element={<ProtectedRoute allowedRoles={['member', 'freelancer', 'client', 'admin']}><TrustScore /></ProtectedRoute>} />

          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={['admin']}><AdminJobModeration /></ProtectedRoute>} />
          <Route path="/admin/applications" element={<ProtectedRoute allowedRoles={['admin']}><AdminApplications /></ProtectedRoute>} />
          <Route path="/admin/activity" element={<ProtectedRoute allowedRoles={['admin']}><AdminActivity /></ProtectedRoute>} />
          <Route path="/admin/verification" element={<ProtectedRoute allowedRoles={['admin']}><AdminVerificationQueue /></ProtectedRoute>} />
          <Route path="/admin/trust-controls" element={<ProtectedRoute allowedRoles={['admin']}><AdminTrustControls /></ProtectedRoute>} />
          <Route path="/admin/system-audit" element={<ProtectedRoute allowedRoles={['admin']}><SystemAudit /></ProtectedRoute>} />
          <Route path="/admin/audit" element={<Navigate to="/admin/system-audit" replace />} />

          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
