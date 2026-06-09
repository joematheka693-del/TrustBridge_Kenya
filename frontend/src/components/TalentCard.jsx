import { Link } from 'react-router-dom'
import { BadgeCheck, BriefcaseBusiness, MapPin, Star } from 'lucide-react'
import '../styles/talentCard.css'

function TalentCard({ profile }) {
  return (
    <article className="talent-card">
      <div className="talent-card-top">
        <div>
          <span className="talent-category-pill">{profile.category}</span>
          <h3>{profile.name}</h3>
          <p>{profile.bio}</p>
        </div>
        <div className="talent-score-badge">
          <Star size={16} />
          <strong>{profile.trustScore}</strong>
          <span>trust</span>
        </div>
      </div>

      <div className="talent-meta-grid">
        <span><MapPin size={16} /> {profile.location}</span>
        <span><BriefcaseBusiness size={16} /> {profile.completedJobs} jobs</span>
        <span><BadgeCheck size={16} /> {profile.skillLevel}</span>
      </div>

      <div className="talent-skill-list">
        {profile.skills.slice(0, 4).map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      <div className="talent-card-footer">
        <div>
          <small>Rate</small>
          <strong>{profile.rate}</strong>
        </div>
        <Link className="btn talent-card-btn" to={`/talent/${profile.id}`}>View profile</Link>
      </div>
    </article>
  )
}

export default TalentCard
