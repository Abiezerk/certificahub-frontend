import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Marketplace from './pages/Marketplace'
import Ranking from './pages/Ranking'
import Login from './pages/Login'
import Register from './pages/Register'
import InstructorDashboard from './pages/InstructorDashboard'
import EmpresaDashboard from './pages/EmpresaDashboard'
import Evaluar from './pages/Evaluar'

function Panel() {
  const { user } = useAuth()
  if (user.userType === 'Instructor') return <InstructorDashboard />
  return <EmpresaDashboard />
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Marketplace />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/evaluar/:token" element={<Evaluar />} />
        <Route
          path="/panel"
          element={
            <ProtectedRoute>
              <Panel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}