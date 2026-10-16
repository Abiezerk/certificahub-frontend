import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Cómo se muestra el tipo de cuenta en el menú
const TIPO_CUENTA = { Instructor: 'Instructor', Empresa: 'Empresa', Institucion: 'Institución', Admin: 'Administrador' }

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Menú desplegable para celular (en escritorio los enlaces se ven directo en la barra)
  const [menuAbierto, setMenuAbierto] = useState(false)

  // Al cambiar de página se cierra el menú
  useEffect(() => {
    setMenuAbierto(false)
  }, [location.pathname])

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="brand">
          <span className="brand-mark">CH</span>
          CertificaHub
        </Link>

        <div className="nav-links">
          <Link to="/ranking">Buscar instructores</Link>
          <Link to="/verificar">Verificar constancia</Link>
          {user && <Link to="/panel">Mi panel</Link>}
        </div>

        {user ? (
          <div className="nav-user nav-escritorio">
            <span className="nav-user-name">
              {user.firstName} · {TIPO_CUENTA[user.userType] || user.userType}
            </span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              Salir
            </button>
          </div>
        ) : (
          <div className="nav-user nav-escritorio">
            <Link to="/login" className="btn btn-ghost btn-sm">
              Entrar
            </Link>
            <Link to="/registro" className="btn btn-primary btn-sm">
              Registrarme
            </Link>
          </div>
        )}

        <button
          type="button"
          className="nav-hamburguesa"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuAbierto}
          aria-controls="menu-movil"
          onClick={() => setMenuAbierto((v) => !v)}
        >
          {menuAbierto ? '✕' : '☰'}
        </button>
      </div>

      {menuAbierto && (
        <div className="nav-movil" id="menu-movil">
          <Link to="/ranking">Buscar instructores</Link>
          <Link to="/verificar">Verificar constancia</Link>
          {user ? (
            <>
              <Link to="/panel">Mi panel</Link>
              <div className="nav-movil-usuario">
                <span>
                  {user.firstName} · {TIPO_CUENTA[user.userType] || user.userType}
                </span>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                  Salir
                </button>
              </div>
            </>
          ) : (
            <div className="nav-movil-acciones">
              <Link to="/login" className="btn btn-outline btn-sm">
                Entrar
              </Link>
              <Link to="/registro" className="btn btn-primary btn-sm">
                Registrarme
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
