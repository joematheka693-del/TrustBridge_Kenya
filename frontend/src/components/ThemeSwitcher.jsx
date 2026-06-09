import { Check, Palette } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import '../styles/themeSwitcher.css'

function ThemeSwitcher() {
  const { activeTheme, themeOptions, setTheme } = useTheme()

  return (
    <div className="dropdown trust-theme-dropdown">
      <button className="btn trust-theme-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        <Palette size={17} />
        <span>{activeTheme.label}</span>
      </button>

      <ul className="dropdown-menu dropdown-menu-end trust-theme-menu">
        <li>
          <span className="dropdown-item-text trust-theme-menu-title">Theme engine</span>
        </li>
        <li><hr className="dropdown-divider" /></li>
        {themeOptions.map((item) => (
          <li key={item.id}>
            <button className="dropdown-item trust-theme-option" type="button" onClick={() => setTheme(item.id)}>
              <span className={`trust-theme-dot trust-theme-dot-${item.id}`} />
              <span className="trust-theme-copy">
                <strong>{item.label}</strong>
                <small>{item.preview}</small>
              </span>
              {activeTheme.id === item.id ? <Check size={16} className="trust-theme-check" /> : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ThemeSwitcher
