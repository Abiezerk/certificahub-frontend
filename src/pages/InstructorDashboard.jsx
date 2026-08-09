import { useEffect, useState } from 'react'
import api, { apiErrorMessage } from '../api/client'
import PrecioChips from '../components/PrecioChips'

const TABS = ['Próximos cursos', 'Especialidades y precios', 'Certificados']

const RANGOS_VACIOS = { rango1Min: 1, rango1Max: 5, rango1Precio: '', rango2Min: 6, rango2Max: 10, rango2Precio: '', rango3Min: 11, rango3Max: 20, rango3Precio: '', rango4Min: 21, rango4Precio: '' }

export default function InstructorDashboard() {
  const [tab, setTab] = useState(TABS[0])
  const [transacciones, setTransacciones] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [misEspecialidades, setMisEspecialidades] = useState([])
  const [certificados, setCertificados] = useState([])
  const [msg, setMsg] = useState({ type: '', text: '' })

  // Formulario de especialidad + precio (sirve tanto para agregar como para editar)
  const [editandoId, setEditandoId] = useState(null) // null = agregando nueva; número = editando esa especialidadId
  const [nuevaEsp, setNuevaEsp] = useState('')
  const [usaParticipante, setUsaParticipante] = useState(true)
  const [usaGrupo, setUsaGrupo] = useState(false)
  const [precioParticipante, setPrecioParticipante] = useState('')
  const [rangos, setRangos] = useState(RANGOS_VACIOS)
  const [guardando, setGuardando] = useState(false)

  const [qrTokens, setQrTokens] = useState({})
  const [certForm, setCertForm] = useState({ transaccionId: '', participanteNombre: '' })

  async function cargarTodo() {
    try {
      const [t, e, mp, c] = await Promise.all([
        api.get('/transacciones/instructor/proximas'),
        api.get('/especialidades'),
        api.get('/instructores/mis-especialidades-precios'),
        api.get('/certificados/instructor')
      ])
      setTransacciones(t.data)
      setEspecialidades(e.data)
      setMisEspecialidades(mp.data)
      setCertificados(c.data)
    } catch (err) {
      setMsg({ type: 'error', text: apiErrorMessage(err) })
    }
  }

  useEffect(() => {
    cargarTodo()
  }, [])

  function flash(type, text) {
    setMsg({ type, text })
    setTimeout(() => setMsg({ type: '', text: '' }), 4000)
  }

  const especialidadesDisponibles = especialidades.filter(
    (esp) => !misEspecialidades.some((m) => m.especialidadId === esp.id)
  )

  function resetForm() {
    setEditandoId(null)
    setNuevaEsp('')
    setUsaParticipante(true)
    setUsaGrupo(false)
    setPrecioParticipante('')
    setRangos(RANGOS_VACIOS)
  }

  function abrirEdicion(item) {
    setEditandoId(item.especialidadId)
    setNuevaEsp(String(item.especialidadId))
    const tieneParticipante = item.precioPorParticipante != null
    const tieneGrupo = item.rango1Precio != null || item.rango2Precio != null || item.rango3Precio != null || item.rango4Precio != null
    setUsaParticipante(tieneParticipante || !tieneGrupo)
    setUsaGrupo(tieneGrupo)
    setPrecioParticipante(item.precioPorParticipante ?? '')
    setRangos({
      rango1Min: item.rango1Min ?? 1,
      rango1Max: item.rango1Max ?? 5,
      rango1Precio: item.rango1Precio ?? '',
      rango2Min: item.rango2Min ?? 6,
      rango2Max: item.rango2Max ?? 10,
      rango2Precio: item.rango2Precio ?? '',
      rango3Min: item.rango3Min ?? 11,
      rango3Max: item.rango3Max ?? 20,
      rango3Precio: item.rango3Precio ?? '',
      rango4Min: item.rango4Min ?? 21,
      rango4Precio: item.rango4Precio ?? ''
    })
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  async function guardarEspecialidadConPrecio(e) {
    e.preventDefault()
    if (!nuevaEsp) return
    if (!usaParticipante && !usaGrupo) {
      flash('error', 'Activa al menos un tipo de precio (por participante o por grupo)')
      return
    }
    setGuardando(true)
    try {
      const payload = { especialidadId: Number(nuevaEsp) }
      if (usaParticipante) {
        payload.precioPorParticipante = Number(precioParticipante)
      }
      if (usaGrupo) {
        payload.rango1Min = Number(rangos.rango1Min)
        payload.rango1Max = Number(rangos.rango1Max)
        payload.rango1Precio = Number(rangos.rango1Precio)
        payload.rango2Min = Number(rangos.rango2Min)
        payload.rango2Max = Number(rangos.rango2Max)
        payload.rango2Precio = Number(rangos.rango2Precio)
        payload.rango3Min = Number(rangos.rango3Min)
        payload.rango3Max = Number(rangos.rango3Max)
        payload.rango3Precio = Number(rangos.rango3Precio)
        payload.rango4Min = Number(rangos.rango4Min)
        payload.rango4Precio = Number(rangos.rango4Precio)
      }
      await api.post('/instructores/especialidad-completa', payload)
      flash('success', editandoId ? 'Precio actualizado' : 'Especialidad y precio guardados')
      resetForm()
      cargarTodo()
    } catch (err) {
      flash('error', apiErrorMessage(err))
    } finally {
      setGuardando(false)
    }
  }

  async function cambiarEstado(transaccionId, nuevoEstado) {
    try {
      await api.put(`/transacciones/${transaccionId}/estado`, { nuevoEstado })
      flash('success', `Curso actualizado a "${nuevoEstado}"`)
      cargarTodo()
    } catch (err) {
      flash('error', apiErrorMessage(err))
    }
  }

  async function generarQr(transaccionId) {
    try {
      const { data } = await api.post(`/examenes/generar-qr/${transaccionId}`)
      setQrTokens((prev) => ({ ...prev, [transaccionId]: data }))
    } catch (err) {
      flash('error', apiErrorMessage(err))
    }
  }

  async function generarCertificado(e) {
    e.preventDefault()
    try {
      await api.post(`/certificados/generar/${certForm.transaccionId}`, {
        participanteNombre: certForm.participanteNombre
      })
      flash('success', 'Certificado DC-3 generado')
      setCertForm({ transaccionId: '', participanteNombre: '' })
      cargarTodo()
    } catch (err) {
      flash('error', apiErrorMessage(err))
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="dashboard-head">
          <div>
            <h1>Panel de instructor</h1>
            <p>Administra tus cursos, genera el QR de evaluación y tus certificados DC-3.</p>
          </div>
        </div>

        {msg.text && <div className={`banner ${msg.type === 'error' ? 'banner-error' : 'banner-success'}`}>{msg.text}</div>}

        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'Próximos cursos' && (
          <div className="card">
            {transacciones.length === 0 ? (
              <div className="empty-state">
                Todavía no tienes cursos contratados. Cuando una empresa te contrate, aparecerán aquí.
              </div>
            ) : (
              <div className="row-list">
                {transacciones.map((t) => (
                  <div className="row-item" key={t.id}>
                    <div className="row-main">
                      <span className="row-title">{t.empresaNombre} · {t.especialidadNombre}</span>
                      <span className="row-sub">
                        {new Date(t.fechaCurso).toLocaleDateString('es-MX')} · {t.numeroParticipantes} participantes · $
                        {t.precioTotal.toLocaleString('es-MX')}
                      </span>
                      {qrTokens[t.id] && (
                        <div className="token-box">
                          Token QR: {qrTokens[t.id].token}
                          <br />
                          Válido: {new Date(qrTokens[t.id].fechaValidez).toLocaleDateString('es-MX')}
                        </div>
                      )}
                    </div>
                    <div className="row-actions">
                      <span className={`status-pill status-${t.estado.toLowerCase()}`}>{t.estado}</span>
                      <select defaultValue="" onChange={(e) => e.target.value && cambiarEstado(t.id, e.target.value)}>
                        <option value="">Cambiar estado…</option>
                        <option value="Confirmada">Confirmar</option>
                        <option value="EnCurso">Marcar en curso</option>
                        <option value="Completada">Marcar completada</option>
                        <option value="Cancelada">Cancelar</option>
                      </select>
                      <button className="btn btn-outline btn-sm" onClick={() => generarQr(t.id)}>
                        Generar QR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'Especialidades y precios' && (
          <>
            <div className="card">
              <h3 className="section-title">Tus especialidades</h3>
              {misEspecialidades.length === 0 ? (
                <div className="empty-state">Aún no has agregado ninguna especialidad.</div>
              ) : (
                <div className="row-list">
                  {misEspecialidades.map((p) => (
                    <div className="row-item" key={p.especialidadId}>
                      <div className="row-main">
                        <span className="row-title">{p.especialidadNombre}</span>
                        <div style={{ marginTop: 4 }}>
                          <PrecioChips p={p} />
                        </div>
                      </div>
                      <button className="btn btn-outline btn-sm" onClick={() => abrirEdicion(p)}>
                        Editar precio
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="section-title">
                {editandoId ? 'Editar precio' : 'Agregar especialidad con su precio'}
              </h3>

              {!editandoId && especialidadesDisponibles.length === 0 ? (
                <p style={{ color: 'var(--ink-soft)', fontSize: '0.88rem' }}>
                  Ya agregaste todas las especialidades disponibles.
                </p>
              ) : (
                <form onSubmit={guardarEspecialidadConPrecio}>
                  <div className="form-group">
                    <label>Especialidad</label>
                    {editandoId ? (
                      <p style={{ fontWeight: 600 }}>
                        {especialidades.find((e) => e.id === editandoId)?.nombre}
                      </p>
                    ) : (
                      <select required value={nuevaEsp} onChange={(e) => setNuevaEsp(e.target.value)}>
                        <option value="">Selecciona…</option>
                        {especialidadesDisponibles.map((e) => (
                          <option key={e.id} value={e.id}>{e.nombre}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="checkbox-row" style={{ marginBottom: 16 }}>
                    <label>
                      <input type="checkbox" checked={usaParticipante} onChange={(e) => setUsaParticipante(e.target.checked)} />
                      Precio por participante
                    </label>
                    <label>
                      <input type="checkbox" checked={usaGrupo} onChange={(e) => setUsaGrupo(e.target.checked)} />
                      Precio por grupo
                    </label>
                  </div>

                  {usaParticipante && (
                    <div className="form-group">
                      <label>Precio por participante (MXN)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={precioParticipante}
                        onChange={(e) => setPrecioParticipante(e.target.value)}
                      />
                    </div>
                  )}

                  {usaGrupo && (
                    <div className="form-group">
                      <label>Rangos de grupo (participantes → precio total, MXN)</label>
                      <div className="form-row" style={{ marginBottom: 8 }}>
                        <input type="number" placeholder="Min" value={rangos.rango1Min}
                          onChange={(e) => setRangos({ ...rangos, rango1Min: e.target.value })} />
                        <input type="number" placeholder="Max" value={rangos.rango1Max}
                          onChange={(e) => setRangos({ ...rangos, rango1Max: e.target.value })} />
                        <input type="number" placeholder="Precio" required value={rangos.rango1Precio}
                          onChange={(e) => setRangos({ ...rangos, rango1Precio: e.target.value })} />
                      </div>
                      <div className="form-row" style={{ marginBottom: 8 }}>
                        <input type="number" placeholder="Min" value={rangos.rango2Min}
                          onChange={(e) => setRangos({ ...rangos, rango2Min: e.target.value })} />
                        <input type="number" placeholder="Max" value={rangos.rango2Max}
                          onChange={(e) => setRangos({ ...rangos, rango2Max: e.target.value })} />
                        <input type="number" placeholder="Precio" required value={rangos.rango2Precio}
                          onChange={(e) => setRangos({ ...rangos, rango2Precio: e.target.value })} />
                      </div>
                      <div className="form-row" style={{ marginBottom: 8 }}>
                        <input type="number" placeholder="Min" value={rangos.rango3Min}
                          onChange={(e) => setRangos({ ...rangos, rango3Min: e.target.value })} />
                        <input type="number" placeholder="Max" value={rangos.rango3Max}
                          onChange={(e) => setRangos({ ...rangos, rango3Max: e.target.value })} />
                        <input type="number" placeholder="Precio" required value={rangos.rango3Precio}
                          onChange={(e) => setRangos({ ...rangos, rango3Precio: e.target.value })} />
                      </div>
                      <div className="form-row">
                        <input type="number" placeholder="Desde (21+)" value={rangos.rango4Min}
                          onChange={(e) => setRangos({ ...rangos, rango4Min: e.target.value })} />
                        <input type="number" placeholder="Precio" required value={rangos.rango4Precio}
                          onChange={(e) => setRangos({ ...rangos, rango4Precio: e.target.value })} />
                        <span />
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" disabled={guardando}>
                      {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Agregar especialidad'}
                    </button>
                    {editandoId && (
                      <button type="button" className="btn btn-ghost" onClick={resetForm}>
                        Cancelar edición
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </>
        )}

        {tab === 'Certificados' && (
          <>
            <div className="card">
              <h3 className="section-title">Generar certificado DC-3</h3>
              <form onSubmit={generarCertificado} className="form-row" style={{ alignItems: 'end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Curso</label>
                  <select
                    required
                    value={certForm.transaccionId}
                    onChange={(e) => setCertForm({ ...certForm, transaccionId: e.target.value })}
                  >
                    <option value="">Selecciona un curso…</option>
                    {transacciones.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.empresaNombre} · {t.especialidadNombre} ({new Date(t.fechaCurso).toLocaleDateString('es-MX')})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Nombre del participante</label>
                  <input
                    required
                    value={certForm.participanteNombre}
                    onChange={(e) => setCertForm({ ...certForm, participanteNombre: e.target.value })}
                  />
                </div>
                <button className="btn btn-primary">Generar DC-3</button>
              </form>
            </div>

            <div className="card">
              {certificados.length === 0 ? (
                <div className="empty-state">Aún no has generado certificados.</div>
              ) : (
                <div className="row-list">
                  {certificados.map((c) => (
                    <div className="row-item" key={c.id}>
                      <div className="row-main">
                        <span className="row-title">{c.participanteNombre} · {c.especialidadNombre}</span>
                        <span className="row-sub">{c.empresaNombre} · {new Date(c.fechaCurso).toLocaleDateString('es-MX')}</span>
                      </div>
                      <span className="serial">{c.numeroSerie}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
