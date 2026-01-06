import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h1>Welcome to Sciflow</h1>
        <p>Discover and explore scientific conferences worldwide</p>
        <Link to="/conferences">
          <button className="btn btn-primary">Explore Conferences</button>
        </Link>
      </div>

      <div className="features">
        <div className="feature-card card">
          <h3>🔍 Discover</h3>
          <p>Find conferences in your field of interest</p>
        </div>
        <div className="feature-card card">
          <h3>⭐ Rate & Review</h3>
          <p>Share your experience and help others</p>
        </div>
        <div className="feature-card card">
          <h3>📅 Track Events</h3>
          <p>Never miss important deadlines and events</p>
        </div>
        <div className="feature-card card">
          <h3>🎯 Stay Updated</h3>
          <p>Mark conferences you're interested in</p>
        </div>
      </div>
    </div>
  )
}

export default Home
