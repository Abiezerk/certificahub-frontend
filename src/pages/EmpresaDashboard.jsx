import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { apiErrorMessage } from '../api/client'

const TABS = ['Mis cursos contratados', 'Certificados recibidos']

export default function EmpresaDashboard() {
  const [tab, setTab] = useState(TABS[0])
  const [transacciones, setTransacciones] = useState([])
  const [certificados, setCertificados] = useState([])
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [acordeonesAbiertos, setAcordeonesAbiertos] = useState({})
  const [mostrarOcultos, setMostrarOcultos] = useState(false)
  const [ocultando, setOcultando] = useState({})

  async function cargarTodo() {
    try {
      const [t, c] = await Promise.all([
        api.get('/transacciones/mis-transacciones'),
        api.get('/certificados/empresa')
      ])
      setTransacciones(t.data)
      setCertificados(c.data)
    } catch (err) {
      setMsg({ type: 'error', text: apiErrorMessage(err) })
    }
  }

  useEffect(() => {
    cargarTodo()
  }, [])

  async function cambiarEstado(id, nuevoEstado) {
    try {
      await api.put(`/transacciones/${id}/estado`, { nuevoEstado })
      cargarTodo()
    } catch (err) {
      setMsg({ type: 'error', text: apiErrorMessage(err) })
    }
  }

  // La empresa solo puede cancelar (nunca confirmar/marcar en curso/completar — eso lo decide el
  // instructor), y solo mientras falten más de 24 horas para el inicio del curso.
  function puedeCancelar(t) {
    if (t.estado !== 'Pendiente' && t.estado !== 'Confirmada') return false
    const horasParaElCurso = (new Date(t.fechaCurso) - new Date()) / (1000 * 60 * 60)
    return horasParaElCurso > 24
  }

  async function eliminarTransaccion(id) {
    try {
      await api.delete(`/transacciones/${id}`)
      cargarTodo()
    } catch (err) {
      setMsg({ type: 'error', text: apiErrorMessage(err) })
    }
  }

  async function ocultarTransaccion(id, oculto) {
    setOcultando((prev) => ({ ...prev, [id]: true }))
    try {
      await api.put(`/transacciones/${id}/visibilidad`, { oculto })
      cargarTodo()
    } catch (err) {
      setMsg({ type: 'error', text: apiErrorMessage(err) })
    } finally {
      setOcultando((prev) => ({ ...prev, [id]: false }))
    }
  }

  function toggleAcordeon(id) {
    setAcordeonesAbiertos((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function certificadosDeCurso(transaccionId) {
    return certificados.filter((c) => c.transaccionId === transaccionId)
  }

  const visibles = transacciones.filter((t) => !t.ocultoParaEmpresa)
  const ocultos = transacciones.filter((t) => t.ocultoParaEmpresa)

  function renderCurso(t) {
    const certsDelCurso = certificadosDeCurso(t.id)
    return (
      <div key={t.id} style={{ marginBottom: 16, border: '1px solid #e0e0e0', borderRadius: 6, overflow: 'hidden' }}>
        {/* ACORDEÓN HEADER */}
        <button
          type="button"
          onClick={() => toggleAcordeon(t.id)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '12px 16px',
            textAlign: 'left',
            backgroundColor: '#f5f5f5',
            borderRadius: 0
          }}
        >
          <div style={{ flex: 1 }}>
            <span className="row-title" style={{ marginBottom: 0, display: 'block' }}>
              {t.instructorNombre} · {t.especialidadNombre}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
              {new Date(t.fechaCurso).toLocaleDateString('es-MX')} · {t.numeroParticipantes} participantes · $
              {t.precioTotal.toLocaleString('es-MX')}
              {certsDelCurso.length > 0 && ` · ${certsDelCurso.length} certificado${certsDelCurso.length !== 1 ? 's' : ''}`}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
            <span className={`status-pill status-${t.estado.toLowerCase()}`}>{t.estado}</span>
            {puedeCancelar(t) ? (
              <button className="btn btn-ghost btn-sm" onClick={() => cambiarEstado(t.id, 'Cancelada')}>
                Cancelar
              </button>
            ) : (t.estado === 'Pendiente' || t.estado === 'Confirmada') && (
              <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
                Ya no se puede cancelar (falta menos de 24h)
              </span>
            )}
            {t.estado === 'Cancelada' && (
              t.tieneCertificados ? (
                <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }} title="Este curso tiene certificados en su historial (aunque ya hayan sido eliminados) y no se puede borrar">
                  No se puede eliminar (tiene certificados)
                </span>
              ) : (
                <button className="btn btn-ghost btn-sm" onClick={() => eliminarTransaccion(t.id)}>
                  Eliminar registro
                </button>
              )
            )}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => ocultarTransaccion(t.id, !t.ocultoParaEmpresa)}
              disabled={ocultando[t.id]}
            >
              {ocultando[t.id] ? '…' : t.ocultoParaEmpresa ? 'Mostrar' : 'Ocultar'}
            </button>
            <span
              aria-hidden="true"
              style={{
                fontSize: '1.1rem',
                color: 'var(--ink-soft)',
                transition: 'transform 0.2s',
                transform: acordeonesAbiertos[t.id] ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            >
              ▾
            </span>
          </div>
        </button>

        {/* ACORDEÓN CONTENIDO */}
        {acordeonesAbiertos[t.id] && (
          <div style={{ padding: '12px 16px 16px' }}>
            {certsDelCurso.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', margin: 0 }}>
                El instructor todavía no ha enviado los certificados de este curso.
              </p>
            ) : (
              <div className="row-list">
                {certsDelCurso.map((c) => (
                  <div className="row-item" key={c.id}>
                    <div className="row-main">
                      <span className="row-title">{c.participanteNombre}</span>
                      <span className="row-sub">{c.numeroSerie}</span>
                    </div>
                    {c.archivoUrl ? (
                      <a href={c.archivoUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                        Descargar
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>Sin archivo</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div className="dashboard-head">
          <div>
            <h1>Panel de empresa</h1>
            <p>Da seguimiento a los cursos que contrataste y descarga los certificados de tus colaboradores.</p>
          </div>
          <Link to="/" className="btn btn-primary">Buscar más instructores</Link>
        </div>

        {msg.text && <div className="banner banner-error">{msg.text}</div>}

        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'Mis cursos contratados' && (
          <div className="card">
            {transacciones.length === 0 ? (
              <div className="empty-state">
                Aún no has contratado cursos. <Link to="/">Busca un instructor</Link> para empezar.
              </div>
            ) : (
              <div>
                {visibles.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
                    No tienes cursos visibles. Todos están ocultos.
                  </p>
                ) : (
                  visibles.map(renderCurso)
                )}

                {ocultos.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setMostrarOcultos((v) => !v)}
                    >
                      {mostrarOcultos ? 'Ocultar' : 'Ver'} ocultos ({ocultos.length})
                    </button>
                    {mostrarOcultos && <div style={{ marginTop: 12 }}>{ocultos.map(renderCurso)}</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'Certificados recibidos' && (
          <div className="card">
            {certificados.length === 0 ? (
              <div className="empty-state">Todavía no tienes certificados. El instructor los envía una vez generados.</div>
            ) : (
              <div className="row-list">
                {certificados.map((c) => (
                  <div className="row-item" key={c.id}>
                    <div className="row-main">
                      <span className="row-title">{c.participanteNombre} · {c.especialidadNombre}</span>
                      <span className="row-sub">
                        {c.instructorNombre} · {new Date(c.fechaCurso).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                    <span className="serial">{c.numeroSerie}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
