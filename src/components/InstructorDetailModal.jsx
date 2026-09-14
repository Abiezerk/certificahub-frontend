import { useEffect, useState } from 'react'
import api, { apiErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import PrecioChips from './PrecioChips'

function soloDigitos(valor) {
  return valor.replace(/[^0-9]/g, '')
}

function sanitizarEntero(valor, min, max) {
  const limpio = soloDigitos(String(valor))
  if (limpio === '') return ''
  const n = Math.min(max, Math.max(min, parseInt(limpio, 10)))
  return String(n)
}

// Combina fecha (YYYY-MM-DD) + hora en formato 12h a un DateTime ISO (sin zona) para el backend.
// Valida estrictamente cada componente; regresa null si algo no es un valor esperado.
function construirFechaHoraISO(fechaCurso, hora, minuto, ampm) {
  if (!fechaCurso || !/^\d{4}-\d{2}-\d{2}$/.test(fechaCurso)) return null

  const h = parseInt(hora, 10)
  const m = parseInt(minuto, 10)
  if (!Number.isInteger(h) || h < 1 || h > 12) return null
  if (!Number.isInteger(m) || m < 0 || m > 59) return null
  if (ampm !== 'AM' && ampm !== 'PM') return null

  let hora24 = h % 12
  if (ampm === 'PM') hora24 += 12

  const hh = String(hora24).padStart(2, '0')
  const mm = String(m).padStart(2, '0')
  return `${fechaCurso}T${hh}:${mm}:00`
}

function calcularEstimado(precioEsp, participantes) {
  if (!precioEsp || !participantes) return null
  const tramos = [
    [precioEsp.rango1Min, precioEsp.rango1Max, precioEsp.rango1Precio],
    [precioEsp.rango2Min, precioEsp.rango2Max, precioEsp.rango2Precio],
    [precioEsp.rango3Min, precioEsp.rango3Max, precioEsp.rango3Precio]
  ]
  const match = tramos.find(([min, max]) => min != null && max != null && participantes >= min && participantes <= max)
  if (match && match[2] != null) return Number(match[2])
  if (precioEsp.rango4Min != null && participantes >= precioEsp.rango4Min && precioEsp.rango4Precio != null) {
    return Number(precioEsp.rango4Precio)
  }
  if (precioEsp.precioPorParticipante != null) {
    return Number(precioEsp.precioPorParticipante) * participantes
  }
  return null
}

export default function InstructorDetailModal({ instructor, onClose }) {
  const { user } = useAuth()
  const esEmpresa = user?.userType === 'Empresa'

  const [precios, setPrecios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [contratarForm, setContratarForm] = useState({
    especialidadId: '',
    fechaCurso: '',
    numeroParticipantes: 5,
    descripcion: ''
  })
  const [horaForm, setHoraForm] = useState({ hora: '', minuto: '', ampm: 'AM' })
  const [contratarMsg, setContratarMsg] = useState({ type: '', text: '' })
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let activo = true
    setCargando(true)
    setContratarMsg({ type: '', text: '' })
    setContratarForm({ especialidadId: '', fechaCurso: '', numeroParticipantes: 5, descripcion: '' })
    setHoraForm({ hora: '', minuto: '', ampm: 'AM' })

    api.get(`/instructores/${instructor.id}/especialidades-precios`)
      .then((res) => { if (activo) setPrecios(res.data) })
      .catch(() => { if (activo) setPrecios([]) })
      .finally(() => { if (activo) setCargando(false) })

    return () => { activo = false }
  }, [instructor.id])

  const conPrecio = precios.filter((p) => p.tienePrecio)
  const precioEspSeleccionada = conPrecio.find((p) => p.especialidadId === Number(contratarForm.especialidadId))
  const precioEstimado = calcularEstimado(precioEspSeleccionada, Number(contratarForm.numeroParticipantes) || 0)

  function handleHoraChange(e) {
    setHoraForm({ ...horaForm, hora: sanitizarEntero(e.target.value, 1, 12) })
  }

  function handleMinutoChange(e) {
    const limpio = sanitizarEntero(e.target.value, 0, 59)
    setHoraForm({ ...horaForm, minuto: limpio === '' ? '' : limpio.padStart(2, '0') })
  }

  async function enviarContratacion(e) {
    e.preventDefault()
    setContratarMsg({ type: '', text: '' })

    const fechaHoraISO = construirFechaHoraISO(
      contratarForm.fechaCurso,
      horaForm.hora,
      horaForm.minuto,
      horaForm.ampm
    )
    if (!fechaHoraISO) {
      setContratarMsg({ type: 'error', text: 'Indica una fecha y una hora válidas (hora 1-12, minutos 0-59, AM o PM).' })
      return
    }

    setEnviando(true)
    try {
      await api.post('/transacciones', {
        instructorId: instructor.id,
        especialidadId: Number(contratarForm.especialidadId),
        fechaCurso: fechaHoraISO,
        numeroParticipantes: Number(contratarForm.numeroParticipantes),
        descripcion: contratarForm.descripcion
      })
      setContratarMsg({ type: 'success', text: 'Curso contratado. Revisa "Mi panel" para darle seguimiento.' })
    } catch (err) {
      setContratarMsg({ type: 'error', text: apiErrorMessage(err, 'No se pudo crear la contratación') })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>{instructor.nombreCompleto}</h3>
            <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', marginTop: 4 }}>
              {instructor.estado || 'Ubicación no indicada'} · {instructor.totalCursos} cursos impartidos
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', marginBottom: 16 }}>
          {instructor.bio || 'Este instructor aún no agregó una biografía.'}
        </p>

        <h4 style={{ fontSize: '0.85rem', marginBottom: 10 }}>Especialidades y precios</h4>
        {cargando ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: 20 }}>Cargando…</p>
        ) : conPrecio.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: 20 }}>
            Este instructor todavía no configuró precios.
          </p>
        ) : (
          <div className="price-block-list" style={{ marginBottom: 20 }}>
            {conPrecio.map((p) => (
              <div className="price-block" key={p.especialidadId}>
                <div className="price-block-title">
                  {p.codigoNOM && (
                    <span
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        color: 'var(--seal-dark)',
                        fontWeight: 600,
                        marginBottom: 2
                      }}
                    >
                      {p.codigoNOM}
                    </span>
                  )}
                  {p.especialidadNombre}
                </div>
                <PrecioChips p={p} />
              </div>
            ))}
          </div>
        )}

        {esEmpresa && conPrecio.length > 0 && (
          <>
            {contratarMsg.text && (
              <div className={`banner ${contratarMsg.type === 'error' ? 'banner-error' : 'banner-success'}`}>
                {contratarMsg.text}
              </div>
            )}

            <form onSubmit={enviarContratacion}>
              <div className="form-group">
                <label>Especialidad a contratar</label>
                <select
                  required
                  value={contratarForm.especialidadId}
                  onChange={(e) => setContratarForm({ ...contratarForm, especialidadId: e.target.value })}
                >
                  <option value="">Selecciona una especialidad</option>
                  {conPrecio.map((p) => (
                    <option key={p.especialidadId} value={p.especialidadId}>
                      {p.especialidadNombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha del curso</label>
                  <input
                    type="date"
                    required
                    value={contratarForm.fechaCurso}
                    onChange={(e) => setContratarForm({ ...contratarForm, fechaCurso: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Participantes</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={contratarForm.numeroParticipantes}
                    onChange={(e) => setContratarForm({ ...contratarForm, numeroParticipantes: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Hora del curso</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="12"
                    placeholder="HH"
                    required
                    value={horaForm.hora}
                    onChange={handleHoraChange}
                    style={{ width: 64, textAlign: 'center' }}
                    aria-label="Hora"
                  />
                  <span style={{ fontWeight: 700 }}>:</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="59"
                    placeholder="MM"
                    required
                    value={horaForm.minuto}
                    onChange={handleMinutoChange}
                    style={{ width: 64, textAlign: 'center' }}
                    aria-label="Minutos"
                  />
                  <div style={{ display: 'flex', gap: 4, marginLeft: 4 }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${horaForm.ampm === 'AM' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setHoraForm({ ...horaForm, ampm: 'AM' })}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${horaForm.ampm === 'PM' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setHoraForm({ ...horaForm, ampm: 'PM' })}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>

              {precioEstimado !== null && (
                <div className="banner banner-success" style={{ fontWeight: 600 }}>
                  Total estimado: ${precioEstimado.toLocaleString('es-MX')}
                </div>
              )}

              <div className="form-group">
                <label>Descripción (opcional)</label>
                <textarea
                  value={contratarForm.descripcion}
                  onChange={(e) => setContratarForm({ ...contratarForm, descripcion: e.target.value })}
                  placeholder="Notas para el instructor sobre el curso"
                />
              </div>
              <button className="btn btn-primary btn-block" disabled={enviando}>
                {enviando ? 'Enviando…' : 'Confirmar contratación'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
