// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
}

const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800'

// Helper to get a relevant image based on title/topics
const getConferenceImage = (conf) => {
  if (conf.image_url) return conf.image_url;
  const text = (conf.name + ' ' + (conf.topics || '')).toLowerCase();

  if (text.includes('ai') || text.includes('machine learning') || text.includes('intelligence'))
    return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800';
  if (text.includes('robot') || text.includes('engineering'))
    return 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800';
  if (text.includes('bio') || text.includes('medicine') || text.includes('health'))
    return 'https://images.unsplash.com/photo-1532187863486-abf9d39d9995?auto=format&fit=crop&q=80&w=800';
  if (text.includes('data') || text.includes('cloud') || text.includes('network'))
    return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800';
  if (text.includes('physic') || text.includes('space') || text.includes('quantum'))
    return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800';
  if (text.includes('chem') || text.includes('material'))
    return 'https://images.unsplash.com/photo-1532187863486-abf9d39d9995?auto=format&fit=crop&q=80&w=800';

  return DEFAULT_THUMBNAIL;
};

function Home() {
  const [conferences, setConferences] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchConferences()
  }, [])

  const fetchConferences = async () => {
    try {
      const response = await api.get('/conferences')
      setConferences(response.data)
    } catch (err) {
      console.error('Failed to fetch conferences')
    } finally {
      setLoading(false)
    }
  }

  const filtered = conferences.filter((conf) =>
    conf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conf.topics?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conf.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sciflowConferences = filtered.filter(c => c.source !== 'dev.events')
  const devEventsConferences = filtered.filter(c => c.source === 'dev.events')

  const getStatusBadge = (end) => {
    if (!end) return null
    const endDate = new Date(end)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const isFinished = endDate < today
    return (
      <span className={`badge ${isFinished ? 'badge-gray' : 'badge-green'}`}>
        {isFinished ? 'Finished' : 'Open'}
      </span>
    )
  }

  const renderCard = (conf, i) => {
    const imgUrl = getConferenceImage(conf)
    return (
      <motion.div
        key={conf.id}
        variants={cardVariants}
        whileHover={{ y: -8, transition: { duration: 0.2 } }}
        className="card"
        style={{ padding: 0, display: 'flex', flexDirection: 'column' }}
      >
        <Link to={`/conferences/${conf.id}`} style={{ display: 'block', height: '100%' }}>
          <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
            <img
              src={imgUrl}
              alt={conf.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            />
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              display: 'flex',
              gap: '8px',
              zIndex: 2
            }}>
              {getStatusBadge(conf.end_date || conf.start_date)}
            </div>
            {conf.acronym && (
              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(4px)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--primary)',
                border: '1px solid var(--primary)',
                zIndex: 2
              }}>
                {conf.acronym}
              </div>
            )}
          </div>

          <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'white', display: 'line-clamp' }}>
              {conf.name}
            </h3>

            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {conf.location && <span>📍 {conf.location}</span>}
              {conf.start_date && <span>📅 {new Date(conf.start_date).toLocaleDateString()}</span>}
            </div>

            <p style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '20px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {conf.description || conf.topics || 'No description available for this scientific event.'}
            </p>

            <div style={{
              marginTop: 'auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>👤</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {conf.total_interests || 0} interested
                </span>
              </div>
              {conf.avg_rating && (
                <div style={{ fontWeight: 700, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ⭐ {conf.avg_rating.toFixed(1)}
                </div>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div className="hero-gradient" style={{ minHeight: '100vh' }}>
      <div className="container">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            marginBottom: '40px'
          }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 800,
              marginBottom: '20px',
              background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}
          >
            Scientific Discovery <br /> Starts Here
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              color: 'var(--text-secondary)',
              fontSize: '18px',
              maxWidth: '600px',
              margin: '0 auto 40px',
              lineHeight: 1.8
            }}
          >
            Explore, track and share the world's leading academic conferences and research symposia.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}
          >
            <input
              type="text"
              placeholder="🔍 Search conferences, topics, or cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="fade-in"
              style={{
                width: '100%',
                padding: '20px 30px 20px 60px',
                fontSize: '16px',
                borderRadius: '50px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
              }}
            />
            <span style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '20px' }}>
              🔎
            </span>
          </motion.div>
        </motion.div>

        {/* Sections */}
        <AnimatePresence>
          {sciflowConferences.length > 0 && (
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ marginBottom: '60px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, whiteSpace: 'nowrap' }}>🌟 Featured Conferences</h2>
                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, var(--border), transparent)' }} />
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px'
              }}>
                {sciflowConferences.map((conf, i) => renderCard(conf, i))}
              </div>
            </motion.section>
          )}

          {devEventsConferences.length > 0 && (
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ marginBottom: '60px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>🌐 Global RSS Feed</h2>
                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, var(--border), transparent)' }} />
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px'
              }}>
                {devEventsConferences.map((conf, i) => renderCard(conf, i + 3))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🏜️</div>
            <h3 style={{ fontSize: '24px', color: 'var(--text-secondary)' }}>No conferences found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try a different search term or check back later.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
