import { useEffect, useState } from 'react'
import api, { apiErrorMessage } from '../api/client'

// Asistente para que el instructor verifique su registro de agente capacitador ante la STPS:
// consulta su RFC en el padrón público de la STPS y luego demuestra que es el dueño de ese registro,
// ya sea con un código enviado al correo que tiene registrado en la STPS o con revisión manual.
export default function VerificacionStps({ onVerificado }) {
  const [estado, setEstado] = useState(null)
  const [rfc, setRfc] = useState('')
  const [consulta, setConsulta] = useState(null)
  const [paso, setPaso] = useState('inicio') // inicio | resultado | codigo | manual
  const [codigo, setCodigo] = useState('')
  const [archivos, setArchivos] = useState({ identificacion: null, constancia: null })
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })

  async function cargarEstado() {
    const { data } = await api.get('/verificacion/estado')
    setEstado(data)
    setRfc((actual) => actual || data.rfc || '')
    if (data.solicitud?.estado === 'CodigoEnviado') setPaso('codigo')
    return data
  }

  useEffect(() => {
    cargarEstado().catch(() => setMensaje({ tipo: 'error', texto: 'No se pudo cargar tu estado de verificación.' }))
  }, [])

  async function consultar(e) {
    e?.preventDefault()
    setCargando(true)
    setMensaje({ tipo: '', texto: '' })
    try {
      const { data } = await api.post('/verificacion/consultar', { rfc })
      setConsulta(data)
      setPaso(data.resultado === 'Encontrado' ? 'resultado' : 'inicio')
      if (data.resultado !== 'Encontrado') setMensaje({ tipo: 'error', texto: data.mensaje })
    } catch (err) {
      setMensaje({ tipo: 'error', texto: apiErrorMessage(err, 'No se pudo consultar la STPS') })
    } finally {
      setCargando(false)
    }
  }

  async function enviarCodigo() {
    setCargando(true)
    setMensaje({ tipo: '', texto: '' })
    try {
      const { data } = await api.post('/verificacion/enviar-codigo')
      setMensaje({ tipo: 'success', texto: data.message })
      setPaso('codigo')
    } catch (err) {
      setMensaje({ tipo: 'error', texto: apiErrorMessage(err, 'No se pudo enviar el código') })
    } finally {
      setCargando(false)
    }
  }

  async function confirmarCodigo(e) {
    e.preventDefault()
    setCargando(true)
    setMensaje({ tipo: '', texto: '' })
    try {
      await api.post('/verificacion/confirmar-codigo', { codigo })
      await cargarEstado()
      onVerificado?.()
    } catch (err) {
      setMensaje({ tipo: 'error', texto: apiErrorMessage(err, 'No se pudo confirmar el código') })
    } finally {
      setCargando(false)
    }
  }

  async function enviarManual(e) {
    e.preventDefault()
    setCargando(true)
    setMensaje({ tipo: '', texto: '' })
    try {
      const formData = new FormData()
      formData.append('identificacion', archivos.identificacion)
      formData.append('constancia', archivos.constancia)
      const { data } = await api.post('/verificacion/manual', formData)
      setMensaje({ tipo: 'success', texto: data.message })
      setPaso('inicio')
      await cargarEstado()
    } catch (err) {
      setMensaje({ tipo: 'error', texto: apiErrorMessage(err, 'No se pudieron enviar los documentos') })
    } finally {
      setCargando(false)
    }
  }

  if (!estado) return null
  if (estado.estado === 'Verificado') {
    return (
      <div className="verif-ok" role="status">
        <span className="verif-ok-icono" aria-hidden="true">✓</span>
        <span>
          <strong>Agente capacitador verificado ante la STPS</strong> · RFC {estado.rfc} · {estado.cursosRegistrados}{' '}
          {estado.cursosRegistrados === 1 ? 'curso registrado' : 'cursos registrados'}
        </span>
      </div>
    )
  }

  const enRevision = estado.estado === 'EnRevision'
  const rechazado = estado.estado === 'Rechazado'
  const datosConsulta = consulta || (estado.solicitud?.estado === 'Consultada' || estado.solicitud?.estado === 'CodigoEnviado'
    ? {
        nombreStps: estado.solicitud.nombreStps,
        estatusStps: estado.solicitud.estatusStps,
        correoEnmascarado: estado.solicitud.correoEnmascarado,
        puedeVerificarPorCorreo: estado.solicitud.puedeVerificarPorCorreo,
        nombreCoincide: estado.solicitud.nombreCoincide
      }
    : null)

  return (
    <section className="verif-stps card" aria-labelledby="verif-titulo">
      <div className="verif-encabezado">
        <span className="verif-sello" aria-hidden="true">STPS</span>
        <div>
          <h2 id="verif-titulo">Verifica tu registro de agente capacitador</h2>
          <p>
            Mientras no lo verifiques, tu perfil no aparece en el ranking y las empresas no pueden contratarte. Solo podrás
            ofrecer los cursos que tienes registrados ante la STPS.
          </p>
        </div>
      </div>

      {mensaje.texto && (
        <div className={`banner ${mensaje.tipo === 'error' ? 'banner-error' : 'banner-success'}`}>{mensaje.texto}</div>
      )}

      {enRevision && (
        <div className="verif-estado">
          <strong>Tus documentos están en revisión.</strong> Te avisaremos cuando terminemos; normalmente toma de 1 a 2
          días hábiles.
        </div>
      )}

      {!enRevision && rechazado && estado.solicitud?.motivoRechazo && paso === 'inicio' && (
        <div className="banner banner-error">
          Tu verificación anterior fue rechazada: <strong>{estado.solicitud.motivoRechazo}</strong>. Puedes intentarlo de
          nuevo.
        </div>
      )}

      {!enRevision && paso === 'inicio' && (
        <form className="verif-paso" onSubmit={consultar}>
          <label htmlFor="verif-rfc">Tu RFC con homoclave</label>
          <div className="verif-fila">
            <input
              id="verif-rfc"
              value={rfc}
              maxLength={13}
              onChange={(e) => setRfc(e.target.value.toUpperCase().replace(/\s/g, ''))}
              placeholder="PELJ900515AB1"
              className="verif-rfc"
              required
            />
            <button className="btn btn-primary" disabled={cargando || rfc.length !== 13}>
              {cargando ? 'Consultando la STPS…' : 'Consultar mi registro'}
            </button>
          </div>
          <span className="campo-ayuda">
            Consultaremos tu RFC en el Registro de Agentes Capacitadores Externos, el padrón público de la STPS
            (agentes.stps.gob.mx). Puede tardar unos segundos.
          </span>
        </form>
      )}

      {!enRevision && paso === 'resultado' && datosConsulta && (
        <div className="verif-paso">
          <div className="verif-resultado">
            <div>
              <span className="verif-etiqueta">Nombre en la STPS</span>
              <strong>{datosConsulta.nombreStps}</strong>
            </div>
            <div>
              <span className="verif-etiqueta">Estatus</span>
              <strong>{datosConsulta.estatusStps}</strong>
            </div>
            {consulta && (
              <div>
                <span className="verif-etiqueta">Cursos registrados</span>
                <strong>{consulta.totalCursos}</strong>
              </div>
            )}
          </div>

          <h3 className="verif-subtitulo">Ahora confirma que este registro es tuyo</h3>

          {datosConsulta.puedeVerificarPorCorreo ? (
            <div className="verif-opcion">
              <p>
                <strong>Opción rápida: código por correo.</strong> Tomamos el correo electrónico que tienes registrado
                directamente en el padrón de la STPS y te enviaremos ahí un código de 6 dígitos:
              </p>
              <p className="verif-correo">{datosConsulta.correoEnmascarado}</p>
              <button className="btn btn-primary" onClick={enviarCodigo} disabled={cargando}>
                {cargando ? 'Enviando…' : 'Enviar código a ese correo'}
              </button>
            </div>
          ) : (
            <div className="verif-estado">
              {!datosConsulta.correoEnmascarado
                ? 'Tu registro en la STPS no tiene un correo electrónico, así que la verificación será con tus documentos.'
                : 'El nombre de tu cuenta no coincide con el del registro de la STPS, así que la verificación será con tus documentos.'}
            </div>
          )}

          <div className="verif-opcion">
            <p>
              <strong>{datosConsulta.puedeVerificarPorCorreo ? '¿Ya no tienes acceso a ese correo?' : 'Verificación con documentos'}</strong>{' '}
              Sube tu identificación oficial y tu constancia de registro de la STPS; un administrador las revisará. Los
              documentos se eliminan en cuanto termina la revisión.
            </p>
            <button className="btn btn-outline" onClick={() => setPaso('manual')}>
              Verificar con mi identificación oficial
            </button>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={() => { setPaso('inicio'); setConsulta(null) }}>
            ← Cambiar RFC
          </button>
        </div>
      )}

      {!enRevision && paso === 'codigo' && (
        <form className="verif-paso" onSubmit={confirmarCodigo}>
          <label htmlFor="verif-codigo">
            Escribe el código que enviamos a {datosConsulta?.correoEnmascarado || 'tu correo registrado en la STPS'}
          </label>
          <div className="verif-fila">
            <input
              id="verif-codigo"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="verif-codigo"
              required
            />
            <button className="btn btn-primary" disabled={cargando || codigo.length !== 6}>
              {cargando ? 'Verificando…' : 'Verificar'}
            </button>
          </div>
          <span className="campo-ayuda">
            El código vence en 15 minutos. ¿No llegó? Revisa tu carpeta de spam o{' '}
            <button type="button" className="enlace-boton" onClick={enviarCodigo} disabled={cargando}>
              envíalo de nuevo
            </button>
            .
          </span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPaso('manual')}>
            Prefiero verificar con mi identificación oficial
          </button>
        </form>
      )}

      {!enRevision && paso === 'manual' && (
        <form className="verif-paso" onSubmit={enviarManual}>
          <div className="form-group">
            <label htmlFor="verif-ine">Identificación oficial vigente (INE, pasaporte o cédula profesional)</label>
            <input
              id="verif-ine"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              required
              onChange={(e) => setArchivos({ ...archivos, identificacion: e.target.files?.[0] || null })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="verif-constancia">Constancia de registro como agente capacitador ante la STPS</label>
            <input
              id="verif-constancia"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              required
              onChange={(e) => setArchivos({ ...archivos, constancia: e.target.files?.[0] || null })}
            />
          </div>
          <span className="campo-ayuda">
            PDF, JPG, PNG o WEBP de hasta 8 MB cada uno. Se guardan de forma privada y se eliminan al terminar la revisión.
          </span>
          <div className="verif-fila" style={{ marginTop: 12 }}>
            <button className="btn btn-primary" disabled={cargando || !archivos.identificacion || !archivos.constancia}>
              {cargando ? 'Enviando…' : 'Enviar a revisión'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setPaso(datosConsulta ? 'resultado' : 'inicio')}>
              Regresar
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
