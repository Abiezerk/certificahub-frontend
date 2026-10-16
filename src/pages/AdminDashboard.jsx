import { useEffect, useState } from 'react'
import api, { apiErrorMessage } from '../api/client'

const TABS = [
  { id: 'EnRevision', label: 'Pendientes de revisión' },
  { id: 'Aprobada', label: 'Aprobadas' },
  { id: 'Rechazada', label: 'Rechazadas' }
]

function fecha(valor) {
  if (!valor) return '—'
  const utc = /[zZ]|[+-]\d{2}:\d{2}$/.test(valor) ? valor : `${valor}Z`
  return new Date(utc).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
}

// Panel del administrador: revisión manual de la verificación de agentes capacitadores
export default function AdminDashboard() {
  const [tab, setTab] = useState('EnRevision')
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [msg, setMsg] = useState({ tipo: '', texto: '' })
  const [rechazando, setRechazando] = useState(null) // id de la solicitud que se está rechazando
  const [motivo, setMotivo] = useState('')
  const [procesando, setProcesando] = useState(null)

  async function cargar(estado = tab) {
    setCargando(true)
    try {
      const { data } = await api.get('/admin/verificaciones', { params: { estado } })
      setSolicitudes(data)
    } catch (err) {
      setMsg({ tipo: 'error', texto: apiErrorMessage(err, 'No se pudieron cargar las solicitudes') })
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar(tab)
  }, [tab])

  async function aprobar(s) {
    if (!window.confirm(`¿Aprobar la verificación de ${s.nombreCuenta} (RFC ${s.rfc})?`)) return
    setProcesando(s.id)
    try {
      const { data } = await api.post(`/admin/verificaciones/${s.id}/aprobar`)
      setMsg({ tipo: 'success', texto: `${data.message} ${s.nombreCuenta} ya está verificado.` })
      cargar()
    } catch (err) {
      setMsg({ tipo: 'error', texto: apiErrorMessage(err) })
    } finally {
      setProcesando(null)
    }
  }

  async function rechazar(e, s) {
    e.preventDefault()
    setProcesando(s.id)
    try {
      const { data } = await api.post(`/admin/verificaciones/${s.id}/rechazar`, { motivo })
      setMsg({ tipo: 'success', texto: `${data.message} Se le mostrará el motivo a ${s.nombreCuenta}.` })
      setRechazando(null)
      setMotivo('')
      cargar()
    } catch (err) {
      setMsg({ tipo: 'error', texto: apiErrorMessage(err) })
    } finally {
      setProcesando(null)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="dashboard-head">
          <div>
            <h1>Panel de administrador</h1>
            <p>Revisa las solicitudes de verificación manual de agentes capacitadores.</p>
          </div>
        </div>

        {msg.texto && <div className={`banner ${msg.tipo === 'error' ? 'banner-error' : 'banner-success'}`}>{msg.texto}</div>}

        <div className="tabs">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {cargando ? (
          <div className="card"><div className="empty-state">Cargando…</div></div>
        ) : solicitudes.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              {tab === 'EnRevision' ? 'No hay solicitudes pendientes. 🎉' : 'No hay solicitudes en esta sección.'}
            </div>
          </div>
        ) : (
          <div className="admin-lista">
            {solicitudes.map((s) => (
              <article className="card admin-solicitud" key={s.id}>
                <div className="admin-solicitud-cabecera">
                  <div>
                    <h3>{s.nombreCuenta}</h3>
                    <span className="admin-meta">
                      {s.tipoCuenta} · {s.emailCuenta} · solicitada el {fecha(s.solicitadaEl)}
                    </span>
                  </div>
                  <span className={`admin-coincide ${s.nombreCoincide ? 'si' : 'no'}`}>
                    {s.nombreCoincide ? '✓ El nombre coincide con la STPS' : '⚠ El nombre NO coincide con la STPS'}
                  </span>
                </div>

                <dl className="admin-datos">
                  <div><dt>RFC</dt><dd className="verificar-mono">{s.rfc}</dd></div>
                  <div><dt>Nombre en la STPS</dt><dd>{s.nombreStps || '—'}</dd></div>
                  <div><dt>Tipo de agente</dt><dd>{s.tipoAgenteStps || '—'}</dd></div>
                  <div><dt>Estatus en la STPS</dt><dd>{s.estatusStps || '—'}</dd></div>
                  {s.fechaRevision && <div><dt>Revisada el</dt><dd>{fecha(s.fechaRevision)}</dd></div>}
                  {s.motivoRechazo && <div><dt>Motivo del rechazo</dt><dd>{s.motivoRechazo}</dd></div>}
                </dl>

                {tab === 'EnRevision' && (
                  <>
                    <div className="admin-documentos">
                      {s.identificacionUrl && (
                        <a href={s.identificacionUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                          🪪 Ver identificación oficial
                        </a>
                      )}
                      {s.constanciaUrl && (
                        <a href={s.constanciaUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                          📄 Ver constancia de la STPS
                        </a>
                      )}
                      <span className="campo-ayuda">
                        Los links caducan en 15 minutos; recarga la página si ya no abren. Comprueba que el nombre de la
                        identificación coincida con el de la STPS y que la constancia corresponda a este RFC.
                      </span>
                    </div>

                    {rechazando === s.id ? (
                      <form className="admin-rechazo" onSubmit={(e) => rechazar(e, s)}>
                        <label htmlFor={`motivo-${s.id}`}>Motivo del rechazo (se le mostrará al usuario)</label>
                        <textarea
                          id={`motivo-${s.id}`}
                          required
                          maxLength={500}
                          value={motivo}
                          onChange={(e) => setMotivo(e.target.value)}
                          placeholder="Ej. La identificación no es legible o el nombre no coincide con el de la STPS"
                        />
                        <div className="verif-fila">
                          <button className="btn btn-primary btn-sm" disabled={procesando === s.id || !motivo.trim()}>
                            Confirmar rechazo
                          </button>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setRechazando(null); setMotivo('') }}>
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="verif-fila">
                        <button className="btn btn-primary btn-sm" onClick={() => aprobar(s)} disabled={procesando === s.id}>
                          ✓ Aprobar
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => setRechazando(s.id)} disabled={procesando === s.id}>
                          Rechazar
                        </button>
                      </div>
                    )}
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
