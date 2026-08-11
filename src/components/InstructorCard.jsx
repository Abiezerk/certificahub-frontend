import Gauge from './Gauge'
import PremiumBadge from './PremiumBadge'

export default function InstructorCard({ instructor, onVerDetalle, canContratar }) {
  const verificado = instructor.verificationStatus === 'Verificado'

  return (
    <div className="instructor-card">
      <div className="instructor-card-head">
        <div>
          <div className="instructor-name">
            {instructor.nombreCompleto}
            {instructor.esPremium && <PremiumBadge />}
          </div>
          <div className="instructor-meta">
            {instructor.estado || 'Ubicación no indicada'} · {instructor.totalCursos} cursos impartidos
          </div>
        </div>
        <div className={`stamp ${verificado ? '' : 'pending'}`}>
          {verificado ? 'DC-5\nVerificado' : 'DC-5\nPendiente'}
        </div>
      </div>

      <div className="instructor-footer">
        <div
          style={{
            width: 48,
            height: 48,
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
          {instructor.profilePictureUrl ? (
            <img
              src={instructor.profilePictureUrl}
              alt={instructor.nombreCompleto}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: 17, fontWeight: 700, color: '#999' }}>
              {instructor.nombreCompleto?.charAt(0) || '?'}
            </span>
          )}
        </div>

        <Gauge
          rating={instructor.ratingPromedio}
          nivelConfiabilidad={instructor.nivelConfiabilidad}
          tasaEvaluacion={instructor.tasaEvaluacion}
          size={54}
        />

        <button className="btn btn-outline btn-sm" onClick={() => onVerDetalle(instructor)}>
          {canContratar ? 'Ver y contratar' : 'Ver detalle'}
        </button>
      </div>
    </div>
  )
}
