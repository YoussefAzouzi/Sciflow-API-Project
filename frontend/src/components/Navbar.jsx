import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout, isOrganizer } = useAuth()

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          Sciflow
        </Link>
        <div className="navbar-links">
          <Link to="/conferences">Conferences</Link>
          {user ? (
            <>
              {isOrganizer() && (
                <>
                  <Link to="/create-conference">Create Conference</Link>
                  <Link to="/my-conferences">My Conferences</Link>
                </>
              )}
              <Link to="/my-interests">My Interests</Link>
              <span>Welcome, {user.full_name}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
