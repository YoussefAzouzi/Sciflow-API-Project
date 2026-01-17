// frontend/src/components/Navbar.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (user) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data)
    } catch (err) {
      console.error('Failed to fetch notifications')
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (err) {
      console.error('Failed to mark notification as read')
    }
  }

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) markAsRead(notif.id)
    if (notif.conference_id) navigate(`/conferences/${notif.conference_id}`)
    setNotifOpen(false)
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <motion.nav
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--glass-border)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div className="container" style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 900,
              fontSize: '22px',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
            }}
          >
            S
          </motion.div>
          <span style={{ fontWeight: 800, fontSize: '22px', color: 'white', letterSpacing: '-0.02em' }}>
            Sciflow
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" className="btn btn-ghost" style={{ fontSize: '14px', fontWeight: 600 }}>Home</Link>

          {user && (
            <>
              <Link to="/my-interests" className="btn btn-ghost" style={{ fontSize: '14px', fontWeight: 600 }}>Interests</Link>
              {user.role === 'organizer' && (
                <Link to="/create-conference">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-primary" style={{ padding: '10px 20px' }}>
                    + Create
                  </motion.button>
                </Link>
              )}
            </>
          )}

          {!user ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>Sign In</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>Join Now</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '1px solid var(--border)', paddingLeft: '16px' }}>
              {/* Notifications */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setMenuOpen(false); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', position: 'relative', color: 'var(--text-secondary)' }}
                >
                  🔔
                  {unreadCount > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger)', width: '18px', height: '18px', borderRadius: '50%', fontSize: '10px', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--background)' }}>{unreadCount}</span>}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '45px',
                        width: '300px',
                        background: 'var(--surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--glass-border)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 1001,
                        maxHeight: '400px',
                        overflowY: 'auto'
                      }}
                    >
                      <div style={{ padding: '12px 16px', fontWeight: 700, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Notifications</span>
                        <button onClick={async () => { await api.post('/notifications/read-all'); fetchNotifications(); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer' }}>Mark All Read</button>
                      </div>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No alerts</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} onClick={() => handleNotificationClick(n)} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: n.is_read ? 'transparent' : 'rgba(139, 92, 246, 0.05)' }}>
                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{n.title}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.content}</div>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Menu */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => { setMenuOpen(!menuOpen); setNotifOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                    {user.full_name?.charAt(0)}
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>▼</span>
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '45px',
                        width: '200px',
                        background: 'var(--surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--glass-border)',
                        boxShadow: 'var(--shadow-lg)',
                        overflow: 'hidden',
                        zIndex: 1001
                      }}
                    >
                      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{user.full_name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
                      </div>
                      {user.role === 'organizer' && (
                        <Link to="/my-conferences" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '12px 16px', fontSize: '13px', color: 'white', textDecoration: 'none' }}>📋 My Conferences</Link>
                      )}
                      <button onClick={() => { logout(); navigate('/login'); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '13px' }}>🚪 Sign Out</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar
