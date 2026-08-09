import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { apiErrorMessage } from '../api/client'

const TABS = ['Mis cursos contratados', 'Certificados recibidos']

export default function EmpresaDashboard() {
  const [tab, setTab] = useState(TABS[0])
  const [transacciones, setTransacciones] = useState([])
  const [certificados, setCertificados] = useState([])
  const [msg, setMsg] = useState({ type: '', text: '' })

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

  async function eliminarTransaccion(id) {
    try {
      await api.delete(`/transacciones/${id}`)
      cargarTodo()
    } catch (err) {
      setMsg({ type: 'error', text: apiErrorMessage(err) })
    }
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
              <div className="row-list">
                {transacciones.map((t) => (
                  <div className="row-item" key={t.id}>
                    <div className="row-main">
                      <span className="row-title">{t.instructorNombre} · {t.especialidadNombre}</span>
                      <span className="row-sub">
                        {new Date(t.fechaCurso).toLocaleDateString('es-MX')} · {t.numeroParticipantes} participantes · $
                        {t.precioTotal.toLocaleString('es-MX')}
                      </span>
                    </div>
                    <div className="row-actions">
                      <span className={`status-pill status-${t.estado.toLowerCase()}`}>{t.estado}</span>
                      {t.estado === 'Pendiente' && (
                        <>
                          <button className="btn btn-outline btn-sm" onClick={() => cambiarEstado(t.id, 'Confirmada')}>
                            Confirmar
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => cambiarEstado(t.id, 'Cancelada')}>
                            Cancelar
                          </button>
                        </>
                      )}
                      {t.estado === 'Cancelada' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => eliminarTransaccion(t.id)}>
                          Eliminar registro
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'Certificados recibidos' && (
          <div className="card">
            {certificados.length === 0 ? (
              <div className="empty-state">Todavía no tienes certificados. Se generan una vez que el curso concluye.</div>
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
