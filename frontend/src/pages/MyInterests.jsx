import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

function MyInterests() {
  const [conferences, setConferences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMyInterests()
  }, [])

  const fetchMyInterests = async () => {
    try {
      const response = await api.get('/interests/my-interests')
      setConferences(response.data)
    } catch (err) {
      setError('Failed to load your interests')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div>
      <h1>My Interests</h1>
      {conferences.length === 0 ? (
        <p>You haven't marked any conferences as interested yet.</p>
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
                  {conf.start_date && (
                    <p>📅 {new Date(conf.start_date).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyInterests
