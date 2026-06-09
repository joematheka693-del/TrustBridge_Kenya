import { Search, SlidersHorizontal } from 'lucide-react'
import { jobCategories } from '../data/demoJobs.js'
import '../styles/jobFilterBar.css'

function JobFilterBar({ searchTerm, selectedCategory, onSearchChange, onCategoryChange }) {
  return (
    <section className="job-filter-bar">
      <div className="job-search-box">
        <Search size={18} />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search jobs by title, skill, client, or location"
        />
      </div>

      <div className="job-category-filter">
        <SlidersHorizontal size={18} />
        <select value={selectedCategory} onChange={(event) => onCategoryChange(event.target.value)}>
          {jobCategories.map((category) => (
            <option value={category} key={category}>{category}</option>
          ))}
        </select>
      </div>
    </section>
  )
}

export default JobFilterBar
