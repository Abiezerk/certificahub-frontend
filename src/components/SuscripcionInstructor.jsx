import { useEffect, useState } from 'react'
import api, { apiErrorMessage } from '../api/client'
import { PRECIOS, dinero } from '../config/negocio'

const fecha = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

// Suscripción mensual del instructor (Stripe). Solo aparece ya verificado ante la STPS:
// sin suscripción vigente su perfil no sale en el ranking ni se le puede contratar.
// El pago, el cambio de tarjeta y la cancelación ocurren en las páginas de Stripe.
export default function SuscripcionInstructor() {
  const [estado, setEstado] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })

  async function cargarEstado() {
    const { data } = await api.get('/suscripcion')
    setEstado(data)
  }

  useEffect(() => {
    // Al volver de la página de pago de Stripe
    const params = new URLSearchParams(window.location.search)
    const resultado = params.get('suscripcion')
    const sessionId = params.get('session_id')
    if (resultado) window.history.replaceState(null, '', window.location.pathname)

    async function iniciar() {
      if (resultado === 'ok' && sessionId) {
        try {
          await api.post('/suscripcion/sincronizar', { sessionId })
          setMensaje({ tipo: 'success', texto: '¡Listo! Tu suscripción está activa y tu perfil ya aparece en el ranking.' })
        } catch (err) {
          setMensaje({ tipo: 'error', texto: apiErrorMessage(err) })
        }
      } else if (resultado === 'cancelada') {
        setMensaje({ tipo: 'error', texto: 'No se completó el pago. Puedes intentarlo de nuevo cuando quieras.' })
      }
      await cargarEstado()
    }
    iniciar().catch(() => setMensaje({ tipo: 'error', texto: 'No se pudo cargar tu suscripción.' }))
  }, [])

  // Checkout (pagar) o portal (administrar): ambos devuelven una URL de Stripe a la que se redirige
  async function irAStripe(ruta) {
    setCargando(true)
    setMensaje({ tipo: '', texto: '' })
    try {
      const { data } = await api.post(ruta)
      window.location.assign(data.url)
    } catch (err) {
      setMensaje({ tipo: 'error', texto: apiErrorMessage(err) })
      setCargando(false)
    }
  }

  if (!estado || !estado.verificado) return null

  const aviso = mensaje.texto && (
    <div className={`banner ${mensaje.tipo === 'error' ? 'banner-error' : 'banner-success'}`}>{mensaje.texto}</div>
  )

  if (estado.vigente) {
    let detalle
    if (estado.estado === 'trialing') {
      detalle = estado.cancelaAlFinalDelPeriodo
        ? <>Prueba gratis hasta el {fecha(estado.fechaFinPrueba)}. Cancelaste: no se te cobrará nada.</>
        : <>Prueba gratis hasta el {fecha(estado.fechaFinPrueba)}. Ese día se cobran {dinero(PRECIOS.precioMensual)} a tu tarjeta.</>
    } else if (estado.estado === 'past_due') {
      detalle = <>No pudimos cobrar tu mensualidad. Actualiza tu tarjeta para que tu perfil siga visible.</>
    } else {
      detalle = estado.cancelaAlFinalDelPeriodo
        ? <>Cancelada: sigue activa hasta el {fecha(estado.fechaFinPeriodo)}.</>
        : <>Próximo cobro: {fecha(estado.fechaFinPeriodo)} · {dinero(PRECIOS.precioMensual)}</>
    }

    const conProblema = estado.estado === 'past_due'
    return (
      <>
        <div className={`verif-ok ${conProblema ? 'susc-problema' : ''}`} role="status">
          <span className="verif-ok-icono" aria-hidden="true">{conProblema ? '!' : '$'}</span>
          <span className="verif-ok-texto">
            <strong>{estado.estado === 'trialing' ? 'Prueba gratis activa' : 'Suscripción activa'}</strong> · {detalle}
          </span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => irAStripe('/suscripcion/portal')} disabled={cargando}>
            {cargando ? 'Abriendo…' : conProblema ? 'Actualizar tarjeta' : 'Administrar suscripción'}
          </button>
        </div>
        {aviso}
      </>
    )
  }

  const termino = estado.estado === 'canceled' || estado.estado === 'unpaid'
  return (
    <section className="verif-stps card" aria-labelledby="susc-titulo">
      <div className="verif-encabezado">
        <span className="verif-sello" aria-hidden="true">$</span>
        <div>
          <h2 id="susc-titulo">
            {estado.puedeUsarPrueba ? `Activa tu prueba gratis de ${PRECIOS.diasPrueba} días` : 'Activa tu suscripción'}
          </h2>
          <p>
            {termino ? 'Tu suscripción terminó. ' : ''}
            Mientras no esté activa, tu perfil no aparece en el ranking ni puede recibir nuevas contrataciones.
          </p>
        </div>
      </div>

      <div className="verif-estado">
        {estado.puedeUsarPrueba ? (
          <>
            Registra tu tarjeta y usa CertificaHub <strong>{PRECIOS.diasPrueba} días gratis</strong>. Si no cancelas antes,
            al terminar la prueba se cobran <strong>{dinero(PRECIOS.precioMensual)} {PRECIOS.moneda}</strong> al mes
            ({PRECIOS.ivaIncluido ? 'IVA incluido' : 'más IVA'}). Puedes cancelar cuando quieras.
          </>
        ) : (
          <>
            <strong>{dinero(PRECIOS.precioMensual)} {PRECIOS.moneda}</strong> al mes
            ({PRECIOS.ivaIncluido ? 'IVA incluido' : 'más IVA'}), constancias DC-3 ilimitadas. Cancela cuando quieras.
          </>
        )}
      </div>

      {!estado.pagosConfigurados && (
        <div className="banner banner-error susc-margen">Los pagos todavía no están configurados en el servidor.</div>
      )}
      {aviso && <div className="susc-margen">{aviso}</div>}

      <div className="verif-fila susc-margen">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => irAStripe('/suscripcion/checkout')}
          disabled={cargando || !estado.pagosConfigurados}
        >
          {cargando ? 'Abriendo la página de pago…' : estado.puedeUsarPrueba ? 'Empezar prueba gratis' : 'Suscribirme'}
        </button>
        {estado.tieneCliente && (
          <button type="button" className="btn btn-ghost" onClick={() => irAStripe('/suscripcion/portal')} disabled={cargando}>
            Ver mis pagos y facturas
          </button>
        )}
      </div>
      <p className="campo-ayuda">El pago se hace en la página segura de Stripe; CertificaHub nunca ve los datos de tu tarjeta.</p>
    </section>
  )
}
