import { Link } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import { PRECIOS, dinero } from '../config/negocio'

// Lo que incluyen todos los planes
const INCLUYE = [
  'Perfil en el ranking con el sello de agente capacitador verificado ante la STPS',
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
    r: 'No. Las empresas buscan y contratan instructores sin costo. Los planes son solo para instructores.'
  },
  {
    p: '¿Qué pasa si llego al límite de constancias del plan Estándar?',
    r: 'Puedes cambiar al plan Pro en cualquier momento para seguir generando constancias ese mes. El límite se cuenta por mes calendario.'
  },
  {
    p: '¿Cómo se paga?',
    r: 'Con tarjeta de crédito o débito, de forma mensual. Los pagos se procesan con Stripe; nosotros nunca vemos los datos de tu tarjeta.'
  },
  {
    p: '¿Puedo cancelar cuando quiera?',
    r: 'Sí. Tu plan sigue activo hasta el final del mes que ya pagaste y no se vuelve a cobrar.'
  },
  {
    p: '¿Necesito estar registrado ante la STPS?',
    r: 'Sí. Al crear tu cuenta verificamos tu RFC en el padrón de agentes capacitadores de la STPS, y solo puedes ofrecer los cursos que tienes registrados.'
  }
]

export default function Precios() {
  usePageMeta({
    titulo: 'Planes para instructores',
    descripcion: `Planes de CertificaHub para instructores de capacitación STPS desde ${dinero(PRECIOS.planes[0].precioMensual)} al mes. Constancias DC-3 con QR de verificación.`
  })

  return (
    <div className="page">
      <div className="container">
        <header className="precios-cabecera">
          <span className="precios-etiqueta">Para instructores</span>
          <h1>Planes simples, sin letras chiquitas</h1>
          <p>
            Elige según cuántas constancias DC-3 generas al mes. Para las empresas que te contratan, CertificaHub es gratis.
          </p>
        </header>

        <div className="precios-planes">
          {PRECIOS.planes.map((plan, i) => {
            const destacado = i === PRECIOS.planes.length - 1
            return (
              <article className={`precios-plan ${destacado ? 'destacado' : ''}`} key={plan.id}>
                {destacado && <span className="precios-insignia">Sin límite</span>}
                <h2>{plan.nombre}</h2>
                <p className="precios-plan-desc">{plan.descripcion}</p>
                <p className="precios-monto">
                  <strong>{dinero(plan.precioMensual)}</strong> <span>{PRECIOS.moneda} / mes</span>
                </p>
                <p className="precios-iva">{PRECIOS.ivaIncluido ? 'IVA incluido' : 'Más IVA'}</p>
                <p className="precios-limite">
                  {plan.limiteDc3Mensual ? (
                    <>Hasta <strong>{plan.limiteDc3Mensual}</strong> constancias DC-3 al mes</>
                  ) : (
                    <><strong>Constancias DC-3 ilimitadas</strong></>
                  )}
                </p>
                <Link to="/registro" className={`btn ${destacado ? 'btn-primary' : 'btn-outline'} btn-block`}>
                  Empezar con {plan.nombre}
                </Link>
              </article>
            )
          })}
        </div>

        <section className="card precios-incluye">
          <h2>Todos los planes incluyen</h2>
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
