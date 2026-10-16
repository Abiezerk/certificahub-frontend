import { Link } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'

// Página 404: cualquier dirección que no existe dentro del sitio
export default function NoEncontrada() {
  usePageMeta({ titulo: 'Página no encontrada', noindex: true })

  return (
    <div className="page">
      <div className="container">
        <div className="no-encontrada">
          <span className="no-encontrada-codigo" aria-hidden="true">404</span>
          <h1>Esta página no existe</h1>
          <p>Puede que el enlace esté mal escrito o que la página se haya movido.</p>
          <div className="no-encontrada-acciones">
            <Link to="/" className="btn btn-primary">
              Ir al inicio
            </Link>
            <Link to="/verificar" className="btn btn-outline">
              Verificar una constancia
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
