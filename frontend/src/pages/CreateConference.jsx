import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function CreateConference() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    acronym: '',
    location: '',
    start_date: '',
    end_date: '',
    topics: '',
    description: '',
    website: '',
    publisher: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/conferences', formData)
      navigate(`/conferences/${response.data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create conference')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container" style={{ maxWidth: '800px' }}>
      <h2>Create Conference</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Conference Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Acronym</label>
          <input
            type="text"
            name="acronym"
            value={formData.acronym}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Publisher</label>
          <input
            type="text"
            name="publisher"
            value={formData.publisher}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Website</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Topics</label>
          <textarea
            name="topics"
            value={formData.topics}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Conference'}
        </button>
      </form>
    </div>
  )
}

export default CreateConference
