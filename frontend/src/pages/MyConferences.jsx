import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

function MyConferences() {
  const [conferences, setConferences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMyConferences()
  }, [])

  const fetchMyConferences = async () => {
    try {
      const response = await api.get('/users/me/conferences')
      setConferences(response.data)
    } catch (err) {
      setError('Failed to load your conferences')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div>
      <h1>My Conferences</h1>
      <Link to="/create-conference">
        <button className="btn btn-primary">Create New Conference</button>
      </Link>
      {conferences.length === 0 ? (
        <p>You haven't created any conferences yet.</p>
      ) : (
        <div className="conference-grid">
          {conferences.map((conf) => (
            <Link
              key={conf.id}
              to={`/conferences/${conf.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="card">
                <div className="card-title">{conf.name}</div>
                <div className="card-subtitle">{conf.location}</div>
                <div className="card-content">
                  {conf.avg_rating && (
                    <p>⭐ {conf.avg_rating.toFixed(1)}/5</p>
                  )}
                  <p>👥 {conf.total_interests} interested</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyConferences
