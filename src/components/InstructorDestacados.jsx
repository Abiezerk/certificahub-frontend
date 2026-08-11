import { useEffect, useState } from 'react'
import api from '../api/client'
import InstructorCard from './InstructorCard'

export default function InstructorDestacados({ canContratar, onVerDetalle }) {
  const [destacados, setDestacados] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/instructores/destacados', { params: { limite: 8 } })
      .then((res) => setDestacados(res.data))
      .catch(() => setDestacados([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading || destacados.length === 0) return null

  return (
    <div className="container" style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Instructores destacados</h2>
      <div className="instructor-grid">
        {destacados.map((i) => (
          <InstructorCard key={i.id} instructor={i} canContratar={canContratar} onVerDetalle={onVerDetalle} />
        ))}
      </div>
    </div>
  )
}