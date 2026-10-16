import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { apiErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'

// "Eliminar mi cuenta": borra los datos personales y el acceso, y conserva las constancias DC-3 emitidas
// (siguen siendo verificables) y el historial de cursos.
export default function EliminarCuenta({ tipo }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function eliminar(e) {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      await api.delete('/cuenta', { data: { password, confirmacion } })
      logout()
      navigate('/', { replace: true })
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo eliminar la cuenta'))
    } finally {
      setEnviando(false)
    }
  }

  const seConserva =
    tipo === 'Instructor'
      ? 'Las constancias DC-3 que emitiste seguirán siendo verificables con tu nombre tal como quedó impreso en ellas.'
      : tipo === 'Empresa'
        ? 'Las constancias DC-3 de tus trabajadores seguirán siendo verificables.'
        : 'Tus instructores dejarán de aparecer vinculados a tu institución.'

  return (
    <div className="card zona-peligro">
      <h2 className="an-titulo">Eliminar mi cuenta</h2>
      {!abierto ? (
        <>
          <p className="an-subtitulo">
            Borra tus datos personales y tu acceso a CertificaHub. Esta acción no se puede deshacer.
          </p>
          <button className="btn btn-outline btn-sm boton-peligro" onClick={() => setAbierto(true)}>
            Quiero eliminar mi cuenta
          </button>
        </>
      ) : (
        <form onSubmit={eliminar} className="zona-peligro-form">
          <ul className="zona-peligro-lista">
            <li>Se borran tu correo, teléfono, foto, descripción y demás datos de tu perfil.</li>
            <li>Ya no podrás iniciar sesión ni recuperar la cuenta.</li>
            <li>{seConserva}</li>
            <li>Se conserva el historial de cursos y lo que la ley obliga a guardar (por ejemplo, datos fiscales por 5 años).</li>
            <li>Si tienes cursos pendientes, confirmados o en curso, primero cancélalos o márcalos como completados.</li>
          </ul>
          {error && <div className="banner banner-error">{error}</div>}
          <div className="form-group">
            <label htmlFor="eliminar-password">Tu contraseña</label>
            <input id="eliminar-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="eliminar-confirmacion">
              Escribe <strong>ELIMINAR</strong> para confirmar
            </label>
            <input id="eliminar-confirmacion" required value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} autoComplete="off" />
          </div>
          <div className="verif-fila">
            <button className="btn btn-primary boton-peligro-lleno" disabled={enviando || confirmacion !== 'ELIMINAR' || !password}>
              {enviando ? 'Eliminando…' : 'Eliminar mi cuenta definitivamente'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => { setAbierto(false); setPassword(''); setConfirmacion(''); setError('') }}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
