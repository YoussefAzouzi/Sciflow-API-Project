import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'

export default function CreateConference() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    acronym: '',
    series: '',
    publisher: '',
    location: '',
    start_date: '',
    end_date: '',
    topics: '',
    description: '',
    speakers: '',
    website: '',
    colocated_with: '',
    image_url: '',
  })

  // We add papers separately after conference creation in the detail page usually,
  // but let's allow adding a few initial ones here as well if possible.
  // Actually, for simplicity and following the user's request, I'll add an "Initial Papers" section.
  const [papers, setPapers] = useState([]) // Array of {title, url}

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddPaper = () => {
    setPapers([...papers, { title: '', url: '' }])
  }

  const handlePaperChange = (index, field, value) => {
    const newPapers = [...papers]
    newPapers[index][field] = value
    setPapers(newPapers)
  }

  const handleRemovePaper = (index) => {
    setPapers(papers.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        colocated_with: formData.colocated_with ? formData.colocated_with.split(',').map(s => s.trim()).filter(Boolean) : [],
      }

      const res = await api.post('/conferences/', payload)
      const confId = res.data.id

      if (!confId) throw new Error('Failed to retrieve conference ID')

      // Add papers if any
      const paperPromises = papers
        .filter(p => p.title.trim() && p.url.trim())
        .map(p => api.post(`/conferences/${confId}/papers`, p).catch(err => {
          console.error(`Failed to add paper ${p.title}:`, err)
          return null
        }))

      await Promise.all(paperPromises)

      navigate(`/conferences/${confId}`)
    } catch (err) {
      console.error('Full insertion error:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to create conference.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="hero-gradient" style={{ minHeight: '100vh', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="page-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'white' }}>Host a New Conference</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Enter the academic details to share your event with the researcher community</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* General Info */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--primary)' }}>📋 Event Overview</h3>
              <div className="form-group">
                <label>Conference Name *</label>
                <input name="name" value={formData.name} onChange={handleChange} required placeholder="Full name of the event..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Acronym</label>
                  <input name="acronym" value={formData.acronym} onChange={handleChange} placeholder="e.g. CVPR" />
                </div>
                <div className="form-group">
                  <label>Banner Image URL</label>
                  <input name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://unsplash.com/..." />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="What is this conference about?" />
              </div>
            </div>

            {/* Logistics */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--secondary)' }}>📍 Logistics & Dates</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input name="location" value={formData.location} onChange={handleChange} placeholder="City, Country or Online" />
                </div>
                <div className="form-group">
                  <label>Publisher</label>
                  <input name="publisher" value={formData.publisher} onChange={handleChange} placeholder="ACM, IEEE, Springer..." />
                </div>
              </div>
              <div className="form-group">
                <label>Official Website</label>
                <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://..." />
              </div>
            </div>

            {/* Research Papers Section */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--success)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                📄 Research Papers
                <button type="button" onClick={handleAddPaper} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>+ Add Paper</button>
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Link existing research papers associated with this conference.</p>

              <AnimatePresence>
                {papers.map((paper, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-end' }}
                  >
                    <div style={{ flex: 2 }}>
                      <input placeholder="Paper Title" value={paper.title} onChange={e => handlePaperChange(idx, 'title', e.target.value)} />
                    </div>
                    <div style={{ flex: 3 }}>
                      <input type="url" placeholder="https://pdf-link.com" value={paper.url} onChange={e => handlePaperChange(idx, 'url', e.target.value)} />
                    </div>
                    <button type="button" onClick={() => handleRemovePaper(idx)} className="btn btn-danger" style={{ padding: '12px', borderRadius: 'var(--radius-md)' }}>🗑️</button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {papers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', border: '1px dashed var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '14px' }}>
                  No papers added yet.
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '32px' }}>
              <button type="button" onClick={() => navigate('/')} className="btn btn-ghost">Cancel</button>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '14px 40px', fontSize: '16px' }}>
                {loading ? 'Creating...' : '✨ Create Conference'}
              </button>
            </div>
            {error && <div className="error-message" style={{ marginTop: '20px' }}>{error}</div>}
          </form>
        </motion.div>
      </div>
    </div>
  )
}
