import { createContext, useContext, useMemo, useState } from 'react'
import { loginUser, signupUser } from '../services/authApi.js'
import { getDashboardPath } from '../utils/roleAccess.js'

const AuthContext = createContext(null)

const previewUsers = {
  member: {
    id: 1,
    name: 'Demo Member',
    email: 'member@trustbridge.co.ke',
    role: 'member',
  },
  freelancer: {
    id: 2,
    name: 'Demo Freelancer',
    email: 'freelancer@trustbridge.co.ke',
    role: 'freelancer',
  },
  client: {
    id: 3,
    name: 'Demo Client',
    email: 'client@trustbridge.co.ke',
    role: 'client',
  },
  admin: {
    id: 4,
    name: 'TrustBridge Admin',
    email: 'admin@trustbridge.co.ke',
    role: 'admin',
  },
}

function safelyParseUser(value) {
  try {
    return value ? JSON.parse(value) : null
  } catch {
    localStorage.removeItem('trustbridge_user')
    return null
  }
}

function normalizeSessionUser(apiUser) {
  return {
    id: apiUser?.id || apiUser?.user_id || Date.now(),
    name: apiUser?.name || 'TrustBridge User',
    email: apiUser?.email || '',
    role: apiUser?.role || 'member',
    status: apiUser?.status || 'active',
  }
}

export function AuthProvider({ children }) {
  const storedToken = localStorage.getItem('trustbridge_token')
  const storedUser = safelyParseUser(localStorage.getItem('trustbridge_user'))
  const [token, setToken] = useState(storedToken || '')
  const [user, setUser] = useState(storedUser)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const saveSession = (nextUser, nextToken) => {
    localStorage.setItem('trustbridge_token', nextToken)
    localStorage.setItem('trustbridge_user', JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
  }

  const loginPreview = (role = 'member') => {
    const nextUser = previewUsers[role] || previewUsers.member
    setAuthError('')
    saveSession(nextUser, `preview-${nextUser.role}-token`)
  }

  const loginWithForm = async ({ email, password }) => {
    setAuthLoading(true)
    setAuthError('')

    try {
      const result = await loginUser({ email, password })
      const nextUser = normalizeSessionUser(result.data.user)
      saveSession(nextUser, result.data.token)
      return nextUser
    } catch (error) {
      const message = error.message || 'Login failed. Confirm the backend and database are running.'
      setAuthError(message)
      throw new Error(message)
    } finally {
      setAuthLoading(false)
    }
  }

  const signupWithForm = async ({ name, email, password, role }) => {
    setAuthLoading(true)
    setAuthError('')

    try {
      const result = await signupUser({ name, email, password, role })
      const nextUser = normalizeSessionUser(result.data.user)
      saveSession(nextUser, result.data.token)
      return nextUser
    } catch (error) {
      const message = error.message || 'Signup failed. Confirm the backend and database are running.'
      setAuthError(message)
      throw new Error(message)
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('trustbridge_token')
    localStorage.removeItem('trustbridge_user')
    setToken('')
    setUser(null)
    setAuthError('')
  }

  const clearAuthError = () => setAuthError('')

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      role: user?.role || 'guest',
      previewUsers,
      authLoading,
      authError,
      loginPreview,
      loginWithForm,
      signupWithForm,
      logout,
      clearAuthError,
      getDashboardPath: () => getDashboardPath(user?.role || 'member'),
    }),
    [token, user, authLoading, authError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
