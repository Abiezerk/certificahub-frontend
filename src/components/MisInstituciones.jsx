import { useEffect, useState } from 'react'
import api, { apiErrorMessage } from '../api/client'

const ETIQUETA_ESTADO = {
  Pendiente: { texto: 'Esperando aprobación', clase: 'status-pendiente' },
  Aprobada: { texto: 'Aprobada', clase: 'status-confirmada' },
  Rechazada: { texto: 'Rechazada', clase: 'status-cancelada' }
}

// Panel del instructor: instituciones para las que trabaja. Él solicita unirse y la institución aprueba.
export default function MisInstituciones() {
  const [membresias, setMembresias] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [msg, setMsg] = useState({ tipo: '', texto: '' })
  const [procesando, setProcesando] = useState(null)

  async function cargar() {
    try {
      const { data } = await api.get('/instituciones/mis-membresias')
      setMembresias(data)
    } catch {
      setMembresias([])
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  // Búsqueda con una pequeña espera para no consultar en cada tecla
  useEffect(() => {
    const q = busqueda.trim()
    if (q.length < 3) {
      setResultados([])
      return
    }
    const t = setTimeout(() => {
      api
        .get('/instituciones/buscar', { params: { q } })
        .then(({ data }) => setResultados(data))
        .catch(() => setResultados([]))
    }, 300)
    return () => clearTimeout(t)
  }, [busqueda])

  async function solicitar(inst) {
    setProcesando(inst.id)
    setMsg({ tipo: '', texto: '' })
    try {
      const { data } = await api.post(`/instituciones/${inst.id}/solicitar`)
      setMsg({ tipo: 'success', texto: data.message })
      setBusqueda('')
      cargar()
    } catch (err) {
      setMsg({ tipo: 'error', texto: apiErrorMessage(err) })
    } finally {
      setProcesando(null)
    }
  }

  async function salir(m) {
    const texto = m.estado === 'Aprobada' ? `¿Dejar de aparecer en ${m.razonSocial}?` : `¿Cancelar tu solicitud a ${m.razonSocial}?`
    if (!window.confirm(texto)) return
    setProcesando(m.membresiaId)
    try {
      const { data } = await api.delete(`/instituciones/mis-membresias/${m.membresiaId}`)
      setMsg({ tipo: 'success', texto: data.message })
      cargar()
    } catch (err) {
      setMsg({ tipo: 'error', texto: apiErrorMessage(err) })
    } finally {
      setProcesando(null)
    }
  }

  const yaVinculadas = new Set(membresias.filter((m) => m.estado !== 'Rechazada').map((m) => m.institucionId))

  return (
    <div className="card">
      <h2 className="an-titulo">Instituciones donde trabajas</h2>
      <p className="an-subtitulo">
        Si impartes cursos para una institución capacitadora registrada en CertificaHub, solicita unirte: cuando la
        institución te apruebe aparecerás en su perfil y tu calificación contará en la suya.
      </p>

      {msg.texto && <div className={`banner ${msg.tipo === 'error' ? 'banner-error' : 'banner-success'}`}>{msg.texto}</div>}

      {membresias.length > 0 && (
        <div className="row-list" style={{ marginBottom: 16 }}>
          {membresias.map((m) => (
            <div className="row-item" key={m.membresiaId}>
              <div className="row-main">
                <span className="row-title">{m.razonSocial}</span>
                <span className="row-sub">{m.estadoRepublica || 'Ubicación no indicada'}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className={`status-pill ${ETIQUETA_ESTADO[m.estado]?.clase || ''}`}>{ETIQUETA_ESTADO[m.estado]?.texto || m.estado}</span>
                {m.estado === 'Rechazada' ? (
                  <button className="btn btn-outline btn-sm" disabled={procesando === m.institucionId} onClick={() => solicitar({ id: m.institucionId })}>
                    Volver a solicitar
                  </button>
                ) : (
                  <button className="btn btn-ghost btn-sm" disabled={procesando === m.membresiaId} onClick={() => salir(m)}>
                    {m.estado === 'Aprobada' ? 'Salir' : 'Cancelar solicitud'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="form-group" style={{ marginBottom: 8 }}>
        <label htmlFor="buscar-institucion">Buscar institución</label>
        <input
          id="buscar-institucion"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Nombre o RFC de la institución (mínimo 3 letras)"
        />
      </div>
      {busqueda.trim().length >= 3 && (
        resultados.length === 0 ? (
          <p className="campo-ayuda">No encontramos instituciones verificadas con ese nombre.</p>
        ) : (
          <div className="row-list">
            {resultados.map((i) => (
              <div className="row-item" key={i.id}>
                <div className="row-main">
                  <span className="row-title">{i.razonSocial}</span>
                  <span className="row-sub">{i.estado || 'Ubicación no indicada'}</span>
                </div>
                {yaVinculadas.has(i.id) ? (
                  <span className="campo-ayuda">Ya la tienes</span>
                ) : (
                  <button className="btn btn-primary btn-sm" disabled={procesando === i.id} onClick={() => solicitar(i)}>
                    Solicitar unirme
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
