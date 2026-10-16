import { esPendiente } from '../config/negocio'

// Muestra un dato del negocio; si todavía no se ha completado, lo resalta en amarillo
export default function DatoNegocio({ valor }) {
  if (esPendiente(valor)) return <mark className="legal-pendiente">{valor}</mark>
  return <>{valor}</>
}
