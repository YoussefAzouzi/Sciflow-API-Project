// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CreateConference from './pages/CreateConference'
import ConferenceDetail from './pages/ConferenceDetail'
import MyInterests from './pages/MyInterests'
import MyConferences from './pages/MyConferences'
import EditConference from './pages/EditConference'
import Navbar from './components/Navbar'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/create-conference" element={<CreateConference />} />
          <Route path="/conferences/:id" element={<ConferenceDetail />} />
          <Route path="/conferences/:id/edit" element={<EditConference />} />
          <Route path="/my-interests" element={<MyInterests />} />
          <Route path="/my-conferences" element={<MyConferences />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
