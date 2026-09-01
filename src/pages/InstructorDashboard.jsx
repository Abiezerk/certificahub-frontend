import { useEffect, useState } from 'react'
import api, { apiErrorMessage } from '../api/client'
import PrecioChips from '../components/PrecioChips'

const TABS = ['Mi perfil', 'Próximos cursos', 'Especialidades y precios', 'Certificados']

const emptyRango = { min: '', max: '', precio: '' }

const ESTADOS_MEXICO = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Cdmx', 'Durango', 'Estado de México', 'Guanajuato', 'Guerrero',
  'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora',
  'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
]

export default function InstructorDashboard() {
  const [tab, setTab] = useState(TABS[0])
  const [transacciones, setTransacciones] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [misEspecialidades, setMisEspecialidades] = useState([])
  const [certificados, setCertificados] = useState([])
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [acordeonesAbiertos, setAcordeonesAbiertos] = useState({})
  const [descargandoZip, setDescargandoZip] = useState({})

  // --- Mi perfil ---
  const [perfil, setPerfil] = useState(null)
  const [perfilBio, setPerfilBio] = useState('')
  const [perfilEstado, setPerfilEstado] = useState('')
  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [fotoFile, setFotoFile] = useState(null)
  const [subiendoFoto, setSubiendoFoto] = useState(false)

  // Formulario de especialidad + precio
  const [editandoId, setEditandoId] = useState(null)
  const [formAbierto, setFormAbierto] = useState(false)
  const [nuevaEsp, setNuevaEsp] = useState('')
  const [codigoNOM, setCodigoNOM] = useState('')
  const [nombreOficialCurso, setNombreOficialCurso] = useState('')
  const [duracionHoras, setDuracionHoras] = useState('')
  const [usaParticipante, setUsaParticipante] = useState(true)
  const [usaGrupo, setUsaGrupo] = useState(false)
  const [precioParticipante, setPrecioParticipante] = useState('')
  const [rangosGrupo, setRangosGrupo] = useState([])
  const [guardando, setGuardando] = useState(false)

  const [qrTokens, setQrTokens] = useState({})
  const [certLoteForm, setCertLoteForm] = useState({ transaccionId: '', archivo: null })
  const [generandoLote, setGenerandoLote] = useState(false)

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

  async function cargarPerfil() {
    try {
      const { data } = await api.get('/instructores/mi-perfil')
      setPerfil(data)
      setPerfilBio(data.bio || '')
      setPerfilEstado(data.estado || '')
    } catch (err) {
      setMsg({ type: 'error', text: apiErrorMessage(err) })
    }
  }

  useEffect(() => {
    cargarTodo()
    cargarPerfil()
  }, [])

  function flash(type, text) {
    setMsg({ type, text })
    setTimeout(() => setMsg({ type: '', text: '' }), 4000)
  }

  async function guardarPerfil(e) {
    e.preventDefault()
    setGuardandoPerfil(true)
    try {
      await api.put('/instructores/mi-perfil', { bio: perfilBio, estado: perfilEstado })
      flash('success', 'Perfil actualizado')
      cargarPerfil()
    } catch (err) {
      flash('error', apiErrorMessage(err))
    } finally {
      setGuardandoPerfil(false)
    }
  }

  function handleFotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const extensionesPermitidas = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!extensionesPermitidas.includes(file.type)) {
      flash('error', 'Formato no permitido. Usa JPG, PNG o WEBP.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      flash('error', 'La imagen no puede pesar más de 5 MB')
      return
    }

    setFotoFile(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  async function subirFoto() {
    if (!fotoFile) return
    setSubiendoFoto(true)
    try {
      const formData = new FormData()
      formData.append('foto', fotoFile)
      const { data } = await api.post('/instructores/mi-perfil/foto', formData)
      setPerfil((prev) => ({ ...prev, profilePictureUrl: data.profilePictureUrl }))
      setFotoFile(null)
      setFotoPreview(null)
      flash('success', 'Foto de perfil actualizada')
    } catch (err) {
      flash('error', apiErrorMessage(err))
    } finally {
      setSubiendoFoto(false)
    }
  }

  const especialidadesDisponibles = especialidades.filter(
    (esp) => !misEspecialidades.some((m) => m.especialidadId === esp.id)
  )

  function agregarRango() {
    if (rangosGrupo.length >= 4) return
    setRangosGrupo([...rangosGrupo, { ...emptyRango }])
  }

  function actualizarRango(index, campo, valor) {
    setRangosGrupo(rangosGrupo.map((r, i) => (i === index ? { ...r, [campo]: valor } : r)))
  }

  function eliminarRango(index) {
    setRangosGrupo(rangosGrupo.filter((_, i) => i !== index))
  }

  function resetForm() {
    setEditandoId(null)
    setNuevaEsp('')
    setCodigoNOM('')
    setNombreOficialCurso('')
    setDuracionHoras('')
    setUsaParticipante(true)
    setUsaGrupo(false)
    setPrecioParticipante('')
    setRangosGrupo([])
  }

  async function eliminarEspecialidad(especialidadId, nombre) {
    const confirmado = window.confirm(`¿Eliminar "${nombre}" de tus especialidades? Se borrará también su precio configurado.`)
    if (!confirmado) return

    try {
      await api.delete(`/instructores/especialidad/${especialidadId}`)
      flash('success', 'Especialidad eliminada')
      if (editandoId === especialidadId) resetForm()
      cargarTodo()
    } catch (err) {
      flash('error', apiErrorMessage(err))
    }
  }

  function abrirEdicion(item) {
    setFormAbierto(true)
    setEditandoId(item.especialidadId)
    setNuevaEsp(String(item.especialidadId))
    setCodigoNOM(item.codigoNOM ?? '')
    setNombreOficialCurso(item.nombreOficialCurso ?? '')
    setDuracionHoras(item.duracionHoras ?? '')
    const tieneParticipante = item.precioPorParticipante != null
    const tieneGrupo = item.rango1Precio != null || item.rango2Precio != null || item.rango3Precio != null || item.rango4Precio != null
    setUsaParticipante(tieneParticipante || !tieneGrupo)
    setUsaGrupo(tieneGrupo)
    setPrecioParticipante(item.precioPorParticipante ?? '')
    const rangosCargados = []
    ;[
      [item.rango1Min, item.rango1Max, item.rango1Precio],
      [item.rango2Min, item.rango2Max, item.rango2Precio],
      [item.rango3Min, item.rango3Max, item.rango3Precio]
    ].forEach(([min, max, precio]) => {
      if (precio != null) rangosCargados.push({ min: min ?? '', max: max ?? '', precio })
    })
    if (item.rango4Precio != null) {
      rangosCargados.push({ min: item.rango4Min ?? '', max: '', precio: item.rango4Precio })
    }
    setRangosGrupo(rangosCargados)
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  async function guardarEspecialidadConPrecio(e) {
    e.preventDefault()
    if (!nuevaEsp) return
    if (!usaParticipante && !usaGrupo) {
      flash('error', 'Activa al menos un tipo de precio (por participante o por grupo)')
      return
    }
    if (usaGrupo) {
      if (rangosGrupo.length === 0) {
        flash('error', 'Agrega al menos un rango de precio por grupo')
        return
      }
      for (const r of rangosGrupo) {
        if (!r.min || !r.precio) {
          flash('error', 'Completa el mínimo y el precio de cada rango')
          return
        }
      }
      const sinMax = rangosGrupo.filter((r) => !r.max)
      const conMax = rangosGrupo.filter((r) => r.max)
      if (sinMax.length > 1) {
        flash('error', 'Solo puede haber un rango sin máximo (el más alto, ej. "20+")')
        return
      }
      if (conMax.length > 3) {
        flash('error', 'Máximo 3 rangos con límite superior, más 1 rango abierto')
        return
      }
    }
    setGuardando(true)
    try {
      const payload = {
        especialidadId: Number(nuevaEsp),
        codigoNOM: codigoNOM || null,
        nombreOficialCurso: nombreOficialCurso || null,
        duracionHoras: duracionHoras ? Number(duracionHoras) : null,
        usaParticipante,
        usaGrupo
      }
      if (usaParticipante) {
        payload.precioPorParticipante = Number(precioParticipante)
      }
      if (usaGrupo) {
        const sinMax = rangosGrupo.filter((r) => !r.max)
        const conMax = rangosGrupo.filter((r) => r.max)
        conMax.forEach((r, i) => {
          payload[`rango${i + 1}Min`] = Number(r.min)
          payload[`rango${i + 1}Max`] = Number(r.max)
          payload[`rango${i + 1}Precio`] = Number(r.precio)
        })
        if (sinMax.length === 1) {
          payload.rango4Min = Number(sinMax[0].min)
          payload.rango4Precio = Number(sinMax[0].precio)
        }
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

  async function descargarPlantillaExcel() {
    try {
      const response = await api.get('/certificados/plantilla-excel', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'Plantilla_Participantes_DC3.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      flash('error', apiErrorMessage(err, 'No se pudo descargar la plantilla'))
    }
  }

  function handleArchivoLote(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCertLoteForm({ ...certLoteForm, archivo: file })
  }

  async function generarCertificadosLote(e) {
    e.preventDefault()
    if (!certLoteForm.transaccionId) {
      flash('error', 'Selecciona el curso')
      return
    }
    if (!certLoteForm.archivo) {
      flash('error', 'Sube el Excel con los datos de los participantes')
      return
    }
    setGenerandoLote(true)
    try {
      const formData = new FormData()
      formData.append('transaccionId', certLoteForm.transaccionId)
      formData.append('archivo', certLoteForm.archivo)
      const { data } = await api.post('/certificados/generar-lote', formData)
      flash('success', data.message || 'Certificados generados')
      setCertLoteForm({ transaccionId: '', archivo: null })
      cargarTodo()
    } catch (err) {
      flash('error', apiErrorMessage(err, 'No se pudieron generar los certificados'))
    } finally {
      setGenerandoLote(false)
    }
  }

  // Funciones para acordeones de certificados
  function agruparCertificadosPorCurso(certs) {
    const agrupados = certs.reduce((acc, cert) => {
      const curso = cert.especialidadNombre
      if (!acc[curso]) {
        acc[curso] = []
      }
      acc[curso].push(cert)
      return acc
    }, {})

    // Calcular info por curso (fecha y empresa del primer cert)
    const resultado = {}
    for (const [curso, certsCurso] of Object.entries(agrupados)) {
      resultado[curso] = {
        certs: certsCurso,
        fechaCurso: certsCurso[0]?.fechaCurso,
        empresaNombre: certsCurso[0]?.empresaNombre,
        transaccionId: certsCurso[0]?.transaccionId // agregar transactionId para poder descargar ZIP
      }
    }
    return resultado
  }

  function toggleAcordeon(curso) {
    setAcordeonesAbiertos((prev) => ({
      ...prev,
      [curso]: !prev[curso]
    }))
  }

  async function descargarZipCurso(transaccionId, nombreCurso) {
    setDescargandoZip((prev) => ({ ...prev, [transaccionId]: true }))
    try {
      const response = await api.get(`/certificados/descargar-lote-zip/${transaccionId}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Certificados_${nombreCurso}.zip`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      flash('success', 'ZIP descargado correctamente')
    } catch (err) {
      flash('error', apiErrorMessage(err, 'No se pudo descargar el ZIP'))
    } finally {
      setDescargandoZip((prev) => ({ ...prev, [transaccionId]: false }))
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

        {tab === 'Mi perfil' && perfil && (
          <div className="card">
            <h3 className="section-title">Foto de perfil</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: '#eee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '2px solid #e0e0e0'
                }}
              >
                {fotoPreview || perfil.profilePictureUrl ? (
                  <img
                    src={fotoPreview || perfil.profilePictureUrl}
                    alt="Foto de perfil"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#999' }}>
                    {perfil.nombreCompleto?.charAt(0) || '?'}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', width: 'fit-content' }}>
                  Elegir imagen
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFotoChange} style={{ display: 'none' }} />
                </label>
                {fotoFile && (
                  <button className="btn btn-primary btn-sm" onClick={subirFoto} disabled={subiendoFoto}>
                    {subiendoFoto ? 'Subiendo…' : 'Guardar foto'}
                  </button>
                )}
                <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
                  JPG, PNG o WEBP. Máximo 5 MB.
                </span>
              </div>
            </div>

            <h3 className="section-title">Sobre ti</h3>
            <form onSubmit={guardarPerfil}>
              <div className="form-group">
                <label>Biografía</label>
                <textarea
                  rows={4}
                  placeholder="Cuéntale a las empresas sobre tu experiencia como instructor…"
                  value={perfilBio}
                  onChange={(e) => setPerfilBio(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Estado donde prestas tus servicios</label>
                <select value={perfilEstado} onChange={(e) => setPerfilEstado(e.target.value)}>
                  <option value="">Selecciona un estado…</option>
                  {ESTADOS_MEXICO.map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>

              <button className="btn btn-primary" disabled={guardandoPerfil}>
                {guardandoPerfil ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        )}

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
                        {(p.codigoNOM || p.nombreOficialCurso || p.duracionHoras) && (
                          <span className="row-sub">
                            {p.codigoNOM && <>{p.codigoNOM}</>}
                            {p.codigoNOM && p.nombreOficialCurso && ' · '}
                            {p.nombreOficialCurso && <>{p.nombreOficialCurso}</>}
                            {p.duracionHoras && <> · {p.duracionHoras}h</>}
                          </span>
                        )}
                        <div style={{ marginTop: 4 }}>
                          <PrecioChips p={p} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => abrirEdicion(p)}>
                          Editar precio
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ color: '#c0392b', borderColor: '#c0392b' }}
                          onClick={() => eliminarEspecialidad(p.especialidadId, p.especialidadNombre)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <button
                type="button"
                onClick={() => setFormAbierto(!formAbierto)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: formAbierto ? 16 : 0,
                  textAlign: 'left'
                }}
              >
                <h3 className="section-title" style={{ marginBottom: 0 }}>
                  {editandoId ? 'Editar precio' : 'Agregar especialidad con su precio'}
                </h3>
                <span
                  aria-hidden="true"
                  style={{
                    fontSize: '1.1rem',
                    color: 'var(--ink-soft)',
                    transition: 'transform 0.2s',
                    transform: formAbierto ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                >
                  ▾
                </span>
              </button>

              {formAbierto && (
                <>
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

                  <div className="form-group">
                    <label>Código NOM oficial</label>
                    <input
                      placeholder="Ej. NOM-009-STPS-2011"
                      value={codigoNOM}
                      onChange={(e) => setCodigoNOM(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Nombre oficial del curso (para el DC-3)</label>
                    <input
                      placeholder="Ej. CONDICIONES DE SEGURIDAD PARA REALIZAR TRABAJOS EN ALTURA"
                      value={nombreOficialCurso}
                      onChange={(e) => setNombreOficialCurso(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Duración en horas</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Ej. 8"
                      value={duracionHoras}
                      onChange={(e) => setDuracionHoras(e.target.value)}
                    />
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

                      {rangosGrupo.length === 0 && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: 10 }}>
                          Aún no agregaste ningún rango.
                        </p>
                      )}

                      {rangosGrupo.map((r, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr auto',
                            gap: 8,
                            marginBottom: 8,
                            alignItems: 'center'
                          }}
                        >
                          <input
                            type="number"
                            min="1"
                            placeholder="Mínimo"
                            value={r.min}
                            onChange={(e) => actualizarRango(i, 'min', e.target.value)}
                          />
                          <input
                            type="number"
                            min="1"
                            placeholder="Máximo (vacío = sin límite)"
                            value={r.max}
                            onChange={(e) => actualizarRango(i, 'max', e.target.value)}
                          />
                          <input
                            type="number"
                            min="1"
                            placeholder="Precio total"
                            value={r.precio}
                            onChange={(e) => actualizarRango(i, 'precio', e.target.value)}
                          />
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => eliminarRango(i)}
                            title="Eliminar rango"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                      {rangosGrupo.length < 4 && (
                        <button type="button" className="btn btn-outline btn-sm" onClick={agregarRango}>
                          + Agregar rango
                        </button>
                      )}

                      <p style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: 8 }}>
                        Deja el campo "Máximo" vacío para indicar "X o más participantes" (ej. 20+). Solo se
                        permite un rango sin máximo.
                      </p>
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
                </>
              )}
            </div>
          </>
        )}

        {tab === 'Certificados' && (
          <>
            <div className="card">
              <h3 className="section-title">Certificados DC-3 en lote</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', marginBottom: 16 }}>
                Descarga esta plantilla y pásasela a la empresa para que capture los datos de los
                participantes. Tú solo llenas los datos del curso (periodo, área temática y tu nombre
                como agente capacitador). Cuando la tengas lista, súbela para generar todos los DC-3
                automáticamente.
              </p>
              <button className="btn btn-outline" onClick={descargarPlantillaExcel}>
                Descargar plantilla de Excel
              </button>
            </div>

            <div className="card">
              <h3 className="section-title">Generar certificados en lote</h3>
              <form onSubmit={generarCertificadosLote}>
                <div className="form-group">
                  <label>Curso</label>
                  <select
                    required
                    value={certLoteForm.transaccionId}
                    onChange={(e) => setCertLoteForm({ ...certLoteForm, transaccionId: e.target.value })}
                  >
                    <option value="">Selecciona un curso…</option>
                    {transacciones.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.empresaNombre} · {t.especialidadNombre} ({new Date(t.fechaCurso).toLocaleDateString('es-MX')})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Excel con los datos de los participantes (ya lleno)</label>
                  <input type="file" accept=".xlsx" required onChange={handleArchivoLote} />
                </div>
                <button className="btn btn-primary" disabled={generandoLote}>
                  {generandoLote ? 'Generando…' : 'Generar certificados'}
                </button>
              </form>
            </div>

            <div className="card">
              <h3 className="section-title">Certificados generados</h3>
              {certificados.length === 0 ? (
                <div className="empty-state">Aún no has generado certificados.</div>
              ) : (
                <div>
                  {Object.entries(agruparCertificadosPorCurso(certificados)).map(([curso, datoCurso]) => (
                    <div key={curso} style={{ marginBottom: 16, border: '1px solid #e0e0e0', borderRadius: 6, overflow: 'hidden' }}>
                      {/* ACORDEÓN HEADER */}
                      <button
                        type="button"
                        onClick={() => toggleAcordeon(curso)}
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
                          <span className="row-title" style={{ marginBottom: 0, display: 'block' }}>{curso}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
                            {datoCurso.empresaNombre} · {new Date(datoCurso.fechaCurso).toLocaleDateString('es-MX')} · {datoCurso.certs.length} certificado{datoCurso.certs.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              descargarZipCurso(datoCurso.transaccionId, curso)
                            }}
                            disabled={descargandoZip[datoCurso.transaccionId]}
                          >
                            {descargandoZip[datoCurso.transaccionId] ? 'Descargando…' : '📥 ZIP'}
                          </button>
                          <span
                            aria-hidden="true"
                            style={{
                              fontSize: '1.1rem',
                              color: 'var(--ink-soft)',
                              transition: 'transform 0.2s',
                              transform: acordeonesAbiertos[curso] ? 'rotate(180deg)' : 'rotate(0deg)'
                            }}
                          >
                            ▾
                          </span>
                        </div>
                      </button>

                      {/* ACORDEÓN CONTENIDO */}
                      {acordeonesAbiertos[curso] && (
                        <div style={{ padding: '0 0 16px 0', borderTop: '1px solid #e0e0e0' }}>
                          <div className="row-list">
                            {datoCurso.certs.map((c) => (
                              <div className="row-item" key={c.id}>
                                <div className="row-main">
                                  <span className="row-title">{c.participanteNombre}</span>
                                  <span className="row-sub">{c.empresaNombre} · {new Date(c.fechaCurso).toLocaleDateString('es-MX')}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                  <span className="serial">{c.numeroSerie}</span>
                                  {c.archivoUrl ? (
                                    <a
                                      href={c.archivoUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="btn btn-outline btn-sm"
                                    >
                                      Descargar
                                    </a>
                                  ) : (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>Sin archivo</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
