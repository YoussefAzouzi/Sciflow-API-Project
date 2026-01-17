// frontend/src/pages/ConferenceDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200'

// Helper to get a relevant image based on title/topics
const getConferenceImage = (conf) => {
  if (conf.image_url) return conf.image_url;
  const text = (conf.name + ' ' + (conf.topics || '')).toLowerCase();

  if (text.includes('ai') || text.includes('machine learning') || text.includes('intelligence'))
    return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200';
  if (text.includes('robot') || text.includes('engineering'))
    return 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200';
  if (text.includes('bio') || text.includes('medicine') || text.includes('health'))
    return 'https://images.unsplash.com/photo-1532187863486-abf9d39d9995?auto=format&fit=crop&q=80&w=1200';
  if (text.includes('data') || text.includes('cloud') || text.includes('network'))
    return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200';
  if (text.includes('physic') || text.includes('space') || text.includes('quantum'))
    return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200';
  if (text.includes('chem') || text.includes('material'))
    return 'https://images.unsplash.com/photo-1532187863486-abf9d39d9995?auto=format&fit=crop&q=80&w=1200';

  return DEFAULT_BANNER;
};

function ConferenceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [conference, setConference] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])
  const [googleMsg, setGoogleMsg] = useState('')
  const [paperTitle, setPaperTitle] = useState('')
  const [paperUrl, setPaperUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchConference()
    fetchComments()
  }, [id])

  const fetchConference = async () => {
    try {
      const response = await api.get(`/conferences/${id}`)
      setConference(response.data)
      if (response.data.user_rating) setRating(response.data.user_rating)
    } catch (err) {
      setError('Failed to load conference details')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await api.get(`/conferences/${id}/comments`)
      setComments(response.data)
    } catch (err) {
      console.error('Failed to load comments')
    }
  }

  const handleRating = async () => {
    if (!user) return alert('Please login to rate')
    try {
      await api.post(`/conferences/${id}/ratings`, { rating })
      fetchConference()
    } catch (err) {
      alert('Failed to submit rating')
    }
  }

  const handleInterest = async () => {
    if (!user) return alert('Please login to mark interest')
    try {
      if (conference.user_interested) {
        await api.delete(`/interests/conferences/${id}/interest`)
      } else {
        await api.post(`/interests/conferences/${id}/interest`)
      }
      fetchConference()
    } catch (err) {
      alert('Failed to update interest')
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!user) return alert('Please login to comment')
    try {
      await api.post(`/conferences/${id}/comments`, { content: comment })
      setComment('')
      fetchComments()
    } catch (err) {
      alert('Failed to submit comment')
    }
  }

  const handleAddToGoogle = async () => {
    setGoogleMsg('')
    if (!user) return alert('Please login first')
    try {
      const response = await api.post(`/google/conferences/${id}/add`)
      setGoogleMsg('✅ Added! ' + response.data.event_link)
    } catch (err) {
      const detail = err.response?.data?.detail
      if (detail === 'Google Calendar not connected') {
        const connectRes = await api.get(`/google/connect?conference_id=${id}`)
        if (connectRes.data?.auth_url) window.location.href = connectRes.data.auth_url
      } else {
        setGoogleMsg('Failed to add to Google Calendar')
      }
    }
  }

  const handlePaperAdd = async (e) => {
    e.preventDefault()
    if (!paperUrl || !paperTitle) return alert('Provide both title and URL')
    setUploading(true)
    try {
      await api.post(`/conferences/${id}/papers`, { title: paperTitle, url: paperUrl })
      setPaperTitle(''); setPaperUrl(''); fetchConference()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add paper')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>
  if (error) return <div className="container"><div className="error-message">{error}</div></div>
  if (!conference) return <div className="container">Conference not found</div>

  const heroImg = getConferenceImage(conference)

  return (
    <div className="hero-gradient" style={{ minHeight: '100vh', pb: '80px' }}>
      {/* Hero Header */}
      <div style={{ position: 'relative', height: '400px', width: '100%', overflow: 'hidden' }}>
        <img src={heroImg} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, var(--background))' }} />
        <div className="container" style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', paddingBottom: '32px' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <span className="badge badge-green">Open Conference</span>
              {conference.acronym && <span className="badge">{conference.acronym}</span>}
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, marginBottom: '12px', color: 'white' }}>{conference.name}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', color: 'var(--text-secondary)', fontSize: '15px' }}>
              {conference.location && <span>📍 {conference.location}</span>}
              {conference.start_date && <span>📅 {new Date(conference.start_date).toLocaleDateString()}</span>}
              {conference.publisher && <span>🏢 {conference.publisher}</span>}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 1fr', gap: '32px', marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>📝 About the Conference</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {conference.description || 'No detailed description provided for this academic event.'}
            </p>
            {conference.topics && (
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px' }}>TOPICS & INTERESTS</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {conference.topics.split(',').map((t, i) => <span key={i} className="badge" style={{ background: 'var(--glass)', color: 'var(--text-primary)' }}>{t.trim()}</span>)}
                </div>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>📄</span> Research Papers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {conference.papers?.length > 0 ? (
                conference.papers.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px' }}>{p.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Added {new Date(p.created_at).toLocaleDateString()}</div>
                    </div>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>View PDF</a>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', border: '2px dashed var(--glass-border)', borderRadius: 'var(--radius-md)' }}>
                  No scientific papers linked yet. Discover research once added.
                </div>
              )}
            </div>
            {user && user.id === conference.organizer_id && (
              <form onSubmit={handlePaperAdd} style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Add New Paper Link</h4>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="text" placeholder="Full Paper Title" value={paperTitle} onChange={e => setPaperTitle(e.target.value)} />
                  <input type="url" placeholder="https://..." value={paperUrl} onChange={e => setPaperUrl(e.target.value)} />
                  <button type="submit" className="btn btn-primary" disabled={uploading}>Add</button>
                </div>
              </form>
            )}
          </motion.div>

          {/* Comments */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>💬 Discussion ({comments.length})</h3>
            {user && (
              <form onSubmit={handleComment} style={{ marginBottom: '40px', position: 'relative' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: 'white',
                    flexShrink: 0,
                    fontSize: '14px'
                  }}>
                    {user.full_name?.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Share your thoughts or ask a question..."
                      style={{
                        minHeight: '120px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--glass-border)',
                        padding: '16px',
                        fontSize: '15px'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!comment.trim()}
                        style={{ padding: '10px 24px', borderRadius: '12px' }}
                      >
                        Publish Comment
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {comments.map(c => (
                <div key={c.id} style={{ padding: '20px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{c.user_name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{c.content}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column / Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--warning)', marginBottom: '4px' }}>
                {conference.avg_rating ? conference.avg_rating.toFixed(1) : '—'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>USER SATISFACTION</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{conference.total_ratings} ratings total</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleInterest}
                className={`btn ${conference.user_interested ? 'btn-danger' : 'btn-primary'}`}
                style={{ width: '100%' }}
              >
                {conference.user_interested ? '❌ Untrack' : '💚 Track Interest'}
              </button>
              <button onClick={handleAddToGoogle} className="btn btn-secondary" style={{ width: '100%' }}>
                📅 Sync to Google
              </button>
              {conference.website && <a href={conference.website} target="_blank" className="btn btn-ghost" style={{ width: '100%' }}>🔗 Official Site</a>}
            </div>
            {googleMsg && <div style={{ fontSize: '12px', marginTop: '12px', color: 'var(--success)' }}>{googleMsg}</div>}
          </motion.div>

          {user && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card">
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>⭐ Your Rating</h4>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    style={{ background: rating >= n ? 'var(--warning)' : 'var(--glass)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', transition: '0.2s' }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <button onClick={handleRating} className="btn btn-secondary" style={{ width: '100%', fontSize: '13px' }}>Update Rating</button>
            </motion.div>
          )}

          <div className="card" style={{ background: 'var(--primary-light)', borderColor: 'var(--primary)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>👥 Community Stats</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Tracked by</span>
              <span style={{ fontWeight: 700 }}>{conference.total_interests} Researchers</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: '80px' }} />
    </div>
  )
}

export default ConferenceDetail
