import { useEffect, useState } from 'react'
import api, { apiErrorMessage } from '../api/client'

// Pestaña "Estadísticas" (instructor y empresa): números clave, gráficas y reporte PDF.
// Todas las gráficas son de una sola serie, en el verde de la marca (sin paleta de categorías).

const PERIODOS = [
  { id: '3m', label: '3 meses' },
  { id: '6m', label: '6 meses' },
  { id: '12m', label: '12 meses' },
  { id: 'anio', label: 'Este año' },
  { id: 'todo', label: 'Todo' }
]

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const zonaHoraria = Intl.DateTimeFormat().resolvedOptions().timeZone

function dinero(n) {
  return Number(n).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
}

// Para los ejes: $0 / $500 / $1.2K / $3M
function dineroCompacto(n) {
  return '$' + Number(n).toLocaleString('es-MX', { notation: 'compact', maximumFractionDigits: 1 })
}

function plural(n, singular, pluralTxt) {
  return `${n.toLocaleString('es-MX')} ${n === 1 ? singular : pluralTxt}`
}

// Máximo "redondo" para el eje (1, 2, 2.5, 5 × 10^n), así las marcas quedan en números limpios
function maximoRedondo(valor) {
  if (valor <= 0) return 1
  const potencia = Math.pow(10, Math.floor(Math.log10(valor)))
  for (const paso of [1, 2, 2.5, 5, 10]) {
    if (paso * potencia >= valor) return paso * potencia
  }
  return 10 * potencia
}

function StatTile({ label, value, nota }) {
  return (
    <div className="an-tile">
      <span className="an-tile-label">{label}</span>
      <span className="an-tile-value">{value}</span>
      {nota && <span className="an-tile-nota">{nota}</span>}
    </div>
  )
}

function useMaxEtiquetas() {
  const calcular = () => (window.innerWidth < 640 ? 4 : 12)
  const [max, setMax] = useState(calcular)
  useEffect(() => {
    const alCambiar = () => setMax(calcular())
    window.addEventListener('resize', alCambiar)
    return () => window.removeEventListener('resize', alCambiar)
  }, [])
  return max
}

