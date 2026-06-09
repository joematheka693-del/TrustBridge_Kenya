import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getDashboardPath } from '../utils/roleAccess.js'

function DashboardRouter() {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return <Navigate to={getDashboardPath(role)} replace />
}

export default DashboardRouter
