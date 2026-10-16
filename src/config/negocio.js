// ============================================================================
// DATOS DEL NEGOCIO — el único lugar que hay que editar si cambian.
// Los usan el Aviso de privacidad, los Términos y condiciones y la página de precios.
// Si más adelante el negocio pasa a una empresa (ej. S.A.S.), basta con cambiar "responsable".
// Los valores que empiezan con "[POR COMPLETAR" se muestran resaltados en amarillo en el sitio.
// ============================================================================

export const RESPONSABLE = {
  // "persona física" (hoy) o "persona moral" (si se constituye una empresa)
  tipo: 'persona física',
  nombre: '[POR COMPLETAR: tu nombre completo]',
  domicilio: '[POR COMPLETAR: calle, número, colonia, código postal, municipio y estado]',
  correoPrivacidad: '[POR COMPLETAR: correo para temas de privacidad, ej. privacidad@certificahub.mx]',
  correoContacto: '[POR COMPLETAR: correo de contacto general, ej. contacto@certificahub.mx]',
  sitio: 'certificahub.mx',
  // Tribunales para controversias (Términos y condiciones)
  jurisdiccion: 'Tijuana, Baja California'
}

// Dónde se guardan los datos (Microsoft Azure). Si se cambia de región, actualizar aquí.
export const ALOJAMIENTO = {
  proveedor: 'Microsoft Azure',
  region: 'West US 2',
  pais: 'Estados Unidos de América'
}

// Planes para instructores (las empresas usan CertificaHub sin costo)
export const PRECIOS = {
  moneda: 'MXN',
  // Confirmar con el contador si los precios se publican con IVA incluido o "+ IVA"
  ivaIncluido: true,
  planes: [
    {
      id: 'estandar',
      nombre: 'Estándar',
      precioMensual: 499,
      limiteDc3Mensual: 80,
      descripcion: 'Para instructores independientes con un volumen de cursos regular.'
    },
    {
      id: 'pro',
      nombre: 'Pro',
      precioMensual: 1200,
      limiteDc3Mensual: null, // ilimitado
      descripcion: 'Para instructores con mucho volumen o que capacitan a grupos grandes.'
    }
  ]
}

export const esPendiente = (valor) => typeof valor === 'string' && valor.startsWith('[POR COMPLETAR')

export const dinero = (monto) =>
  Number(monto).toLocaleString('es-MX', { style: 'currency', currency: PRECIOS.moneda, maximumFractionDigits: 0 })
