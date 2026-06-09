import { Link } from 'react-router-dom'
import '../styles/systemPages.css'

function NotFound() {
  return (
    <section className="system-page">
      <div className="system-card">
        <h1>404</h1>
        <p>The page you are looking for does not exist.</p>
        <Link className="btn trust-primary-btn" to="/">Back home</Link>
      </div>
    </section>
  )
}

export default NotFound
