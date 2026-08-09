import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
          <Link to="/">Buscar instructores</Link>
          {user && <Link to="/panel">Mi panel</Link>}
        </div>

        {user ? (
          <div className="nav-user">
            <span className="nav-user-name">
              {user.firstName} · {user.userType}
            </span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              Salir
            </button>
          </div>
        ) : (
          <div className="nav-user">
            <Link to="/login" className="btn btn-ghost btn-sm">
              Entrar
            </Link>
            <Link to="/registro" className="btn btn-primary btn-sm">
              Registrarme
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