// Columnas por mes con eje Y, marcas limpias y tooltip al pasar el mouse
function GraficaMensual({ puntos, etiquetaMonto }) {
  const [activo, setActivo] = useState(null)
  const max = maximoRedondo(Math.max(...puntos.map((p) => p.monto), 0))
  const marcas = [max, max / 2, 0]
  // Solo se rotula uno de cada N meses para que no se encimen (en celular caben ~4 etiquetas)
  const maxEtiquetas = useMaxEtiquetas()
  const cadaN = Math.max(1, Math.ceil(puntos.length / maxEtiquetas))
  const sinDatos = puntos.every((p) => p.monto === 0)

  return (
    <div className="an-chart">
      <div className="an-chart-plot">
        <div className="an-chart-ejey">
          {marcas.map((m) => (
            <span key={m}>{dineroCompacto(m)}</span>
          ))}
        </div>
        <div className="an-chart-area" onMouseLeave={() => setActivo(null)}>
          {marcas.map((m) => (
            <div key={m} className="an-chart-grid" style={{ bottom: `${(m / max) * 100}%` }} />
          ))}
          {sinDatos && <div className="an-chart-vacio">Sin cursos completados en este periodo</div>}
          {puntos.map((p, i) => {
            const alto = (p.monto / max) * 100
            return (
              <div
                key={`${p.anio}-${p.mes}`}
                className={`an-col ${activo === i ? 'activa' : ''}`}
                onMouseEnter={() => setActivo(i)}
                onFocus={() => setActivo(i)}
                onBlur={() => setActivo(null)}
                tabIndex={0}
                aria-label={`${MESES[p.mes - 1]} ${p.anio}: ${dinero(p.monto)}, ${plural(p.cursos, 'curso', 'cursos')}`}
              >
                {p.monto > 0 && <div className="an-col-barra" style={{ height: `${alto}%` }} />}
                {activo === i && (
                  <div className={`an-tooltip ${i > puntos.length / 2 ? 'izq' : ''}`}>
                    <strong>
                      {MESES[p.mes - 1]} {p.anio}
                    </strong>
                    <span>
                      {etiquetaMonto}: {dinero(p.monto)}
                    </span>
                    <span>{plural(p.cursos, 'curso completado', 'cursos completados')}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div className="an-chart-ejex">
        {puntos.map((p, i) => (
          <span key={`${p.anio}-${p.mes}`}>
            {i % cadaN === 0 ? `${MESES_CORTOS[p.mes - 1]}${p.mes <= cadaN || i === 0 ? ` ${String(p.anio).slice(2)}` : ''}` : ''}
          </span>
        ))}
      </div>

      <details className="an-tabla-datos">
        <summary>Ver tabla de datos</summary>
        <table>
          <thead>
            <tr>
              <th>Mes</th>
              <th className="num">Cursos</th>
              <th className="num">{etiquetaMonto}</th>
            </tr>
          </thead>
          <tbody>
            {puntos.map((p) => (
              <tr key={`${p.anio}-${p.mes}`}>
                <td>
                  {MESES[p.mes - 1]} {p.anio}
                </td>
                <td className="num">{p.cursos}</td>
                <td className="num">{dinero(p.monto)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}

// Barras horizontales ordenadas de mayor a menor, con el valor en la punta
function BarrasHorizontales({ filas, vacio, valor = (f) => f.monto, formato = dinero, detalle }) {
  if (filas.length === 0) return <div className="an-vacio">{vacio}</div>
  const max = Math.max(...filas.map(valor), 0) || 1
  return (
    <div className="an-barras">
      {filas.map((f) => (
        <div className="an-barra-fila" key={f.nombre} title={detalle ? detalle(f) : undefined}>
          <span className="an-barra-nombre">{f.nombre}</span>
          <div className="an-barra-track">
            {valor(f) > 0 && <div className="an-barra-relleno" style={{ width: `${(valor(f) / max) * 100}%` }} />}
          </div>
          <span className="an-barra-valor">{formato(valor(f))}</span>
        </div>
      ))}
    </div>
  )
}

function Medidor({ label, porcentaje }) {
  return (
    <div className="an-medidor">
      <div className="an-medidor-top">
        <span>{label}</span>
        <span className="an-medidor-valor">{porcentaje}%</span>
      </div>
      <div className="an-barra-track">
        {porcentaje > 0 && <div className="an-barra-relleno" style={{ width: `${porcentaje}%` }} />}
      </div>
    </div>
  )
}

export default function AnaliticaPanel({ rol }) {
  const esInstructor = rol === 'Instructor'
  const etiquetaMonto = esInstructor ? 'Ingresos' : 'Gasto'

  const [periodo, setPeriodo] = useState('12m')
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [generandoPdf, setGenerandoPdf] = useState(false)
  // PDF ya generado: se descarga con un segundo clic directo (si no, el navegador lo bloquea)
  const [pdf, setPdf] = useState(null)

  useEffect(() => {
    let activo = true
    setCargando(true)
    setError('')
    api
      .get('/analitica', { params: { periodo, zona: zonaHoraria } })
      .then((r) => activo && setDatos(r.data))
      .catch((err) => activo && setError(apiErrorMessage(err, 'No se pudieron cargar las estadísticas')))
      .finally(() => activo && setCargando(false))
    return () => {
      activo = false
    }
  }, [periodo])

  // Al cambiar de periodo, el PDF generado ya no corresponde
  useEffect(() => {
    setPdf((anterior) => {
      if (anterior) window.URL.revokeObjectURL(anterior.url)
      return null
    })
  }, [periodo])

  async function generarPdf() {
    setGenerandoPdf(true)
    setError('')
    try {
      const response = await api.get('/analitica/reporte-pdf', {
        params: { periodo, zona: zonaHoraria },
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const ahora = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      const sello = `${ahora.getFullYear()}${pad(ahora.getMonth() + 1)}${pad(ahora.getDate())}_${pad(ahora.getHours())}${pad(ahora.getMinutes())}`
      setPdf((anterior) => {
        if (anterior) window.URL.revokeObjectURL(anterior.url)
        return { url, nombre: `Reporte_CertificaHub_${sello}.pdf` }
      })
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo generar el reporte'))
    } finally {
      setGenerandoPdf(false)
    }
  }

  const ev = datos?.evaluaciones

  return (
    <div className="an-panel">
      <div className="an-toolbar">
        <div className="an-periodos" role="group" aria-label="Periodo">
          {PERIODOS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={periodo === p.id ? 'activo' : ''}
              onClick={() => setPeriodo(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="an-acciones">
          <button className="btn btn-outline btn-sm" onClick={generarPdf} disabled={generandoPdf || cargando}>
            {generandoPdf ? 'Generando…' : pdf ? '🔄 Volver a generar' : '📄 Generar reporte PDF'}
          </button>
          {pdf && !generandoPdf && (
            <a className="btn btn-primary btn-sm" href={pdf.url} download={pdf.nombre}>
              ⬇️ Descargar PDF
            </a>
          )}
        </div>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {cargando && !datos ? (
        <div className="card">
          <div className="empty-state">Cargando estadísticas…</div>
        </div>
      ) : datos ? (
        <div className={cargando ? 'an-cargando' : ''}>
          <p className="an-rango">
            {datos.periodoEtiqueta} · {new Date(datos.desde).toLocaleDateString('es-MX')} –{' '}
            {new Date(datos.hasta).toLocaleDateString('es-MX')}
          </p>

          <div className="an-tiles">
            <StatTile
              label={`${etiquetaMonto} (cursos completados)`}
              value={dinero(datos.montoCompletado)}
              nota={plural(datos.cursosCompletados, 'curso completado', 'cursos completados')}
            />
            <StatTile
              label="Por impartir"
              value={dinero(datos.montoPorImpartir)}
              nota={plural(datos.cursosPorImpartir, 'curso programado', 'cursos programados')}
            />
            <StatTile
              label={esInstructor ? 'Participantes capacitados' : 'Trabajadores capacitados'}
              value={datos.participantes.toLocaleString('es-MX')}
              nota="en cursos completados"
            />
            {esInstructor ? (
              <StatTile
                label="Calificación promedio"
                value={ev && ev.total > 0 ? `${ev.promedio.toFixed(1)} ★` : '—'}
                nota={ev ? plural(ev.total, 'evaluación', 'evaluaciones') : ''}
              />
            ) : (
              <StatTile
                label="Certificados recibidos"
                value={datos.certificadosEnviados.toLocaleString('es-MX')}
                nota="enviados por los instructores"
              />
            )}
            {esInstructor && (
              <StatTile
                label="Certificados generados"
                value={datos.certificadosGenerados.toLocaleString('es-MX')}
                nota={plural(datos.certificadosEnviados, 'enviado a empresas', 'enviados a empresas')}
              />
            )}
            <StatTile label="Cursos cancelados" value={datos.cursosCancelados.toLocaleString('es-MX')} nota="en el periodo" />
          </div>

          <div className="card an-card">
            <h3 className="an-titulo">{etiquetaMonto} por mes</h3>
            <p className="an-subtitulo">Monto de los cursos completados, según la fecha del curso</p>
            <GraficaMensual puntos={datos.porMes} etiquetaMonto={etiquetaMonto} />
          </div>

          <div className="an-grid-2">
            <div className="card an-card">
              <h3 className="an-titulo">Por especialidad</h3>
              <p className="an-subtitulo">{etiquetaMonto} de cursos completados</p>
              <BarrasHorizontales
                filas={datos.porEspecialidad}
                vacio="Sin cursos completados en este periodo"
                detalle={(f) => `${f.nombre}: ${plural(f.cursos, 'curso', 'cursos')}, ${f.participantes} participantes, ${dinero(f.monto)}`}
              />
            </div>
            <div className="card an-card">
              <h3 className="an-titulo">{esInstructor ? 'Por empresa' : 'Por instructor'}</h3>
              <p className="an-subtitulo">{etiquetaMonto} de cursos completados</p>
              <BarrasHorizontales
                filas={datos.porContraparte}
                vacio="Sin cursos completados en este periodo"
                detalle={(f) => `${f.nombre}: ${plural(f.cursos, 'curso', 'cursos')}, ${f.participantes} participantes, ${dinero(f.monto)}`}
              />
            </div>
          </div>

          {esInstructor && ev && (
            <div className="card an-card">
              <h3 className="an-titulo">Evaluaciones de los participantes</h3>
              <p className="an-subtitulo">
                {ev.total > 0
                  ? `${plural(ev.total, 'evaluación', 'evaluaciones')} · promedio ${ev.promedio.toFixed(1)} de 5`
                  : 'Todavía no hay evaluaciones de cursos en este periodo'}
              </p>
              {ev.total > 0 && (
                <div className="an-grid-2 an-grid-2-sin-margen">
                  <BarrasHorizontales
                    filas={[5, 4, 3, 2, 1].map((estrellas) => ({
                      nombre: `${estrellas} ${estrellas === 1 ? 'estrella' : 'estrellas'}`,
                      cantidad: ev.distribucion[estrellas - 1]
                    }))}
                    valor={(f) => f.cantidad}
                    formato={(n) => n.toLocaleString('es-MX')}
                  />
                  <div>
                    <p className="an-subtitulo" style={{ marginTop: 0 }}>
                      Los participantes opinan que el curso fue…
                    </p>
                    <Medidor label="Dinámico" porcentaje={ev.porcentajeDinamico} />
                    <Medidor label="Flexible" porcentaje={ev.porcentajeFlexible} />
                    <Medidor label="Teórico" porcentaje={ev.porcentajeTeorico} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
