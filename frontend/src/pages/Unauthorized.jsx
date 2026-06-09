import { Link } from 'react-router-dom'
import '../styles/systemPages.css'

function Unauthorized() {
  return (
    <section className="system-page">
      <div className="system-card">
        <h1>Unauthorized</h1>
        <p>You do not have permission to access this page.</p>
        <Link className="btn trust-primary-btn" to="/dashboard">Go to dashboard</Link>
      </div>
    </section>
  )
}

export default Unauthorized
