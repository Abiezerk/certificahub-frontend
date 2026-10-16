import { Link } from 'react-router-dom'

// Pie de página de todo el sitio, con los enlaces legales siempre a la mano
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-contenido">
        <span>© {new Date().getFullYear()} CertificaHub — capacitación empresarial con evaluaciones reales</span>
        <nav className="site-footer-enlaces" aria-label="Enlaces legales">
          <Link to="/precios">Precios para instructores</Link>
          <Link to="/privacidad">Aviso de privacidad</Link>
          <Link to="/terminos">Términos y condiciones</Link>
          <Link to="/verificar">Verificar constancia</Link>
        </nav>
      </div>
    </footer>
  )
}
