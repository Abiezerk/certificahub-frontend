import { Link } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import DatoNegocio from '../components/DatoNegocio'
import { ALOJAMIENTO, RESPONSABLE } from '../config/negocio'

// BORRADOR — debe revisarlo un abogado antes de publicarse en producción.
// Los datos del responsable se editan en src/config/negocio.js.
// Al cambiar el contenido de este aviso, actualizar VERSION_AVISO_PRIVACIDAD: el registro guarda qué
// versión aceptó cada usuario.
export const VERSION_AVISO_PRIVACIDAD = '2026-10-15.2'

export default function AvisoPrivacidad() {
  usePageMeta({
    titulo: 'Aviso de privacidad',
    descripcion: 'Cómo CertificaHub recaba, usa y protege los datos personales de instructores, instituciones, empresas y trabajadores.'
  })

  return (
    <div className="page">
      <div className="container">
        <article className="legal">
          <h1>Aviso de privacidad integral</h1>
          <p className="legal-version">Última actualización: 15 de octubre de 2026</p>

          <h2>1. Responsable de los datos personales</h2>
          <p>
            <DatoNegocio valor={RESPONSABLE.nombre} />, {RESPONSABLE.tipo}, con domicilio en{' '}
            <DatoNegocio valor={RESPONSABLE.domicilio} /> (en adelante, “CertificaHub”), es responsable del tratamiento de
            los datos personales que se recaban a través del sitio {RESPONSABLE.sitio} y de su plataforma, conforme a la Ley
            Federal de Protección de Datos Personales en Posesión de los Particulares y demás normativa aplicable.
          </p>
          <p>
            Para cualquier asunto relacionado con este aviso o con tus datos personales escribe a{' '}
            <DatoNegocio valor={RESPONSABLE.correoPrivacidad} />.
          </p>

          <h2>2. Datos personales que tratamos</h2>
          <ul>
            <li>
              <strong>Instructores:</strong> nombre, correo electrónico, teléfono, estado de la República, fotografía de
              perfil (opcional), biografía, RFC, especialidades, precios y datos de sus cursos.
            </li>
            <li>
              <strong>Instituciones capacitadoras:</strong> razón social, RFC, estado, descripción y nombre, correo y
              teléfono de la persona de contacto.
            </li>
            <li>
              <strong>Empresas:</strong> nombre y correo de la persona de contacto, razón social, RFC, domicilio fiscal,
              teléfono, nombre del área de recursos humanos y datos de los cursos que contratan.
            </li>
            <li>
              <strong>Trabajadores que reciben capacitación</strong> (los proporciona la empresa o el instructor para emitir
              la constancia DC-3): nombre completo, CURP, ocupación, puesto y el RFC de la empresa empleadora.
            </li>
            <li>
              <strong>Participantes que evalúan un curso:</strong> calificación y comentario anónimos y, solo si deciden
              darlo, su correo electrónico, que se guarda transformado de forma irreversible (nadie puede leerlo) únicamente
              para evitar evaluaciones duplicadas.
            </li>
            <li>
              <strong>Pagos y facturación de instructores:</strong> el plan contratado y el historial de pagos. Los datos de
              tu tarjeta los recibe y procesa directamente Stripe; CertificaHub nunca los ve ni los guarda. Si solicitas
              factura: RFC, nombre o razón social, régimen fiscal, código postal fiscal y uso del CFDI.
            </li>
            <li>
              <strong>Datos técnicos:</strong> dirección IP y datos de navegación necesarios para la seguridad del sitio.
            </li>
          </ul>
          <p>CertificaHub no solicita datos personales sensibles.</p>

          <h2>3. Datos que obtenemos del padrón público de la STPS</h2>
          <p>
            Para verificar que los instructores y las instituciones son agentes capacitadores registrados, consultamos con
            su RFC el Registro de Agentes Capacitadores Externos de la Secretaría del Trabajo y Previsión Social, que es una
            fuente de acceso público. De ahí obtenemos el nombre o razón social registrado, el estatus del registro, los
            cursos o programas registrados (nombre, área temática y duración) y, si existe, el correo electrónico registrado.
          </p>
          <ul>
            <li>
              Ese correo se usa <strong>únicamente</strong> para enviar un código de verificación, avisándote antes de
              hacerlo; no se conserva una vez terminada la verificación.
            </li>
            <li>
              Repetimos esta consulta periódicamente (aproximadamente cada mes) para mantener actualizados tu estatus y tus
              cursos.
            </li>
            <li>
              Si eliges la <strong>verificación manual</strong>, nos envías una identificación oficial y tu constancia de
              registro. Las revisa una persona administradora y se <strong>eliminan en cuanto termina la revisión</strong>,
              ya sea que se apruebe o se rechace.
            </li>
          </ul>

          <h2>4. Finalidades del tratamiento</h2>
          <p>Usamos tus datos únicamente para prestar el servicio:</p>
          <ul>
            <li>Crear y administrar tu cuenta e identificarte al iniciar sesión.</li>
            <li>Verificar tu registro como agente capacitador ante la STPS y mantenerlo actualizado.</li>
            <li>Mostrar el perfil público de instructores e instituciones y permitir que las empresas contraten a los instructores.</li>
            <li>Vincular a los instructores con las instituciones para las que trabajan, cuando ambos lo aprueban.</li>
            <li>Programar, dar seguimiento y cancelar cursos.</li>
            <li>Generar las constancias de competencias DC-3 y los exámenes con código QR de evaluación.</li>
            <li>Permitir que cualquier persona verifique la autenticidad de una constancia DC-3 mediante su número de serie.</li>
            <li>Calcular las calificaciones y estadísticas de instructores e instituciones.</li>
            <li>Cobrar a los instructores su plan y, si lo solicitan, emitir su factura.</li>
            <li>Proteger la seguridad de la plataforma y cumplir obligaciones legales y fiscales.</li>
          </ul>
          <p>No usamos tus datos para fines de mercadotecnia, publicidad ni prospección comercial.</p>

          <h2>5. Verificación pública de constancias DC-3</h2>
          <p>
            Cada constancia DC-3 lleva un código QR y un número de serie. Quien tenga ese número puede consultar en este sitio
            el nombre del trabajador, el curso, la duración, las fechas, el instructor, la empresa y la fecha de emisión,
            para comprobar que la constancia es auténtica. La CURP se muestra de forma parcial y nunca completa.
          </p>

          <h2>6. Con quién compartimos tus datos</h2>
          <ul>
            <li>
              Los datos de un curso se comparten solo entre la empresa que lo contrata, el instructor que lo imparte y, en su
              caso, la institución para la que trabaja ese instructor.
            </li>
            <li>
              Usamos proveedores que tratan datos por nuestra cuenta como encargados, solo para prestar el servicio:{' '}
              <strong>{ALOJAMIENTO.proveedor}</strong> (hospedaje, base de datos, archivos y envío de correos),{' '}
              <strong>Stripe</strong> (cobros con tarjeta) y <strong>Cloudflare</strong> (medición anónima de visitas).
            </li>
            <li>
              Los datos se almacenan en servidores de {ALOJAMIENTO.proveedor} ubicados en {ALOJAMIENTO.pais} (región{' '}
              {ALOJAMIENTO.region}). Stripe y Cloudflare también pueden tratarlos fuera de México.
            </li>
            <li>Podemos entregar datos a autoridades cuando una ley o una orden judicial lo exijan.</li>
            <li>No vendemos ni rentamos tus datos personales.</li>
          </ul>

          <h2>7. Cuánto tiempo conservamos los datos</h2>
          <ul>
            <li>
              <strong>Datos de pagos y facturación:</strong> 5 años, por las obligaciones fiscales que exige la ley.
            </li>
            <li>
              <strong>Registro de cada constancia DC-3</strong> (nombre del trabajador, curso, fechas, instructor, empresa y
              CURP parcial): se conserva de forma permanente para que la constancia siempre pueda verificarse. La CURP
              completa nunca se guarda.
            </li>
            <li>
              <strong>Archivos de las constancias DC-3:</strong> se eliminan automáticamente a los 5 días de generarse.
            </li>
            <li>
              <strong>Documentos de la verificación manual:</strong> se eliminan al terminar la revisión.
            </li>
            <li>
              <strong>Lo demás</strong> (datos de tu cuenta y perfil): mientras tu cuenta esté activa; se eliminan cuando
              eliminas tu cuenta, salvo lo que la ley obliga a conservar.
            </li>
          </ul>

          <h2>8. Eliminar tu cuenta</h2>
          <p>
            Puedes eliminar tu cuenta en cualquier momento desde tu panel. Al hacerlo borramos tu correo, teléfono, foto,
            biografía y demás datos de tu perfil, y ya no podrás iniciar sesión. Se conservan las constancias DC-3 que
            emitiste (con tu nombre tal como quedó impreso en ellas, para que sigan siendo verificables), el historial de
            cursos y lo que la ley obliga a conservar.
          </p>

          <h2>9. Menores de edad</h2>
          <p>
            CertificaHub no está dirigido a menores de edad y sus cuentas son solo para personas adultas. Si una empresa
            capacita a trabajadores de 15 a 17 años, como lo permite la legislación laboral, la empresa es responsable de
            contar con las autorizaciones y el consentimiento que correspondan para proporcionar sus datos.
          </p>

          <h2>10. Tus derechos (ARCO) y revocación del consentimiento</h2>
          <p>
            Tienes derecho a acceder a tus datos, rectificarlos, cancelarlos u oponerte a su tratamiento (derechos ARCO), así
            como a revocar tu consentimiento. Para ejercerlos, escribe a <DatoNegocio valor={RESPONSABLE.correoPrivacidad} />{' '}
            con tu nombre, un medio para responderte, una copia de tu identificación, la descripción clara de lo que
            solicitas y cualquier documento que facilite localizar tus datos. Te responderemos en un plazo máximo de 20 días
            hábiles. Ten en cuenta que, si revocas el consentimiento para finalidades necesarias, no podremos seguir
            prestándote el servicio.
          </p>

          <h2>11. Tecnologías de rastreo</h2>
          <p>
            Este sitio no utiliza cookies de publicidad ni de seguimiento. Guardamos en tu navegador únicamente la
            información necesaria para mantener tu sesión iniciada. Para medir visitas usamos Cloudflare Web Analytics, que
            no usa cookies ni identifica a las personas. Las tipografías del sitio se sirven desde nuestros propios
            servidores, sin enviar tus datos a terceros.
          </p>

          <h2>12. Cambios a este aviso</h2>
          <p>
            Cualquier cambio a este aviso se publicará en esta misma página, indicando la fecha de la última actualización.
            Si el cambio es relevante, te lo informaremos al iniciar sesión.
          </p>

          <p className="legal-volver">
            Consulta también los <Link to="/terminos">Términos y condiciones</Link>.
          </p>
        </article>
      </div>
    </div>
  )
}
