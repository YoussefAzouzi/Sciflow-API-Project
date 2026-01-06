import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children, requireOrganizer = false }) {
  const { user, loading, isOrganizer } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (requireOrganizer && !isOrganizer()) {
    return <Navigate to="/" />
  }

  return children
}

export default ProtectedRoute
