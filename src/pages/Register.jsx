import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiErrorMessage } from '../api/client'

const ESTADOS_MEXICO = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Cdmx', 'Durango', 'Estado de México', 'Guanajuato', 'Guerrero',
  'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora',
  'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
]

const emptyInstructor = {
  email: '', password: '', firstName: '', lastName: '', phoneNumber: '', estado: '', bio: ''
}

const emptyEmpresa = {
  email: '', password: '', firstName: '', lastName: '', phoneNumber: '',
  razonSocial: '', rfc: '', domicilioFiscal: '', nombreDepartamentoRRHH: ''
}

export default function Register() {
  const { registerInstructor, registerEmpresa } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('Instructor')
  const [instructorForm, setInstructorForm] = useState(emptyInstructor)
  const [empresaForm, setEmpresaForm] = useState(emptyEmpresa)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (role === 'Instructor') {
        await registerInstructor(instructorForm)
      } else {
        await registerEmpresa(empresaForm)
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
              <input type="password" required minLength={6} placeholder="Mínimo 6 caracteres" value={instructorForm.password}
                onChange={(e) => setInstructorForm({ ...instructorForm, password: e.target.value })} />
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
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creando cuenta…' : 'Crear cuenta de instructor'}
            </button>
          </form>
        ) : (
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
              <input type="password" required minLength={6} placeholder="Mínimo 6 caracteres" value={empresaForm.password}
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
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creando cuenta…' : 'Crear cuenta de empresa'}
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
