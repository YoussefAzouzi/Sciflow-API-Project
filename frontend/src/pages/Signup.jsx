import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user', // Default to 'user', user can toggle to 'organizer'
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/register', formData)
      login(res.data.user, res.data.access_token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="hero-gradient" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card"
        style={{ width: '100%', maxWidth: '440px', padding: '48px 40px', background: 'var(--surface)', border: '1px solid var(--glass-border)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Join Sciflow</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>Create your academic profile to track conferences</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Dr. Jane Doe" required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="jane@university.edu" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
          </div>

          <div className="form-group">
            <label>I am an...</label>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'user' })}
                className={`btn ${formData.role === 'user' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '10px', fontSize: '13px' }}
              >
                Researcher
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'organizer' })}
                className={`btn ${formData.role === 'organizer' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '10px', fontSize: '13px' }}
              >
                Organizer
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', marginTop: '20px' }}>
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign In</Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Signup
