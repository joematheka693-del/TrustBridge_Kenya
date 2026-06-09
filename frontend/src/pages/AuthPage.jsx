import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole, ShieldCheck, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/auth.css'

function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, loginPreview, loginWithForm, signupWithForm, authLoading, authError, clearAuthError } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' })

  const destination = location.state?.from || '/dashboard'

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      if (mode === 'login') {
        await loginWithForm(form)
      } else {
        await signupWithForm(form)
      }

      navigate(destination, { replace: true })
    } catch {
      return null
    }
  }

  const handlePreviewLogin = (role) => {
    loginPreview(role)
    navigate('/dashboard', { replace: true })
  }

  return (
    <section className="auth-page">
      <div className="container auth-grid">
        <article className="auth-info-card">
          <span className="section-kicker">One auth page</span>
          <h1>Login or create a TrustBridge account.</h1>
          <p>The navbar only shows Login for guests. This page lets users switch between login and signup without opening a separate signup page.</p>

          <div className="auth-points">
            <span><ShieldCheck size={18} /> JWT-ready account flow</span>
            <span><LockKeyhole size={18} /> Protected role dashboards</span>
            <span><UserPlus size={18} /> Member, freelancer, and client signup</span>
          </div>
        </article>

        <article className="auth-card">
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => { setMode('login'); clearAuthError() }}>Login</button>
            <button className={mode === 'signup' ? 'active' : ''} type="button" onClick={() => { setMode('signup'); clearAuthError() }}>Sign up</button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <label>
                Full name
                <input name="name" value={form.name} onChange={updateField} placeholder="Enter your full name" required />
              </label>
            )}

            <label>
              Email address
              <input name="email" type="email" value={form.email} onChange={updateField} placeholder="you@example.com" required />
            </label>

            <label>
              Password
              <input name="password" type="password" value={form.password} onChange={updateField} placeholder="Enter password" required />
            </label>

            {mode === 'signup' && (
              <label>
                Account type
                <select name="role" value={form.role} onChange={updateField}>
                  <option value="member">General member</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="client">Client</option>
                </select>
              </label>
            )}

            {authError && <div className="auth-error">{authError}</div>}

            <button className="btn trust-primary-btn w-100" type="submit" disabled={authLoading}>
              {authLoading ? 'Processing...' : mode === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>

          <div className="auth-preview-box">
            <h3>Preview role access</h3>
            <div className="auth-preview-list">
              <button type="button" onClick={() => handlePreviewLogin('member')}>Login as member</button>
              <button type="button" onClick={() => handlePreviewLogin('freelancer')}>Login as freelancer</button>
              <button type="button" onClick={() => handlePreviewLogin('client')}>Login as client</button>
              <button type="button" onClick={() => handlePreviewLogin('admin')}>Login as admin</button>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

export default AuthPage
