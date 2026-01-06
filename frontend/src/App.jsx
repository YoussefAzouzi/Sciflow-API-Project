import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Navbar from './components/Navbar'
import Home from './pages/Home.jsx'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ConferenceList from './pages/ConferenceList'
import ConferenceDetail from './pages/ConferenceDetail'
import CreateConference from './pages/CreateConference'
import MyConferences from './pages/MyConferences'
import MyInterests from './pages/MyInterests'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/conferences" element={<ConferenceList />} />
              <Route path="/conferences/:id" element={<ConferenceDetail />} />
              <Route
                path="/create-conference"
                element={
                  <ProtectedRoute requireOrganizer>
                    <CreateConference />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-conferences"
                element={
                  <ProtectedRoute requireOrganizer>
                    <MyConferences />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-interests"
                element={
                  <ProtectedRoute>
                    <MyInterests />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
