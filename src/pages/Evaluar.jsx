import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api, { apiErrorMessage } from '../api/client'

export default function Evaluar() {
  const { token } = useParams()
  const [validando, setValidando] = useState(true)
  const [info, setInfo] = useState(null)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)

  const [rating, setRating] = useState(0)
  const [comentario, setComentario] = useState('')
  const [esDinamico, setEsDinamico] = useState(false)
  const [esFlexible, setEsFlexible] = useState(false)
  const [esTheorico, setEsTheorico] = useState(false)
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    api.get(`/evaluaciones/validar-qr/${token}`)
      .then(({ data }) => {
        if (data.esValido) {
          setInfo(data)
        } else {
          setError(data.mensaje)
        }
      })
      .catch((err) => setError(apiErrorMessage(err, 'No se pudo validar el QR')))
      .finally(() => setValidando(false))
  }, [token])

  async function enviarEvaluacion(e) {
    e.preventDefault()
    if (rating === 0) {
      setError('Selecciona una calificación')
      return
    }
    setEnviando(true)
    setError('')
    try {
      await api.post('/evaluaciones', {
        token,
        rating,
        comentario,
        esDinamico,
        esFlexible,
        esTheorico,
        participanteEmail: email || null
      })
      setEnviado(true)
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo registrar tu evaluación'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="page">
      <div className="evaluar-shell">
        {validando ? (
          <p style={{ color: 'var(--ink-soft)' }}>Validando código…</p>
        ) : enviado ? (
          <div className="card">
            <h1>¡Gracias por tu evaluación!</h1>
            <p style={{ color: 'var(--ink-soft)', marginTop: 8 }}>
              Tu opinión es anónima y ayuda a que otras empresas elijan mejor a sus instructores.
            </p>
          </div>
        ) : error ? (
          <div className="banner banner-error">{error}</div>
        ) : (
          <div className="card">
            <h1>Evalúa tu curso</h1>
            <p style={{ color: 'var(--ink-soft)', marginTop: 6, marginBottom: 20 }}>
              {info.especialidadNombre} con {info.instructorNombre} · {new Date(info.fechaCurso).toLocaleDateString('es-MX')}
            </p>

            {error && <div className="banner banner-error">{error}</div>}

            <form onSubmit={enviarEvaluacion}>
              <div className="form-group">
                <label>Calificación</label>
                <div className="star-input">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      className={n <= rating ? 'filled' : ''}
                      onClick={() => setRating(n)}
                      aria-label={`${n} estrellas`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Comentario (opcional)</label>
                <textarea
                  maxLength={255}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="¿Qué te pareció el curso?"
                />
              </div>

              <div className="form-group">
                <div className="checkbox-row">
                  <label>
                    <input type="checkbox" checked={esDinamico} onChange={(e) => setEsDinamico(e.target.checked)} />
                    Dinámico
                  </label>
                  <label>
                    <input type="checkbox" checked={esFlexible} onChange={(e) => setEsFlexible(e.target.checked)} />
                    Flexible
                  </label>
                  <label>
                    <input type="checkbox" checked={esTheorico} onChange={(e) => setEsTheorico(e.target.checked)} />
                    Teórico
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Correo (opcional, evita evaluaciones duplicadas)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <button className="btn btn-primary btn-block" disabled={enviando}>
                {enviando ? 'Enviando…' : 'Enviar evaluación'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
