import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/client'
import usePageMeta from '../hooks/usePageMeta'
import StarRating from '../components/StarRating'
import InstructorDetailModal from '../components/InstructorDetailModal'

// Perfil público de una institución: sus instructores ordenados por calificación. La institución no se
// contrata directamente; se elige y contrata a uno de sus instructores.
export default function InstitucionDetalle() {
  const { id } = useParams()
  const [institucion, setInstitucion] = useState(null)
  const [estado, setEstado] = useState('cargando') // cargando | ok | noEncontrada
  const [seleccionado, setSeleccionado] = useState(null)

  usePageMeta({
    titulo: institucion ? institucion.razonSocial : 'Institución',
    descripcion: institucion
      ? `Instructores de capacitación de ${institucion.razonSocial} ordenados por calificación.`
      : undefined
  })

  useEffect(() => {
    setEstado('cargando')
    api
      .get(`/instituciones/${id}`)
      .then(({ data }) => {
        setInstitucion(data)
        setEstado('ok')
      })
      .catch(() => setEstado('noEncontrada'))
  }, [id])

  return (
    <div className="page">
      <div className="container">
        <Link to="/ranking" className="inst-volver">← Volver al ranking</Link>

        {estado === 'cargando' && <p className="loading">Cargando…</p>}
        {estado === 'noEncontrada' && (
          <div className="card"><div className="empty-state">Esta institución no existe o todavía no está verificada.</div></div>
        )}

        {estado === 'ok' && institucion && (
          <>
            <header className="inst-cabecera card">
              <div className="inst-logo inst-logo-grande" aria-hidden="true">
                {institucion.logoUrl ? <img src={institucion.logoUrl} alt="" /> : institucion.razonSocial.charAt(0)}
              </div>
              <div className="inst-cabecera-info">
                <span className="inst-etiqueta">Institución verificada ante la STPS</span>
                <h1>{institucion.razonSocial}</h1>
                <span className="inst-meta">{institucion.estado || 'Ubicación no indicada'}</span>
                {institucion.descripcion && <p>{institucion.descripcion}</p>}
              </div>
              <div className="inst-calificacion inst-calificacion-grande">
                {institucion.ratingPromedio > 0 ? (
                  <>
                    <strong>{institucion.ratingPromedio.toFixed(1)}</strong>
                    <StarRating rating={institucion.ratingPromedio} size={18} />
                    <span>Promedio de sus instructores · {institucion.totalEvaluaciones} evaluaciones</span>
                  </>
                ) : (
                  <span className="inst-sin-calif">Sus instructores aún no tienen evaluaciones</span>
                )}
              </div>
            </header>

            <h2 className="inst-subtitulo">Elige a un instructor</h2>
            <p className="inst-nota">
              Esta institución no se contrata directamente: elige al instructor que más te convenga. Están ordenados por su
              calificación.
            </p>

            {institucion.instructores.length === 0 ? (
              <div className="card"><div className="empty-state">Esta institución todavía no tiene instructores visibles.</div></div>
            ) : (
              <div className="inst-instructores">
                {institucion.instructores.map((ins, i) => (
                  <article className="card inst-instructor" key={ins.id}>
                    <span className="inst-posicion">{i + 1}</span>
                    <div className="inst-logo" aria-hidden="true">
                      {ins.profilePictureUrl ? <img src={ins.profilePictureUrl} alt="" loading="lazy" /> : ins.nombreCompleto.charAt(0)}
                    </div>
                    <div className="inst-info">
                      <strong>{ins.nombreCompleto}</strong>
                      <span className="inst-meta">{ins.estado || 'Ubicación no indicada'}</span>
                      {ins.especialidades?.length > 0 && (
                        <span className="inst-especialidades">{ins.especialidades.map((e) => e.nombre).join(' · ')}</span>
                      )}
                    </div>
                    <div className="inst-calificacion">
                      {ins.ratingPromedio > 0 ? (
                        <>
                          <StarRating rating={ins.ratingPromedio} size={15} />
                          <span>{Number(ins.ratingPromedio).toFixed(1)} · {ins.totalEvaluaciones} eval.</span>
                        </>
                      ) : (
                        <span className="inst-sin-calif">Sin evaluaciones aún</span>
                      )}
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => setSeleccionado(ins)}>
                      Ver detalle y contratar
                    </button>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {seleccionado && <InstructorDetailModal instructor={seleccionado} onClose={() => setSeleccionado(null)} />}
    </div>
  )
}
