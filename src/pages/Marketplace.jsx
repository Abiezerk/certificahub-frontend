import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { apiErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import InstructorCard from '../components/InstructorCard'
import PrecioChips from '../components/PrecioChips'

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

export default function Marketplace() {
  const { user } = useAuth()
  const [instructores, setInstructores] = useState([])
  const [preciosPorInstructor, setPreciosPorInstructor] = useState({})
  const [especialidades, setEspecialidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [especialidadId, setEspecialidadId] = useState('')
  const [ratingMinimo, setRatingMinimo] = useState('')

  const [detalle, setDetalle] = useState(null)
  const [contratarForm, setContratarForm] = useState({
    especialidadId: '',
    fechaCurso: '',
    numeroParticipantes: 5,
    descripcion: ''
  })
  const [contratarMsg, setContratarMsg] = useState({ type: '', text: '' })
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    api.get('/especialidades').then((res) => setEspecialidades(res.data)).catch(() => {})
  }, [])

  async function cargar() {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (especialidadId) params.especialidadId = especialidadId
      if (ratingMinimo) params.ratingMinimo = ratingMinimo
      const { data } = await api.get('/instructores/marketplace', { params })
      setInstructores(data)

      const entries = await Promise.all(
        data.map(async (i) => {
          try {
            const res = await api.get(`/instructores/${i.id}/especialidades-precios`)
            return [i.id, res.data]
          } catch {
            return [i.id, []]
          }
        })
      )
      setPreciosPorInstructor(Object.fromEntries(entries))
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo cargar el marketplace'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function abrirDetalle(instructor) {
    setDetalle(instructor)
    setContratarMsg({ type: '', text: '' })
    setContratarForm({ especialidadId: '', fechaCurso: '', numeroParticipantes: 5, descripcion: '' })
  }

  async function enviarContratacion(e) {
    e.preventDefault()
    setEnviando(true)
    setContratarMsg({ type: '', text: '' })
    try {
      await api.post('/transacciones', {
        instructorId: detalle.id,
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

  const esEmpresa = user?.userType === 'Empresa'
  const preciosDetalle = detalle ? preciosPorInstructor[detalle.id] || [] : []
  const conPrecio = preciosDetalle.filter((p) => p.tienePrecio)

  const precioEspSeleccionada = conPrecio.find((p) => p.especialidadId === Number(contratarForm.especialidadId))
  const precioEstimado = calcularEstimado(precioEspSeleccionada, Number(contratarForm.numeroParticipantes) || 0)

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-eyebrow">Plataforma para capacitación STPS</div>
          <h1>Contrata instructores con la confianza a la vista.</h1>
          <p>
            Cada instructor certificado con DC-5 muestra su medidor de confiabilidad real: qué tan seguido los
            participantes de sus cursos realmente evalúan, no solo un promedio bonito.
          </p>
          <div className="hero-actions">
            <a href="#marketplace" className="btn btn-primary">
              Buscar instructor
            </a>
            {!user && (
              <Link to="/registro" className="btn btn-outline">
                Ofrecer cursos como instructor
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="container" id="marketplace">
        <div className="filters-bar">
          <select value={especialidadId} onChange={(e) => setEspecialidadId(e.target.value)}>
            <option value="">Todas las especialidades</option>
            {especialidades.map((esp) => (
              <option key={esp.id} value={esp.id}>
                {esp.nombre}
              </option>
            ))}
          </select>
          <select value={ratingMinimo} onChange={(e) => setRatingMinimo(e.target.value)}>
            <option value="">Cualquier calificación</option>
            <option value="4">4+ estrellas</option>
            <option value="3">3+ estrellas</option>
          </select>
          <button className="btn btn-outline btn-sm" onClick={cargar}>
            Aplicar filtros
          </button>
        </div>

        {error && <div className="banner banner-error">{error}</div>}

        {loading ? (
          <p style={{ color: 'var(--ink-soft)' }}>Cargando instructores…</p>
        ) : instructores.length === 0 ? (
          <div className="empty-state">No hay instructores que coincidan con estos filtros todavía.</div>
        ) : (
          <div className="instructor-grid">
            {instructores.map((i) => (
              <InstructorCard key={i.id} instructor={i} canContratar={esEmpresa} onVerDetalle={abrirDetalle} />
            ))}
          </div>
        )}
      </div>

      {detalle && (
        <div className="modal-backdrop" onClick={() => setDetalle(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>{detalle.nombreCompleto}</h3>
                <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', marginTop: 4 }}>
                  {detalle.estado || 'Ubicación no indicada'} · {detalle.totalCursos} cursos impartidos
                </p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setDetalle(null)}>
                Cerrar
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', marginBottom: 16 }}>
              {detalle.bio || 'Este instructor aún no agregó una biografía.'}
            </p>

            <h4 style={{ fontSize: '0.85rem', marginBottom: 10 }}>Especialidades y precios</h4>
            {conPrecio.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: 20 }}>
                Este instructor todavía no configuró precios.
              </p>
            ) : (
              <div className="price-block-list" style={{ marginBottom: 20 }}>
                {conPrecio.map((p) => (
                  <div className="price-block" key={p.especialidadId}>
                    <div className="price-block-title">{p.especialidadNombre}</div>
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
      )}

      <footer className="site-footer">CertificaHub — capacitación empresarial con evaluaciones reales</footer>
    </>
  )
}
