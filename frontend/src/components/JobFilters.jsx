import { Search } from 'lucide-react'
import '../styles/jobFilters.css'

const categories = ['All', 'Web Development', 'Profile Design', 'Dashboard UI', 'Backend Support']
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']

function JobFilters({ searchTerm, category, level, onSearchChange, onCategoryChange, onLevelChange }) {
  return (
    <section className="job-filters-card">
      <div className="job-search-field">
        <Search size={18} />
        <input value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search jobs, skills, clients, or locations" />
      </div>

      <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
        {categories.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>

      <select value={level} onChange={(event) => onLevelChange(event.target.value)}>
        {levels.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </section>
  )
}

export default JobFilters
