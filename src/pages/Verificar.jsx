import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'

// Página PÚBLICA de verificación de autenticidad de un DC-3. Se abre al escanear el QR impreso
// en la constancia (/verificar/:numeroSerie) o escribiendo el número de serie a mano (/verificar).

// Las fechas del periodo vienen sin hora (fecha local del curso)
function fechaLarga(valor) {
  if (!valor) return '—'
  const [anio, mes, dia] = valor.slice(0, 10).split('-').map(Number)
  return new Date(anio, mes - 1, dia).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

// La fecha de emisión se guarda en UTC
function fechaEmision(valor) {
  if (!valor) return '—'
  const utc = /[zZ]|[+-]\d{2}:\d{2}$/.test(valor) ? valor : `${valor}Z`
  return new Date(utc).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function Verificar() {
  const { numeroSerie } = useParams()
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState(numeroSerie || '')
  const [estado, setEstado] = useState(numeroSerie ? 'cargando' : 'inicio') // inicio | cargando | valido | noEncontrado | error
  const [certificado, setCertificado] = useState(null)

  useEffect(() => {
    if (!numeroSerie) {
      setEstado('inicio')
      setCertificado(null)
      return
    }
    let activo = true
    setBusqueda(numeroSerie)
    setEstado('cargando')
    api
      .get(`/certificados/verificar/${encodeURIComponent(numeroSerie.trim())}`)
      .then(({ data }) => {
        if (!activo) return
        setCertificado(data)
        setEstado('valido')
      })
      .catch((err) => {
        if (!activo) return
        setCertificado(null)
        setEstado(err?.response?.status === 404 ? 'noEncontrado' : 'error')
      })
    return () => {
      activo = false
    }
  }, [numeroSerie])

  function buscar(e) {
    e.preventDefault()
    const serie = busqueda.trim().toUpperCase()
    if (serie) navigate(`/verificar/${encodeURIComponent(serie)}`)
  }

  const mismoPeriodo = certificado && certificado.fechaInicio?.slice(0, 10) === certificado.fechaFin?.slice(0, 10)

  return (
    <div className="page">
      <div className="container">
      <div className="verificar-shell">
        <header className="verificar-header">
          <span className="verificar-sello" aria-hidden="true">DC-3</span>
          <div>
            <h1>Verificación de constancias DC-3</h1>
            <p>Comprueba que una constancia de competencias emitida a través de CertificaHub es auténtica.</p>
          </div>
        </header>

        <form className="verificar-busqueda" onSubmit={buscar}>
          <label htmlFor="numero-serie">Número de serie</label>
          <div className="verificar-busqueda-fila">
            <input
              id="numero-serie"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="DC3-20261015143022-A1B2C3D4"
              autoComplete="off"
              spellCheck={false}
            />
            <button className="btn btn-primary" disabled={!busqueda.trim() || estado === 'cargando'}>
              Verificar
            </button>
          </div>
          <span className="verificar-ayuda">
            Viene impreso debajo del código QR, en la esquina superior derecha de la constancia.
          </span>
        </form>

        {estado === 'cargando' && <div className="card verificar-estado">Verificando…</div>}

        {estado === 'noEncontrado' && (
          <div className="card verificar-resultado verificar-invalido" role="status">
            <div className="verificar-veredicto">
              <span className="verificar-icono" aria-hidden="true">✕</span>
              <div>
                <h2>Constancia no encontrada</h2>
                <p>
                  No existe ninguna constancia con el número <strong>{numeroSerie}</strong>. Revisa que esté bien
                  escrito; si es correcto, este documento no fue emitido a través de CertificaHub.
                </p>
              </div>
            </div>
          </div>
        )}

        {estado === 'error' && (
          <div className="banner banner-error">No se pudo verificar en este momento. Intenta de nuevo en unos minutos.</div>
        )}

        {estado === 'valido' && certificado && (
          <div className="card verificar-resultado verificar-valido" role="status">
            <div className="verificar-veredicto">
              <span className="verificar-icono" aria-hidden="true">✓</span>
              <div>
                <h2>Constancia auténtica</h2>
                <p>Esta constancia DC-3 fue emitida a través de CertificaHub. Compara los datos con el documento impreso.</p>
              </div>
            </div>

            <dl className="verificar-datos">
              <div className="verificar-dato verificar-dato-ancho">
                <dt>Nombre del trabajador</dt>
                <dd>{certificado.participanteNombre}</dd>
              </div>
              <div className="verificar-dato">
                <dt>CURP</dt>
                <dd className="verificar-mono">{certificado.curpEnmascarada || 'No disponible'}</dd>
              </div>
              <div className="verificar-dato">
                <dt>Número de serie</dt>
                <dd className="verificar-mono">{certificado.numeroSerie}</dd>
              </div>
              <div className="verificar-dato verificar-dato-ancho">
                <dt>Curso</dt>
                <dd>{certificado.curso}</dd>
              </div>
              <div className="verificar-dato">
                <dt>Duración</dt>
                <dd>{certificado.duracionHoras ? `${certificado.duracionHoras} horas` : 'No disponible'}</dd>
              </div>
              <div className="verificar-dato">
                <dt>{mismoPeriodo ? 'Fecha del curso' : 'Periodo de ejecución'}</dt>
                <dd>
                  {mismoPeriodo
                    ? fechaLarga(certificado.fechaInicio)
                    : `${fechaLarga(certificado.fechaInicio)} al ${fechaLarga(certificado.fechaFin)}`}
                </dd>
              </div>
              <div className="verificar-dato">
                <dt>Instructor</dt>
                <dd>{certificado.instructorNombre || 'No disponible'}</dd>
              </div>
              <div className="verificar-dato">
                <dt>Empresa</dt>
                <dd>{certificado.empresaRazonSocial || 'No disponible'}</dd>
              </div>
              <div className="verificar-dato">
                <dt>Fecha de emisión</dt>
                <dd>{fechaEmision(certificado.fechaEmision)}</dd>
              </div>
            </dl>
          </div>
        )}

        <p className="verificar-leyenda">
          Por razones de privacidad, algunos datos personales del trabajador se muestran de forma parcial o
          limitada, como la CURP. La información completa solo aparece en la constancia impresa entregada al
          trabajador.
        </p>
      </div>
      </div>
    </div>
  )
}
