// ============================================================================
// DATOS DEL NEGOCIO — el único lugar que hay que editar si cambian.
// Los usan el Aviso de privacidad, los Términos y condiciones y la página de precios.
// Si más adelante el negocio pasa a una empresa (ej. S.A.S.), basta con cambiar "responsable".
// Los valores que empiezan con "[POR COMPLETAR" se muestran resaltados en amarillo en el sitio.
// ============================================================================

export const RESPONSABLE = {
  // "persona física" (hoy) o "persona moral" (si se constituye una empresa)
  tipo: 'persona física',
  nombre: 'Israel Abiezer Canales Espinoza',
  domicilio: '[POR COMPLETAR: domicilio]',
  correoPrivacidad: 'privacidad@certificahub.com.mx',
  correoContacto: 'contacto@certificahub.com.mx',
  sitio: 'certificahub.com.mx',
  // Tribunales para controversias (Términos y condiciones)
  jurisdiccion: 'Tijuana, Baja California'
}

// Dónde se guardan los datos (Microsoft Azure). Si se cambia de región, actualizar aquí.
export const ALOJAMIENTO = {
  proveedor: 'Microsoft Azure',
  region: 'West US 2',
  pais: 'Estados Unidos de América'
}

// Suscripción para instructores (las empresas usan CertificaHub sin costo).
// Si cambia el precio, también hay que cambiarlo en Stripe (Stripe:PriceId del backend).
export const PRECIOS = {
  moneda: 'MXN',
  // Confirmar con el contador si los precios se publican con IVA incluido o "+ IVA"
  ivaIncluido: true,
  precioMensual: 299,
  // Debe coincidir con Suscripcion:DiasPrueba del backend
  diasPrueba: 7
}

export const esPendiente = (valor) => typeof valor === 'string' && valor.startsWith('[POR COMPLETAR')

export const dinero = (monto) =>
  Number(monto).toLocaleString('es-MX', { style: 'currency', currency: PRECIOS.moneda, maximumFractionDigits: 0 })
