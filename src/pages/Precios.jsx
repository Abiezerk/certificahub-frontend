import { Link } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import { PRECIOS, dinero } from '../config/negocio'

// Lo que incluye la suscripción
const INCLUYE = [
  'Perfil en el ranking con el sello de agente capacitador verificado ante la STPS',
  'Constancias DC-3 ilimitadas',
  'Contrataciones de empresas con agenda, horarios y avisos',
  'Constancias DC-3 con el nombre, la duración y el área temática de tu registro oficial',
  'Código QR de verificación de autenticidad en cada DC-3',
  'Exámenes impresos con QR para que tus participantes te evalúen',
  'Calificación pública y estadísticas con reporte en PDF',
  'Vinculación con las instituciones para las que trabajas'
]

const PREGUNTAS = [
  {
    p: '¿Las empresas pagan por usar CertificaHub?',
    r: 'No. Las empresas buscan y contratan instructores sin costo. La suscripción es solo para instructores.'
  },
  {
    p: '¿Cómo funciona la prueba gratis?',
    r: `Cuando verificamos tu registro ante la STPS, activas tu prueba de ${PRECIOS.diasPrueba} días registrando una tarjeta. No se te cobra nada durante la prueba; si no la cancelas, al terminar se hace el primer cobro mensual. La prueba es una sola vez por instructor.`
  },
  {
    p: '¿Qué pasa si no pago o cancelo?',
    r: 'Tu perfil deja de aparecer en el ranking y no puedes recibir nuevas contrataciones. Los cursos que ya tenías contratados los puedes impartir y emitir sus constancias DC-3.'
  },
  {
    p: '¿Cómo se paga?',
    r: 'Con tarjeta de crédito o débito, de forma mensual. Los pagos se procesan con Stripe; nosotros nunca vemos los datos de tu tarjeta.'
  },
  {
    p: '¿Puedo cancelar cuando quiera?',
    r: 'Sí, desde tu panel. Tu suscripción sigue activa hasta el final del mes que ya pagaste y no se vuelve a cobrar. Si cancelas durante la prueba gratis, no se te cobra nada.'
  },
  {
    p: '¿Necesito estar registrado ante la STPS?',
    r: 'Sí. Al crear tu cuenta verificamos tu RFC en el padrón de agentes capacitadores de la STPS, y solo puedes ofrecer los cursos que tienes registrados.'
  }
]

export default function Precios() {
  usePageMeta({
    titulo: 'Precios para instructores',
    descripcion: `CertificaHub para instructores de capacitación STPS: ${dinero(PRECIOS.precioMensual)} al mes con ${PRECIOS.diasPrueba} días de prueba gratis. Constancias DC-3 ilimitadas con QR de verificación.`
  })

  return (
    <div className="page">
      <div className="container">
        <header className="precios-cabecera">
          <span className="precios-etiqueta">Para instructores</span>
          <h1>Un solo precio, sin letras chiquitas</h1>
          <p>
            Todo incluido y constancias DC-3 ilimitadas. Para las empresas que te contratan, CertificaHub es gratis.
          </p>
        </header>

        <div className="precios-planes precios-planes-unico">
          <article className="precios-plan destacado">
            <span className="precios-insignia">{PRECIOS.diasPrueba} días gratis</span>
            <h2>Suscripción mensual</h2>
            <p className="precios-plan-desc">Para instructores verificados ante la STPS.</p>
            <p className="precios-monto">
              <strong>{dinero(PRECIOS.precioMensual)}</strong> <span>{PRECIOS.moneda} / mes</span>
            </p>
            <p className="precios-iva">{PRECIOS.ivaIncluido ? 'IVA incluido' : 'Más IVA'}</p>
            <p className="precios-limite">
              <strong>Prueba gratis de {PRECIOS.diasPrueba} días</strong> al verificar tu registro. Cancela cuando quieras.
            </p>
            <Link to="/registro" className="btn btn-primary btn-block">
              Empezar prueba gratis
            </Link>
          </article>
        </div>

        <section className="card precios-incluye">
          <h2>La suscripción incluye</h2>
          <ul>
            {INCLUYE.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <section className="precios-faq">
          <h2>Preguntas frecuentes</h2>
          {PREGUNTAS.map((q) => (
            <details key={q.p} className="card">
              <summary>{q.p}</summary>
              <p>{q.r}</p>
            </details>
          ))}
        </section>

        <p className="precios-legal">
          Consulta las condiciones completas de pago y cancelación en los <Link to="/terminos">Términos y condiciones</Link>.
        </p>
      </div>
    </div>
  )
}
