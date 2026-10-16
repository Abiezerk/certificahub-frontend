import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
// Fuentes servidas desde el propio sitio (no desde Google): los visitantes no le comparten su IP a
// Google y la página carga más rápido. Solo los pesos que se usan y el juego de caracteres latino.
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/space-grotesk/latin-500.css'
import '@fontsource/space-grotesk/latin-600.css'
import '@fontsource/space-grotesk/latin-700.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import '@fontsource/ibm-plex-mono/latin-600.css'
import './index.css'

// Cloudflare Web Analytics: medición de visitas sin cookies (no requiere aviso de cookies).
// Solo se activa si existe VITE_CF_ANALYTICS_TOKEN (se obtiene en el panel de Cloudflare al
// registrar el dominio); en desarrollo local no se carga.
const tokenAnalitica = import.meta.env.VITE_CF_ANALYTICS_TOKEN
if (tokenAnalitica) {
  const script = document.createElement('script')
  script.defer = true
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
  script.setAttribute('data-cf-beacon', JSON.stringify({ token: tokenAnalitica, spa: true }))
  document.head.appendChild(script)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
