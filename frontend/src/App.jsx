import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  // Check if we already have a token (user was previously logged in)
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('token')
  )

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated
                ? <Navigate to="/" />
                : <Login setAuth={setIsAuthenticated} />
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated
                ? <Navigate to="/" />
                : <Register setAuth={setIsAuthenticated} />
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated
                ? <Dashboard onLogout={handleLogout} />
                : <Navigate to="/login" />
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
