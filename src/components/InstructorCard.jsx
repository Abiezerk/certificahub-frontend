import Gauge from './Gauge'

export default function InstructorCard({ instructor, onVerDetalle, canContratar }) {
  const verificado = instructor.verificationStatus === 'Verificado'

  return (
    <div className="instructor-card">
      <div className="instructor-card-head">
        <div>
          <div className="instructor-name">{instructor.nombreCompleto}</div>
          <div className="instructor-meta">
            {instructor.estado || 'Ubicación no indicada'} · {instructor.totalCursos} cursos impartidos
          </div>
        </div>
        <div className={`stamp ${verificado ? '' : 'pending'}`}>
          {verificado ? 'DC-5\nVerificado' : 'DC-5\nPendiente'}
        </div>
      </div>

      <div className="instructor-footer">
        <Gauge
          rating={instructor.ratingPromedio}
          nivelConfiabilidad={instructor.nivelConfiabilidad}
          tasaEvaluacion={instructor.tasaEvaluacion}
        />
        <button className="btn btn-outline btn-sm" onClick={() => onVerDetalle(instructor)}>
          {canContratar ? 'Ver y contratar' : 'Ver detalle'}
        </button>
      </div>
    </div>
  )
}
