export default function PrecioChips({ p }) {
  const tramos = [
    [p.rango1Min, p.rango1Max, p.rango1Precio],
    [p.rango2Min, p.rango2Max, p.rango2Precio],
    [p.rango3Min, p.rango3Max, p.rango3Precio]
  ].filter(([min, max, precio]) => min != null && max != null && precio != null)

  const tieneParticipante = p.precioPorParticipante != null
  const tieneGrupo = tramos.length > 0 || (p.rango4Min != null && p.rango4Precio != null)

  if (!tieneParticipante && !tieneGrupo) {
    return <span className="price-empty">Sin precio configurado</span>
  }

  return (
    <div className="price-chip-row">
      {tieneParticipante && (
        <span className="chip chip-participante">
          ${Number(p.precioPorParticipante).toLocaleString('es-MX')} <em>/ participante</em>
        </span>
      )}
      {tramos.map(([min, max, precio], idx) => (
        <span className="chip chip-grupo" key={idx}>
          {min}–{max} <em>personas</em> · ${Number(precio).toLocaleString('es-MX')}
        </span>
      ))}
      {p.rango4Min != null && p.rango4Precio != null && (
        <span className="chip chip-grupo">
          {p.rango4Min}+ <em>personas</em> · ${Number(p.rango4Precio).toLocaleString('es-MX')}
        </span>
      )}
    </div>
  )
}
