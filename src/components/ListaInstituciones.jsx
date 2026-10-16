import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import StarRating from './StarRating'

// Ranking de instituciones (empresas capacitadoras). No se contratan directamente: al abrir una se
// ven sus instructores, ordenados por calificación, y se contrata a uno de ellos.
export default function ListaInstituciones() {
  const [instituciones, setInstituciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    api
      .get('/instituciones')
      .then(({ data }) => setInstituciones(data))
      .catch(() => setInstituciones([]))
      .finally(() => setCargando(false))
  }, [])

  const texto = busqueda.trim().toLowerCase()
  const visibles = texto
    ? instituciones.filter((i) => `${i.razonSocial} ${i.estado || ''}`.toLowerCase().includes(texto))
    : instituciones

  if (cargando) return <p className="loading">Cargando instituciones...</p>

  return (
    <div className="inst-lista">
      <p className="inst-nota">
        Las instituciones agrupan a sus instructores. No se contratan directamente: abre una institución y elige al
        instructor que más te convenga.
      </p>

      <input
        className="filtro-select inst-busqueda"
        placeholder="Buscar institución o estado…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar institución"
      />

      {visibles.length === 0 ? (
        <p className="no-resultados">
          {instituciones.length === 0 ? 'Todavía no hay instituciones registradas.' : 'Ninguna institución coincide con tu búsqueda.'}
        </p>
      ) : (
        <div className="inst-tarjetas">
          {visibles.map((i, indice) => (
            <Link to={`/instituciones/${i.id}`} className="inst-tarjeta" key={i.id}>
              <span className="inst-posicion">{indice + 1}</span>
              <div className="inst-logo" aria-hidden="true">
                {i.logoUrl ? <img src={i.logoUrl} alt="" loading="lazy" /> : i.razonSocial.charAt(0)}
              </div>
              <div className="inst-info">
                <strong>{i.razonSocial}</strong>
                <span className="inst-meta">
                  {i.estado || 'Ubicación no indicada'} · {i.totalInstructores}{' '}
                  {i.totalInstructores === 1 ? 'instructor' : 'instructores'}
                </span>
                {i.especialidades.length > 0 && (
                  <span className="inst-especialidades">{i.especialidades.slice(0, 4).join(' · ')}</span>
                )}
              </div>
              <div className="inst-calificacion">
                {i.ratingPromedio > 0 ? (
                  <>
                    <StarRating rating={i.ratingPromedio} size={15} />
                    <span>
                      {i.ratingPromedio.toFixed(1)} · {i.totalEvaluaciones}{' '}
                      {i.totalEvaluaciones === 1 ? 'evaluación' : 'evaluaciones'}
                    </span>
                  </>
                ) : (
                  <span className="inst-sin-calif">Sin evaluaciones aún</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
