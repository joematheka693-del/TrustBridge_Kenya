import { Search } from 'lucide-react'
import { applicationTypes } from '../data/demoApplications.js'
import '../styles/applicationFilterBar.css'

function ApplicationFilterBar({ search, type, status, onSearchChange, onTypeChange, onStatusChange }) {
  return (
    <section className="application-filter-bar">
      <label className="application-search-field">
        <Search size={18} />
        <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search applications or invites" />
      </label>

      <select value={type} onChange={(event) => onTypeChange(event.target.value)} aria-label="Filter by application type">
        {applicationTypes.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
      </select>

      <select value={status} onChange={(event) => onStatusChange(event.target.value)} aria-label="Filter by status">
        <option value="all">All statuses</option>
        <option value="pending">Pending</option>
        <option value="shortlisted">Shortlisted</option>
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
      </select>
    </section>
  )
}

export default ApplicationFilterBar
