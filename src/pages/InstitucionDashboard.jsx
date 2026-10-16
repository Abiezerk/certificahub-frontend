import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { apiErrorMessage } from '../api/client'
import VerificacionStps from '../components/VerificacionStps'
import StarRating from '../components/StarRating'
import EliminarCuenta from '../components/EliminarCuenta'

const ESTADOS_MEXICO = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Cdmx', 'Coahuila', 'Colima', 'Durango', 'Estado de México', 'Guanajuato', 'Guerrero',
  'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora',
  'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
]

const TABS = ['Instructores', 'Perfil de la institución']

// Panel de una institución capacitadora: aprueba a los instructores que trabajan con ella
export default function InstitucionDashboard() {
  const [tab, setTab] = useState(TABS[0])
  const [institucion, setInstitucion] = useState(null)
  const [membresias, setMembresias] = useState(null) // null = cargando
  const [perfil, setPerfil] = useState({ descripcion: '', estado: '' })
  const [msg, setMsg] = useState({ tipo: '', texto: '' })
  const [procesando, setProcesando] = useState(null)
  const [guardando, setGuardando] = useState(false)

  async function cargar() {
    try {
      const [i, m] = await Promise.all([api.get('/instituciones/mi-institucion'), api.get('/instituciones/mi-institucion/instructores')])
      setInstitucion(i.data)
      setPerfil({ descripcion: i.data.descripcion || '', estado: i.data.estado || '' })
      setMembresias(m.data)
    } catch (err) {
      setMsg({ tipo: 'error', texto: apiErrorMessage(err) })
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function responder(m, accion) {
    if (accion === 'quitar' && !window.confirm(`¿Quitar a ${m.nombre} de tu institución? Dejará de aparecer en tu perfil.`)) return
    setProcesando(m.membresiaId)
    try {
      const { data } =
        accion === 'quitar'
          ? await api.delete(`/instituciones/mi-institucion/membresias/${m.membresiaId}`)
          : await api.post(`/instituciones/mi-institucion/membresias/${m.membresiaId}/${accion}`)
      setMsg({ tipo: 'success', texto: data.message })
      cargar()
    } catch (err) {
      setMsg({ tipo: 'error', texto: apiErrorMessage(err) })
    } finally {
      setProcesando(null)
    }
  }

  async function guardarPerfil(e) {
    e.preventDefault()
    setGuardando(true)
    try {
      const { data } = await api.put('/instituciones/mi-institucion', perfil)
      setMsg({ tipo: 'success', texto: data.message })
      cargar()
    } catch (err) {
      setMsg({ tipo: 'error', texto: apiErrorMessage(err) })
    } finally {
      setGuardando(false)
    }
  }

  const pendientes = (membresias || []).filter((m) => m.estado === 'Pendiente')
  const aprobados = (membresias || []).filter((m) => m.estado === 'Aprobada')
  const verificada = institucion?.verificationStatus === 'Verificado'

  return (
    <div className="page">
      <div className="container">
        <div className="dashboard-head">
          <div>
            <h1>{institucion?.razonSocial || 'Panel de institución'}</h1>
            <p>Aprueba a los instructores que trabajan con tu institución. Las empresas los encuentran en tu perfil público.</p>
          </div>
          {verificada && (
            <Link to={`/instituciones/${institucion.id}`} className="btn btn-outline btn-sm">
              Ver mi perfil público
            </Link>
          )}
        </div>

        <VerificacionStps onVerificado={cargar} />

        {institucion && (
          <div className="an-tiles inst-resumen">
            <div className="an-tile">
              <span className="an-tile-label">Instructores</span>
              <span className="an-tile-value">{institucion.totalInstructores}</span>
              <span className="an-tile-nota">verificados y visibles</span>
            </div>
            <div className="an-tile">
              <span className="an-tile-label">Calificación promedio</span>
              <span className="an-tile-value">{institucion.ratingPromedio > 0 ? `${Number(institucion.ratingPromedio).toFixed(1)} ★` : '—'}</span>
              <span className="an-tile-nota">de tus instructores</span>
            </div>
            <div className="an-tile">
              <span className="an-tile-label">Solicitudes pendientes</span>
              <span className="an-tile-value">{institucion.solicitudesPendientes}</span>
              <span className="an-tile-nota">por responder</span>
            </div>
          </div>
        )}

        {msg.texto && <div className={`banner ${msg.tipo === 'error' ? 'banner-error' : 'banner-success'}`}>{msg.texto}</div>}

        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t}
              {t === 'Instructores' && pendientes.length > 0 && <span className="tab-contador">{pendientes.length}</span>}
            </button>
          ))}
        </div>

        {tab === 'Instructores' && (
          <>
            <div className="card">
              <h2 className="an-titulo">Solicitudes para unirse</h2>
              <p className="an-subtitulo">
                Instructores verificados ante la STPS que dicen trabajar con tu institución. Apruébalos solo si de verdad
                trabajan contigo: su calificación forma parte de la de tu institución.
              </p>
              {!verificada && pendientes.length > 0 && (
                <div className="banner banner-error">Verifica tu institución para poder responder las solicitudes.</div>
              )}
              {membresias === null ? (
                <div className="empty-state">Cargando…</div>
              ) : pendientes.length === 0 ? (
                <div className="empty-state">No tienes solicitudes pendientes.</div>
              ) : (
                <div className="row-list">
                  {pendientes.map((m) => (
                    <FilaInstructor key={m.membresiaId} m={m}>
                      <button className="btn btn-primary btn-sm" disabled={!verificada || procesando === m.membresiaId} onClick={() => responder(m, 'aprobar')}>
                        ✓ Aprobar
                      </button>
                      <button className="btn btn-outline btn-sm" disabled={!verificada || procesando === m.membresiaId} onClick={() => responder(m, 'rechazar')}>
                        Rechazar
                      </button>
                    </FilaInstructor>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="an-titulo">Tus instructores</h2>
              <p className="an-subtitulo">Ordenados por calificación. Así aparecen en tu perfil público.</p>
              {membresias === null ? (
                <div className="empty-state">Cargando…</div>
              ) : aprobados.length === 0 ? (
                <div className="empty-state">
                  Aún no tienes instructores. Pide a tus instructores que se registren en CertificaHub, verifiquen su registro
                  ante la STPS y soliciten unirse a tu institución desde su perfil.
                </div>
              ) : (
                <div className="row-list">
                  {aprobados.map((m) => (
                    <FilaInstructor key={m.membresiaId} m={m}>
                      <button className="btn btn-ghost btn-sm" disabled={procesando === m.membresiaId} onClick={() => responder(m, 'quitar')}>
                        Quitar
                      </button>
                    </FilaInstructor>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'Perfil de la institución' && institucion && (
          <div className="card">
            <form onSubmit={guardarPerfil} style={{ maxWidth: 640 }}>
              <div className="form-group">
                <label>Razón social</label>
                <p style={{ fontWeight: 600, margin: 0 }}>{institucion.razonSocial}</p>
              </div>
              <div className="form-group">
                <label>RFC</label>
                <p className="verificar-mono" style={{ margin: 0 }}>{institucion.rfc || '—'}</p>
              </div>
              <div className="form-group">
                <label>Estado donde opera</label>
                <select value={perfil.estado} onChange={(e) => setPerfil({ ...perfil, estado: e.target.value })}>
                  <option value="">Selecciona…</option>
                  {ESTADOS_MEXICO.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  maxLength={1000}
                  value={perfil.descripcion}
                  onChange={(e) => setPerfil({ ...perfil, descripcion: e.target.value })}
                  placeholder="A qué se dedica tu institución, desde cuándo, en qué temas se especializa…"
                />
              </div>
              <button className="btn btn-primary" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar cambios'}</button>
            </form>
          </div>
        )}

        {tab === 'Perfil de la institución' && <EliminarCuenta tipo="Institucion" />}
      </div>
    </div>
  )
}

function FilaInstructor({ m, children }) {
  return (
    <div className="row-item">
      <div className="inst-fila-main">
        <div className="inst-logo" aria-hidden="true">
          {m.fotoUrl ? <img src={m.fotoUrl} alt="" loading="lazy" /> : m.nombre.charAt(0)}
        </div>
        <div>
          <span className="row-title">{m.nombre}</span>
          <span className="row-sub" style={{ display: 'block' }}>
            RFC {m.rfc} · {m.estadoRepublica || 'Ubicación no indicada'}
            {m.nombreRegistroStps && <> · En la STPS: {m.nombreRegistroStps}</>}
          </span>
          <span className="row-sub" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {m.ratingPromedio > 0 ? (
              <>
                <StarRating rating={m.ratingPromedio} size={13} /> {Number(m.ratingPromedio).toFixed(1)} · {m.totalEvaluaciones} eval.
              </>
            ) : (
              'Sin evaluaciones aún'
            )}
            {m.estadoVerificacion !== 'Verificado' && <strong style={{ color: 'var(--alert)' }}> · Suspendido en la STPS</strong>}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{children}</div>
    </div>
  )
}
