import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const THEME_STORAGE_KEY = 'trustbridge-theme'

export const themeOptions = [
  {
    id: 'trust-blue',
    label: 'Trust Blue',
    description: 'Clean blue fintech marketplace theme',
    preview: 'Blue / Cyan',
  },
  {
    id: 'frost-system',
    label: 'Frost System',
    description: 'Cold glass dashboard theme for system-style screens',
    preview: 'Ice / Navy',
  },
  {
    id: 'emerald-secure',
    label: 'Emerald Secure',
    description: 'Green verification theme for safety and approval states',
    preview: 'Emerald / Teal',
  },
  {
    id: 'midnight-admin',
    label: 'Midnight Admin',
    description: 'High-contrast command-center theme for admin workspaces',
    preview: 'Violet / Blue',
  },
]

const ThemeContext = createContext(null)

function getSavedTheme() {
  if (typeof window === 'undefined') return 'trust-blue'
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  return themeOptions.some((theme) => theme.id === savedTheme) ? savedTheme : 'trust-blue'
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getSavedTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const setTheme = (nextTheme) => {
    const themeExists = themeOptions.some((item) => item.id === nextTheme)
    setThemeState(themeExists ? nextTheme : 'trust-blue')
  }

  const activeTheme = useMemo(() => {
    return themeOptions.find((item) => item.id === theme) || themeOptions[0]
  }, [theme])

  const value = useMemo(() => ({ theme, activeTheme, themeOptions, setTheme }), [theme, activeTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }

  return context
}
