import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'

function MyConferences() {
  const [conferences, setConferences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

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

  const handleDelete = async (e, id) => {
    e.preventDefault()
    if (!window.confirm('Delete this conference permanently?')) return
    try {
      await api.delete(`/conferences/${id}`)
      setConferences(conferences.filter(c => c.id !== id))
    } catch (err) {
      alert('Failed to delete conference')
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div className="hero-gradient" style={{ minHeight: '100vh', padding: '40px 0' }}>
      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'white' }}>Organizer Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage and monitor the events you are hosting.</p>
          </div>
          <Link to="/create-conference">
            <button className="btn btn-primary">+ New Event</button>
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {conferences.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📁</div>
            <h3 style={{ marginBottom: '12px' }}>No conferences yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Ready to share your event with the scientific community?</p>
            <Link to="/create-conference">
              <button className="btn btn-primary">Launch a Conference</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {conferences.map((conf) => (
              <motion.div key={conf.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: '100px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', opacity: 0.3 }} />
                <div style={{ padding: '24px', marginTop: '-40px' }}>
                  <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-md)' }}>
                    <Link to={`/conferences/${conf.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px', color: 'white' }}>{conf.name}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{conf.location || 'Location Pending'}</p>

                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span>⭐ {conf.avg_rating?.toFixed(1) || 'N/A'}</span>
                        <span>👥 {conf.total_interests || 0} Following</span>
                      </div>
                    </Link>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                      <button onClick={(e) => { e.preventDefault(); navigate(`/conferences/${conf.id}/edit`); }} className="btn btn-secondary" style={{ flex: 1, fontSize: '13px' }}>Edit</button>
                      <button onClick={(e) => handleDelete(e, conf.id)} className="btn btn-ghost" style={{ color: 'var(--danger)', fontSize: '13px' }}>Delete</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyConferences
