import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import InstructorDestacados from '../components/InstructorDestacados'
import InstructorDetailModal from '../components/InstructorDetailModal'

export default function Marketplace() {
  const { user } = useAuth()
  const esEmpresa = user?.userType === 'Empresa'

  const [detalle, setDetalle] = useState(null)

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-eyebrow">Plataforma para capacitación STPS</div>
          <h1>Contrata instructores con la confianza a la vista.</h1>
          <p>
            Cada instructor certificado con DC-5 muestra su medidor de confiabilidad real: qué tan seguido los
            participantes de sus cursos realmente evalúan, no solo un promedio bonito.
          </p>
          <div className="hero-actions">
            <Link to="/ranking" className="btn btn-primary">
              Ver todos los instructores
            </Link>
            {!user && (
              <Link to="/registro" className="btn btn-outline">
                Ofrecer cursos como instructor
              </Link>
            )}
          </div>
        </div>
      </section>

      <InstructorDestacados canContratar={esEmpresa} onVerDetalle={setDetalle} />

      {detalle && <InstructorDetailModal instructor={detalle} onClose={() => setDetalle(null)} />}

      <footer className="site-footer">CertificaHub — capacitación empresarial con evaluaciones reales</footer>
    </>
  )
}
