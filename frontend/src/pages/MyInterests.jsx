import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

function MyInterests() {
  const [conferences, setConferences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchInterests()
  }, [])

  const fetchInterests = async () => {
    try {
      const res = await api.get('/interests/my-interests')
      setConferences(res.data)
    } catch (err) {
      setError('Failed to load tracked conferences')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div className="hero-gradient" style={{ minHeight: '100vh', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="page-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'white' }}>Your Research Track</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Centralized feed for the conferences you are following.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {conferences.length === 0 && !error && (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📍</div>
            <h3>Your track is empty</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Start following conferences to see them here.</p>
            <Link to="/">
              <button className="btn btn-primary">Discover Events</button>
            </Link>
          </div>
        )}

        <div style={{ display: 'grid', gap: '20px' }}>
          <AnimatePresence>
            {conferences.map((conf, i) => (
              <motion.div
                key={conf.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 10, transition: { duration: 0.2 } }}
                className="card"
                style={{ padding: 0, position: 'relative' }}
              >
                <Link to={`/conferences/${conf.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
                  <div style={{ width: '120px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', opacity: 0.2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                    📚
                  </div>
                  <div style={{ padding: '24px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{conf.name}</h3>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {conf.location && <span>📍 {conf.location}</span>}
                          {conf.start_date && <span>📅 {new Date(conf.start_date).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--warning)' }}>⭐ {conf.avg_rating?.toFixed(1) || '—'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{conf.total_interests} Tracking</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default MyInterests
