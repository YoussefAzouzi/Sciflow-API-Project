import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'

export default function EditConference() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
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

    useEffect(() => {
        fetchConference()
    }, [id])

    const fetchConference = async () => {
        try {
            const { data } = await api.get(`/conferences/${id}`)
            setFormData({
                name: data.name || '',
                acronym: data.acronym || '',
                series: data.series || '',
                publisher: data.publisher || '',
                location: data.location || '',
                start_date: data.start_date || '',
                end_date: data.end_date || '',
                topics: data.topics || '',
                description: data.description || '',
                speakers: data.speakers || '',
                website: data.website || '',
                colocated_with: Array.isArray(data.colocated_with) ? data.colocated_with.join(', ') : (data.colocated_with || ''),
                image_url: data.image_url || '',
            })
        } catch (err) {
            setError('Failed to load conference details')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')

        try {
            const payload = {
                ...formData,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
                colocated_with: formData.colocated_with ? formData.colocated_with.split(',').map(s => s.trim()).filter(Boolean) : []
            }

            await api.patch(`/conferences/${id}`, payload)
            navigate(`/conferences/${id}`)
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update conference.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="loading"><div className="spinner" /></div>

    return (
        <div className="hero-gradient" style={{ minHeight: '100vh', padding: '40px 0' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="page-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'white' }}>Update Conference</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Refine the details of your hosted event</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--primary)' }}>📋 Core Details</h3>
                            <div className="form-group">
                                <label>Conference Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Acronym</label>
                                    <input name="acronym" value={formData.acronym} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Image URL</label>
                                    <input name="image_url" value={formData.image_url} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={5} />
                            </div>
                        </div>

                        <div className="card" style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--secondary)' }}>📍 Location & Dates</h3>
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
                                    <input name="location" value={formData.location} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Publisher</label>
                                    <input name="publisher" value={formData.publisher} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '32px' }}>
                            <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost">Back</button>
                            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '14px 40px', fontSize: '16px' }}>
                                {submitting ? 'Saving...' : '💾 Save Changes'}
                            </button>
                        </div>
                        {error && <div className="error-message" style={{ marginTop: '20px' }}>{error}</div>}
                    </form>
                </motion.div>
            </div>
        </div>
    )
}
