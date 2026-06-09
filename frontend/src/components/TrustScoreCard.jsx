import { ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react'
import '../styles/trustScoreCard.css'

function getScoreLabel(score) {
  if (score >= 85) return 'Excellent trust'
  if (score >= 70) return 'Strong trust'
  if (score >= 55) return 'Growing trust'
  return 'Starter trust'
}

function TrustScoreCard({ score = 45, role = 'member', summary = 'Your TrustBridge reputation score is being prepared.' }) {
  return (
    <section className="trust-score-card">
      <div className="trust-score-orbit">
        <span>{score}</span>
        <small>/100</small>
      </div>

      <div className="trust-score-content">
        <p className="page-kicker">trust score</p>
        <h2>{getScoreLabel(score)}</h2>
        <p>{summary}</p>

        <div className="trust-score-meta">
          <span><ShieldCheck size={16} /> Role: {role}</span>
          <span><Sparkles size={16} /> Reputation ready</span>
          <span><ArrowUpRight size={16} /> Backend API prepared</span>
        </div>
      </div>
    </section>
  )
}

export default TrustScoreCard
