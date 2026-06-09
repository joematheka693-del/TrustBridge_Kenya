import { Link } from 'react-router-dom'
import '../styles/footer.css'

function Footer() {
  return (
    <footer className="trust-footer">
      <div className="container trust-footer-grid">
        <div>
          <h3>TrustBridge Kenya</h3>
          <p>A trust-first marketplace for Kenyan freelancers, clients, verification, and reputation growth.</p>
        </div>

        <div>
          <h4>Platform</h4>
          <Link to="/jobs">Jobs</Link>
          <Link to="/talent">Talent</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>

        <div>
          <h4>Support</h4>
          <span>Manuals</span>
          <span>Verification</span>
          <span>System audit</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
