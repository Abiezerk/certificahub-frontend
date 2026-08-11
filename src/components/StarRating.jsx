const STAR_PATH = "M12 2l2.9 6.26 6.9.6-5.2 4.73 1.58 6.77L12 16.9l-6.18 3.46 1.58-6.77L2.2 8.86l6.9-.6L12 2z"

export default function StarRating({ rating = 0, size = 16, maxStars = 5 }) {
  const clamped = Math.max(0, Math.min(maxStars, rating))

  return (
    <div style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: maxStars }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, clamped - i)) // 0 a 1: qué tan llena está esta estrella
        return (
          <div key={i} style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            {/* Contorno (siempre visible) */}
            <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: 'absolute', top: 0, left: 0 }}>
              <path d={STAR_PATH} fill="none" stroke="#d0d0d0" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            {/* Relleno dorado, recortado según el porcentaje */}
            {fill > 0 && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: `${fill * 100}%`, height: '100%', overflow: 'hidden' }}>
                <svg width={size} height={size} viewBox="0 0 24 24">
                  <path d={STAR_PATH} fill="#f5b301" stroke="#f5b301" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
