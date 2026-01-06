import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

function ConferenceList() {
  const [conferences, setConferences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchConferences()
  }, [])

  const fetchConferences = async () => {
    try {
      const response = await api.get('/conferences')
      setConferences(response.data)
    } catch (err) {
      setError('Failed to load conferences')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading conferences...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div>
      <h1>Conferences</h1>
      {conferences.length === 0 ? (
        <p>No conferences found.</p>
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
                <div className="card-subtitle">
                  {conf.acronym && `${conf.acronym} • `}
                  {conf.location}
                </div>
                <div className="card-content">
                  {conf.start_date && (
                    <p>
                      📅 {new Date(conf.start_date).toLocaleDateString()}
                    </p>
                  )}
                  {conf.avg_rating && (
                    <p>⭐ Rating: {conf.avg_rating.toFixed(1)}/5</p>
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

export default ConferenceList
