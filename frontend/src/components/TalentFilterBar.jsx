import { Search } from 'lucide-react'
import { talentCategories, talentLevels } from '../data/demoTalent.js'
import '../styles/talentFilterBar.css'

function TalentFilterBar({ searchTerm, category, level, onSearchChange, onCategoryChange, onLevelChange }) {
  return (
    <div className="talent-filter-bar">
      <div className="talent-search-box">
        <Search size={18} />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, skill, location, or category"
        />
      </div>

      <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
        {talentCategories.map((item) => (
          <option value={item} key={item}>{item}</option>
        ))}
      </select>

      <select value={level} onChange={(event) => onLevelChange(event.target.value)}>
        {talentLevels.map((item) => (
          <option value={item} key={item}>{item}</option>
        ))}
      </select>
    </div>
  )
}

export default TalentFilterBar
