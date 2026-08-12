import { useEffect, useState } from 'react'
import api, { apiErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import PrecioChips from './PrecioChips'

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
  const [contratarMsg, setContratarMsg] = useState({ type: '', text: '' })
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let activo = true
    setCargando(true)
    setContratarMsg({ type: '', text: '' })
    setContratarForm({ especialidadId: '', fechaCurso: '', numeroParticipantes: 5, descripcion: '' })

    api.get(`/instructores/${instructor.id}/especialidades-precios`)
      .then((res) => { if (activo) setPrecios(res.data) })
      .catch(() => { if (activo) setPrecios([]) })
      .finally(() => { if (activo) setCargando(false) })

    return () => { activo = false }
  }, [instructor.id])

  const conPrecio = precios.filter((p) => p.tienePrecio)
  const precioEspSeleccionada = conPrecio.find((p) => p.especialidadId === Number(contratarForm.especialidadId))
  const precioEstimado = calcularEstimado(precioEspSeleccionada, Number(contratarForm.numeroParticipantes) || 0)

  async function enviarContratacion(e) {
    e.preventDefault()
    setEnviando(true)
    setContratarMsg({ type: '', text: '' })
    try {
      await api.post('/transacciones', {
        instructorId: instructor.id,
        especialidadId: Number(contratarForm.especialidadId),
        fechaCurso: contratarForm.fechaCurso,
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
