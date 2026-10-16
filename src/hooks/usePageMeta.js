import { useEffect } from 'react'

const SITIO = 'CertificaHub'
const DESCRIPCION_POR_DEFECTO =
  'Contrata instructores de capacitación STPS para tu empresa, genera constancias DC-3 y verifica su autenticidad en línea.'

function fijarMeta(nombre, contenido) {
  let meta = document.querySelector(`meta[name="${nombre}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', nombre)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', contenido)
}

// Título, descripción e indexación de cada página (el sitio es una SPA: index.html es uno solo).
// noindex: páginas con datos personales o privadas (panel, verificación de un DC-3, evaluación)
// que no deben aparecer en Google.
export default function usePageMeta({ titulo, descripcion, noindex = false }) {
  useEffect(() => {
    document.title = titulo ? `${titulo} | ${SITIO}` : `${SITIO} — Instructores de capacitación STPS y constancias DC-3`
    fijarMeta('description', descripcion || DESCRIPCION_POR_DEFECTO)
    fijarMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow')
  }, [titulo, descripcion, noindex])
}
