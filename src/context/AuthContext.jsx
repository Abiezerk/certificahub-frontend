import { createContext, useContext, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

function readStoredUser() {
  const raw = localStorage.getItem('ch_user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser())

  function persist(authResponse) {
    localStorage.setItem('ch_token', authResponse.token)
    const userData = {
      userId: authResponse.userId,
      email: authResponse.email,
      userType: authResponse.userType,
      firstName: authResponse.firstName,
      lastName: authResponse.lastName
    }
    localStorage.setItem('ch_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    return persist(data)
  }

  async function registerInstructor(payload) {
    const { data } = await api.post('/auth/register/instructor', payload)
    return persist(data)
  }

  async function registerEmpresa(payload) {
    const { data } = await api.post('/auth/register/empresa', payload)
    return persist(data)
  }

  function logout() {
    localStorage.removeItem('ch_token')
    localStorage.removeItem('ch_user')
    setUser(null)
  }

  const value = { user, login, registerInstructor, registerEmpresa, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
