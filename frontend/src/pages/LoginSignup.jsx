import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/auth.css'

function LoginSignup({ mode = 'login' }) {
  const navigate = useNavigate()
  const { loginPreview } = useAuth()
  const isSignup = mode === 'signup'

  const handlePreviewLogin = (role) => {
    loginPreview(role)
    navigate('/dashboard')
  }

  return (
    <section className="auth-page">
      <div className="container auth-grid">
        <div className="auth-info-card">
          <span className="section-kicker">Account access</span>
          <h1>{isSignup ? 'Create your TrustBridge account' : 'Welcome back to TrustBridge'}</h1>
          <p>Authentication will connect to the Flask JWT backend in the auth phase. For now, preview roles let you test role-aware navigation and dashboard routing.</p>
        </div>

        <div className="auth-card">
          <h2>{isSignup ? 'Signup preview' : 'Login preview'}</h2>
          <div className="auth-preview-list">
            <button type="button" onClick={() => handlePreviewLogin('member')}>Continue as member</button>
            <button type="button" onClick={() => handlePreviewLogin('freelancer')}>Continue as freelancer</button>
            <button type="button" onClick={() => handlePreviewLogin('client')}>Continue as client</button>
            <button type="button" onClick={() => handlePreviewLogin('admin')}>Continue as admin</button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LoginSignup
