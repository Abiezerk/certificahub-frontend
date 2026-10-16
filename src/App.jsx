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
import AdminDashboard from './pages/AdminDashboard'
import InstitucionDashboard from './pages/InstitucionDashboard'
import InstitucionDetalle from './pages/InstitucionDetalle'
import Evaluar from './pages/Evaluar'
import Verificar from './pages/Verificar'
import AvisoPrivacidad from './pages/AvisoPrivacidad'
import Terminos from './pages/Terminos'
import Precios from './pages/Precios'
import NoEncontrada from './pages/NoEncontrada'
import Footer from './components/Footer'
import usePageMeta from './hooks/usePageMeta'

function Panel() {
  const { user } = useAuth()
  usePageMeta({ titulo: 'Mi panel', noindex: true })
  if (user.userType === 'Admin') return <AdminDashboard />
  if (user.userType === 'Institucion') return <InstitucionDashboard />
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
        <Route path="/verificar" element={<Verificar />} />
        <Route path="/verificar/:numeroSerie" element={<Verificar />} />
        <Route path="/instituciones/:id" element={<InstitucionDetalle />} />
        <Route path="/privacidad" element={<AvisoPrivacidad />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/precios" element={<Precios />} />
        <Route
          path="/panel"
          element={
            <ProtectedRoute>
              <Panel />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NoEncontrada />} />
      </Routes>
      <Footer />
    </>
  )
}