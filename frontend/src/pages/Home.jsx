import { Link } from 'react-router-dom'
import { BriefcaseBusiness, ShieldCheck, Star, Users } from 'lucide-react'
import '../styles/home.css'

function Home() {
  return (
    <section className="home-page">
      <div className="container home-hero">
        <div className="home-hero-content">
          <span className="section-kicker">Kenya freelance trust platform</span>
          <h1>Build credibility, find jobs, hire verified talent.</h1>
          <p>TrustBridge Kenya connects freelancers and clients through jobs, talent profiles, verification, applications, trust scores, and admin oversight.</p>
          <div className="home-hero-actions">
            <Link className="btn trust-primary-btn" to="/jobs">Explore jobs</Link>
            <Link className="btn btn-outline-light" to="/talent">Find talent</Link>
          </div>
        </div>

        <div className="home-hero-card">
          <div className="hero-score-circle">92</div>
          <h2>Trust Score Preview</h2>
          <p>Verification, profile completion, applications, completed jobs, and admin trust events will build reputation.</p>
        </div>
      </div>

      <div className="container home-feature-grid">
        <article className="feature-card">
          <BriefcaseBusiness size={28} />
          <h3>Jobs Marketplace</h3>
          <p>Clients post work and freelancers apply with clear budgets, timelines, and status tracking.</p>
        </article>

        <article className="feature-card">
          <Users size={28} />
          <h3>Talent Profiles</h3>
          <p>Freelancers build profiles with skills, portfolio links, rates, trust score, and completed work.</p>
        </article>

        <article className="feature-card">
          <ShieldCheck size={28} />
          <h3>Verification Center</h3>
          <p>Users submit portfolio, GitHub, certificate, business, and previous work evidence for review.</p>
        </article>

        <article className="feature-card">
          <Star size={28} />
          <h3>Trust Score</h3>
          <p>A transparent reputation system helps users understand credibility before hiring or applying.</p>
        </article>
      </div>
    </section>
  )
}

export default Home
