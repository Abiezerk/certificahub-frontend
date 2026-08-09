import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiErrorMessage } from '../api/client'

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

        {role === 'Instructor' ? (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input required value={instructorForm.firstName}
                  onChange={(e) => setInstructorForm({ ...instructorForm, firstName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input required value={instructorForm.lastName}
                  onChange={(e) => setInstructorForm({ ...instructorForm, lastName: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Correo</label>
              <input type="email" required value={instructorForm.email}
                onChange={(e) => setInstructorForm({ ...instructorForm, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" required minLength={6} value={instructorForm.password}
                onChange={(e) => setInstructorForm({ ...instructorForm, password: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Teléfono</label>
                <input value={instructorForm.phoneNumber}
                  onChange={(e) => setInstructorForm({ ...instructorForm, phoneNumber: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <input placeholder="CDMX, Jalisco…" value={instructorForm.estado}
                  onChange={(e) => setInstructorForm({ ...instructorForm, estado: e.target.value })} />
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
                <label>Tu nombre</label>
                <input required value={empresaForm.firstName}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, firstName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Tu apellido</label>
                <input required value={empresaForm.lastName}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, lastName: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Correo</label>
              <input type="email" required value={empresaForm.email}
                onChange={(e) => setEmpresaForm({ ...empresaForm, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" required minLength={6} value={empresaForm.password}
                onChange={(e) => setEmpresaForm({ ...empresaForm, password: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Razón social</label>
              <input required value={empresaForm.razonSocial}
                onChange={(e) => setEmpresaForm({ ...empresaForm, razonSocial: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>RFC</label>
                <input required value={empresaForm.rfc}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, rfc: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Departamento RRHH</label>
                <input value={empresaForm.nombreDepartamentoRRHH}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, nombreDepartamentoRRHH: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Domicilio fiscal</label>
              <input value={empresaForm.domicilioFiscal}
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
