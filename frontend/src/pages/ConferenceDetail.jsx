import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

function ConferenceDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [conference, setConference] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])

  useEffect(() => {
    fetchConference()
    fetchComments()
  }, [id])

  const fetchConference = async () => {
    try {
      const response = await api.get(`/conferences/${id}`)
      setConference(response.data)
      if (response.data.user_rating) {
        setRating(response.data.user_rating)
      }
    } catch (err) {
      setError('Failed to load conference')
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
    if (!user) {
      alert('Please login to rate')
      return
    }
    try {
      await api.post(`/conferences/${id}/ratings`, { rating })
      fetchConference()
      alert('Rating submitted!')
    } catch (err) {
      alert('Failed to submit rating')
    }
  }

  const handleInterest = async () => {
    if (!user) {
      alert('Please login to mark interest')
      return
    }
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
    if (!user) {
      alert('Please login to comment')
      return
    }
    try {
      await api.post(`/conferences/${id}/comments`, { content: comment })
      setComment('')
      fetchComments()
    } catch (err) {
      alert('Failed to submit comment')
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">{error}</div>
  if (!conference) return <div>Conference not found</div>

  return (
    <div className="conference-detail">
      <div className="conference-header">
        <h1>{conference.name}</h1>
        {conference.acronym && <h3>{conference.acronym}</h3>}
        <div className="conference-meta">
          {conference.location && <span>📍 {conference.location}</span>}
          {conference.start_date && (
            <span>
              📅 {new Date(conference.start_date).toLocaleDateString()}
            </span>
          )}
          {conference.publisher && <span>🏢 {conference.publisher}</span>}
        </div>
      </div>

      {conference.description && (
        <div>
          <h3>Description</h3>
          <p>{conference.description}</p>
        </div>
      )}

      {conference.topics && (
        <div>
          <h3>Topics</h3>
          <p>{conference.topics}</p>
        </div>
      )}

      {conference.website && (
        <div>
          <h3>Website</h3>
          <a href={conference.website} target="_blank" rel="noopener noreferrer">
            {conference.website}
          </a>
        </div>
      )}

      <div className="rating-container">
        <h3>Rating</h3>
        <div className="rating-display">
          {conference.avg_rating && (
            <div>
              <div className="rating-value">
                ⭐ {conference.avg_rating.toFixed(1)}/5
              </div>
              <div>{conference.total_ratings} ratings</div>
            </div>
          )}
          {user && (
            <div>
              <label>Your Rating: </label>
              <select value={rating} onChange={(e) => setRating(e.target.value)}>
                <option value="0">Select</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
              <button onClick={handleRating} className="btn btn-primary">
                Submit Rating
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="conference-actions">
        <button
          onClick={handleInterest}
          className={`btn ${conference.user_interested ? 'btn-danger' : 'btn-success'}`}
        >
          {conference.user_interested ? '❌ Remove Interest' : '⭐ Mark as Interested'}
        </button>
        <span>{conference.total_interests} people interested</span>
      </div>

      {conference.events && conference.events.length > 0 && (
        <div>
          <h3>Events</h3>
          {conference.events.map((event) => (
            <div key={event.id} className="card">
              <h4>{event.title}</h4>
              <p>Type: {event.type}</p>
              {event.date && <p>Date: {new Date(event.date).toLocaleDateString()}</p>}
              {event.description && <p>{event.description}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="comments-section">
        <h3>Comments</h3>
        {user && (
          <form onSubmit={handleComment}>
            <div className="form-group">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Post Comment
            </button>
          </form>
        )}
        <div>
          {comments.map((c) => (
            <div key={c.id} className="comment">
              <div className="comment-author">{c.user_name}</div>
              <div className="comment-date">
                {new Date(c.created_at).toLocaleDateString()}
              </div>
              <div className="comment-content">{c.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ConferenceDetail
