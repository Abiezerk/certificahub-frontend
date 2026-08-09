import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5168/api'

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ch_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function apiErrorMessage(error, fallback = 'Ocurrió un error, intenta de nuevo') {
  return error?.response?.data?.message || error?.response?.data?.title || fallback
}

export default api
