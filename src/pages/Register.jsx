import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiErrorMessage } from '../api/client'
import usePageMeta from '../hooks/usePageMeta'
import { VERSION_AVISO_PRIVACIDAD } from './AvisoPrivacidad'

const ESTADOS_MEXICO = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Cdmx', 'Durango', 'Estado de México', 'Guanajuato', 'Guerrero',
  'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora',
  'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
]

const emptyInstructor = {
  email: '', password: '', firstName: '', lastName: '', phoneNumber: '', estado: '', bio: '', rfc: ''
}

const emptyInstitucion = {
  email: '', password: '', firstName: '', lastName: '', phoneNumber: '',
  razonSocial: '', rfc: '', estado: '', descripcion: ''
}

const emptyEmpresa = {
  email: '', password: '', firstName: '', lastName: '', phoneNumber: '',
  razonSocial: '', rfc: '', domicilioFiscal: '', nombreDepartamentoRRHH: ''
}

export default function Register() {
  usePageMeta({
    titulo: 'Crear cuenta',
    descripcion: 'Regístrate como instructor para ofrecer tus cursos, o como empresa para contratar capacitación STPS sin costo.'
  })
  const { registerInstructor, registerEmpresa, registerInstitucion } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('Instructor')
  const [instructorForm, setInstructorForm] = useState(emptyInstructor)
  const [empresaForm, setEmpresaForm] = useState(emptyEmpresa)
  const [institucionForm, setInstitucionForm] = useState(emptyInstitucion)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // Consentimiento expreso al Aviso de privacidad y los Términos (obligatorio para registrarse)
  const [aceptaLegal, setAceptaLegal] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const consentimiento = { aceptaAvisoPrivacidad: aceptaLegal, versionAvisoPrivacidad: VERSION_AVISO_PRIVACIDAD }
      if (role === 'Instructor') {
        await registerInstructor({ ...instructorForm, ...consentimiento })
      } else if (role === 'Institucion') {
        await registerInstitucion({ ...institucionForm, ...consentimiento })
      } else {
        await registerEmpresa({ ...empresaForm, ...consentimiento })
      }
      navigate('/panel')
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo completar el registro'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="auth-shell">
        <h1>Crear cuenta</h1>
        <p className="auth-sub">Elige cómo vas a usar CertificaHub.</p>

        <div className="role-toggle">
          <button type="button" className={role === 'Instructor' ? 'active' : ''} onClick={() => setRole('Instructor')}>
            Soy instructor
          </button>
          <button type="button" className={role === 'Empresa' ? 'active' : ''} onClick={() => setRole('Empresa')}>
            Soy empresa
          </button>
          <button type="button" className={role === 'Institucion' ? 'active' : ''} onClick={() => setRole('Institucion')}>
            Soy institución
          </button>
        </div>

        {error && <div className="banner banner-error">{error}</div>}

        <p style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginBottom: 16 }}>
          Los campos marcados con <span style={{ color: 'var(--alert)' }}>*</span> son obligatorios.
        </p>

        {role === 'Instructor' ? (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre <span style={{ color: 'var(--alert)' }}>*</span></label>
                <input required placeholder="Juan" value={instructorForm.firstName}
                  onChange={(e) => setInstructorForm({ ...instructorForm, firstName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Apellido <span style={{ color: 'var(--alert)' }}>*</span></label>
                <input required placeholder="Pérez" value={instructorForm.lastName}
                  onChange={(e) => setInstructorForm({ ...instructorForm, lastName: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Correo <span style={{ color: 'var(--alert)' }}>*</span></label>
              <input type="email" required placeholder="juan@correo.com" value={instructorForm.email}
                onChange={(e) => setInstructorForm({ ...instructorForm, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Contraseña <span style={{ color: 'var(--alert)' }}>*</span></label>
              <input type="password" required minLength={8} placeholder="Mínimo 8 caracteres" value={instructorForm.password}
                onChange={(e) => setInstructorForm({ ...instructorForm, password: e.target.value })} />
            </div>
            <div className="form-group">
              <label>RFC con homoclave <span style={{ color: 'var(--alert)' }}>*</span></label>
              <input required minLength={13} maxLength={13} placeholder="PELJ900515AB1" value={instructorForm.rfc}
                pattern="[A-Za-zÑñ&]{4}[0-9]{6}[A-Za-z0-9]{3}"
                title="13 caracteres: 4 letras, tu fecha de nacimiento (AAMMDD) y la homoclave"
                style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
                onChange={(e) => setInstructorForm({ ...instructorForm, rfc: e.target.value.toUpperCase().replace(/\s/g, '') })} />
              <span className="campo-ayuda">
                Con tu RFC verificamos tu registro como agente capacitador en el padrón público de la STPS y los cursos que
                tienes registrados. Solo podrás ofrecer esos cursos. Consulta los{' '}
                <Link to="/precios" target="_blank" rel="noopener">planes para instructores</Link>.
              </span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Teléfono</label>
                <input placeholder="664 123 4567" value={instructorForm.phoneNumber}
                  onChange={(e) => setInstructorForm({ ...instructorForm, phoneNumber: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Estado <span style={{ color: 'var(--alert)' }}>*</span></label>
                <select required value={instructorForm.estado}
                  onChange={(e) => setInstructorForm({ ...instructorForm, estado: e.target.value })}>
                  <option value="" disabled>Selecciona tu estado…</option>
                  {ESTADOS_MEXICO.map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Biografía breve</label>
              <textarea value={instructorForm.bio}
                onChange={(e) => setInstructorForm({ ...instructorForm, bio: e.target.value })}
                placeholder="Especialidad, años de experiencia, enfoque de tus cursos…" />
            </div>
            <label className="casilla-legal">
              <input type="checkbox" required checked={aceptaLegal} onChange={(e) => setAceptaLegal(e.target.checked)} />
              <span>
                He leído y acepto el{' '}
                <Link to="/privacidad" target="_blank" rel="noopener">Aviso de privacidad</Link> y los{' '}
                <Link to="/terminos" target="_blank" rel="noopener">Términos y condiciones</Link>.
              </span>
            </label>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creando cuenta…' : 'Crear cuenta de instructor'}
            </button>
          </form>
        ) : role === 'Empresa' ? (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Tu nombre <span style={{ color: 'var(--alert)' }}>*</span></label>
                <input required placeholder="Ana" value={empresaForm.firstName}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, firstName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Tu apellido <span style={{ color: 'var(--alert)' }}>*</span></label>
                <input required placeholder="García López" value={empresaForm.lastName}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, lastName: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Correo <span style={{ color: 'var(--alert)' }}>*</span></label>
              <input type="email" required placeholder="contacto@tuempresa.com" value={empresaForm.email}
                onChange={(e) => setEmpresaForm({ ...empresaForm, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Contraseña <span style={{ color: 'var(--alert)' }}>*</span></label>
              <input type="password" required minLength={8} placeholder="Mínimo 8 caracteres" value={empresaForm.password}
                onChange={(e) => setEmpresaForm({ ...empresaForm, password: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Razón social <span style={{ color: 'var(--alert)' }}>*</span></label>
              <input required placeholder="Comercializadora Ejemplo S.A. de C.V." value={empresaForm.razonSocial}
                onChange={(e) => setEmpresaForm({ ...empresaForm, razonSocial: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>RFC <span style={{ color: 'var(--alert)' }}>*</span></label>
                <input required placeholder="CEM-010203-AB1" value={empresaForm.rfc}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, rfc: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Departamento RRHH</label>
                <input placeholder="Recursos Humanos" value={empresaForm.nombreDepartamentoRRHH}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, nombreDepartamentoRRHH: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Domicilio fiscal</label>
              <input placeholder="Calle, número, colonia, ciudad, CP" value={empresaForm.domicilioFiscal}
                onChange={(e) => setEmpresaForm({ ...empresaForm, domicilioFiscal: e.target.value })} />
            </div>
            <label className="casilla-legal">
              <input type="checkbox" required checked={aceptaLegal} onChange={(e) => setAceptaLegal(e.target.checked)} />
              <span>
                He leído y acepto el{' '}
                <Link to="/privacidad" target="_blank" rel="noopener">Aviso de privacidad</Link> y los{' '}
                <Link to="/terminos" target="_blank" rel="noopener">Términos y condiciones</Link>.
              </span>
            </label>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creando cuenta…' : 'Crear cuenta de empresa'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="campo-ayuda" style={{ marginTop: 0, marginBottom: 14 }}>
              Para empresas capacitadoras registradas ante la STPS como agente capacitador (persona moral). Tu institución
              no se contrata directamente: agrupa a tus instructores y su calificación.
            </p>
            <div className="form-group">
              <label>Razón social <span style={{ color: 'var(--alert)' }}>*</span></label>
              <input required placeholder="Capacitación Industrial del Norte S.A. de C.V." value={institucionForm.razonSocial}
                onChange={(e) => setInstitucionForm({ ...institucionForm, razonSocial: e.target.value })} />
            </div>
            <div className="form-group">
              <label>RFC de la institución <span style={{ color: 'var(--alert)' }}>*</span></label>
              <input required minLength={12} maxLength={12} placeholder="CIN150101AB1" value={institucionForm.rfc}
                pattern="[A-Za-zÑñ&]{3}[0-9]{6}[A-Za-z0-9]{3}"
                title="12 caracteres: 3 letras, la fecha de constitución (AAMMDD) y la homoclave"
                style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
                onChange={(e) => setInstitucionForm({ ...institucionForm, rfc: e.target.value.toUpperCase().replace(/\s/g, '') })} />
              <span className="campo-ayuda">Con él verificamos el registro de tu institución en el padrón público de la STPS.</span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre de contacto <span style={{ color: 'var(--alert)' }}>*</span></label>
                <input required placeholder="Laura" value={institucionForm.firstName}
                  onChange={(e) => setInstitucionForm({ ...institucionForm, firstName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Apellido <span style={{ color: 'var(--alert)' }}>*</span></label>
                <input required placeholder="Treviño" value={institucionForm.lastName}
                  onChange={(e) => setInstitucionForm({ ...institucionForm, lastName: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Correo <span style={{ color: 'var(--alert)' }}>*</span></label>
              <input type="email" required placeholder="contacto@tuinstitucion.com" value={institucionForm.email}
                onChange={(e) => setInstitucionForm({ ...institucionForm, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Contraseña <span style={{ color: 'var(--alert)' }}>*</span></label>
              <input type="password" required minLength={8} placeholder="Mínimo 8 caracteres" value={institucionForm.password}
                onChange={(e) => setInstitucionForm({ ...institucionForm, password: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Teléfono</label>
                <input placeholder="81 1234 5678" value={institucionForm.phoneNumber}
                  onChange={(e) => setInstitucionForm({ ...institucionForm, phoneNumber: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select value={institucionForm.estado}
                  onChange={(e) => setInstitucionForm({ ...institucionForm, estado: e.target.value })}>
                  <option value="">Selecciona tu estado…</option>
                  {ESTADOS_MEXICO.map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Descripción breve</label>
              <textarea value={institucionForm.descripcion} maxLength={1000}
                onChange={(e) => setInstitucionForm({ ...institucionForm, descripcion: e.target.value })}
                placeholder="A qué se dedica tu institución y en qué temas se especializa…" />
            </div>
            <label className="casilla-legal">
              <input type="checkbox" required checked={aceptaLegal} onChange={(e) => setAceptaLegal(e.target.checked)} />
              <span>
                He leído y acepto el{' '}
                <Link to="/privacidad" target="_blank" rel="noopener">Aviso de privacidad</Link> y los{' '}
                <Link to="/terminos" target="_blank" rel="noopener">Términos y condiciones</Link>.
              </span>
            </label>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creando cuenta…' : 'Crear cuenta de institución'}
            </button>
          </form>
        )}

        <p className="auth-sub" style={{ marginTop: 20 }}>
          ¿Ya tienes cuenta? <Link to="/login">Entra aquí</Link>
        </p>
      </div>
    </div>
  )
}
