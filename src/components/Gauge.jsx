import StarRating from './StarRating'

const COLORS = {
  'Muy confiable': '#0f7a5c',
  'Confiable': '#3fa483',
  'Moderado': '#e2a63b',
  'Poco': '#b23a2e'
}

const TAG_CLASS = {
  'Muy confiable': 'tag-muy-confiable',
  'Confiable': 'tag-confiable',
  'Moderado': 'tag-moderado',
  'Poco': 'tag-poco'
}

export default function Gauge({ rating = 0, nivelConfiabilidad = 'Poco', tasaEvaluacion = 0, size = 64, hideCircle = false }) {
  const clampedRating = Math.max(0, Math.min(5, rating))
  const clampedEvaluacion = Math.max(0, Math.min(100, tasaEvaluacion))
  const cx = 60
  const cy = 58
  const trackR = 48
  const needleR = 38
  const color = COLORS[nivelConfiabilidad] || COLORS['Poco']

  const angle = Math.PI - (clampedEvaluacion / 100) * Math.PI
  const needleX = cx + needleR * Math.cos(angle)
  const needleY = cy - needleR * Math.sin(angle)
  const fillX = cx + trackR * Math.cos(angle)
  const fillY = cy - trackR * Math.sin(angle)

  return (
    <div className="gauge-wrap">
      {!hideCircle && (
        <svg width={size} height={size * 0.7} viewBox="0 0 120 76" aria-hidden="true">
          <path
            d={`M ${cx - trackR} ${cy} A ${trackR} ${trackR} 0 0 1 ${cx + trackR} ${cy}`}
            fill="none"
            stroke="#dcdfd6"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {clampedEvaluacion > 0 && (
            <path
              d={`M ${cx - trackR} ${cy} A ${trackR} ${trackR} 0 0 1 ${fillX} ${fillY}`}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
            />
          )}
          <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke={color} strokeWidth="3" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="5" fill={color} />
        </svg>
      )}
      <div className="gauge-labels">
        <div className="value" style={{ marginBottom: 2 }}>
          <StarRating rating={clampedRating} size={15} />
        </div>
        <div style={{ color: 'var(--ink-soft)' }}>{clampedEvaluacion.toFixed(0)}% evaluado</div>
        <span className={`tag ${TAG_CLASS[nivelConfiabilidad] || 'tag-poco'}`}>{nivelConfiabilidad}</span>
      </div>
    </div>
  )
}
