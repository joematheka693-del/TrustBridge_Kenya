import { Search } from 'lucide-react'
import { verificationStatuses } from '../data/demoVerificationRequests.js'
import '../styles/verificationFilterBar.css'

function VerificationFilterBar({ searchTerm, status, onSearchChange, onStatusChange }) {
  return (
    <section className="verification-filter-bar">
      <label className="verification-search-box">
        <Search size={18} />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search name, email, role, or evidence"
        />
      </label>

      <select value={status} onChange={(event) => onStatusChange(event.target.value)}>
        {verificationStatuses.map((item) => (
          <option value={item} key={item}>
            {item === 'all' ? 'All statuses' : item.replaceAll('_', ' ')}
          </option>
        ))}
      </select>
    </section>
  )
}

export default VerificationFilterBar
