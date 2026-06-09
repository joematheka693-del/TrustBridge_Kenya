import { Link } from 'react-router-dom'
import { ArrowRight, BriefcaseBusiness, Clock, MapPin, ShieldCheck } from 'lucide-react'
import '../styles/jobCard.css'

function JobCard({ job }) {
  return (
    <article className="job-card">
      <div className="job-card-topline">
        <span className="job-category-pill"><BriefcaseBusiness size={15} /> {job.category}</span>
        <span className={`job-status-pill ${job.status === 'open' ? 'is-open' : 'is-reviewing'}`}>{job.status}</span>
      </div>

      <h2>{job.title}</h2>
      <p className="job-client-name">{job.clientName}</p>
      <p className="job-description">{job.description}</p>

      <div className="job-meta-grid">
        <span><MapPin size={15} /> {job.location}</span>
        <span><Clock size={15} /> {job.timeline}</span>
        <span><ShieldCheck size={15} /> {job.trustLevel}</span>
      </div>

      <div className="job-skills-row">
        {job.skills.slice(0, 4).map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      <div className="job-card-footer">
        <div>
          <span className="job-budget-label">Budget</span>
          <strong>{job.budget}</strong>
        </div>
        <Link className="job-details-link" to={`/jobs/${job.id}`}>
          View details <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  )
}

export default JobCard
