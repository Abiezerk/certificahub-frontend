import { Link } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'

// BORRADOR — debe revisarlo un abogado antes de publicarse en producción.
// Los datos marcados con <Pendiente> los completa el titular del negocio.
export const VERSION_AVISO_PRIVACIDAD = '2026-10-15'

function Pendiente({ children }) {
  return <mark className="legal-pendiente">[POR COMPLETAR: {children}]</mark>
}

export default function AvisoPrivacidad() {
  usePageMeta({
    titulo: 'Aviso de privacidad',
    descripcion: 'Cómo CertificaHub recaba, usa y protege los datos personales de instructores, empresas y trabajadores.'
  })

  return (
    <div className="page">
      <div className="container">
        <article className="legal">
          <h1>Aviso de privacidad integral</h1>
          <p className="legal-version">Última actualización: 15 de octubre de 2026</p>

          <h2>1. Responsable de los datos personales</h2>
          <p>
            <Pendiente>nombre o razón social del titular de CertificaHub</Pendiente> (en adelante, “CertificaHub”), con
            domicilio en <Pendiente>domicilio completo</Pendiente>, es responsable del tratamiento de los datos personales
            que se recaban a través del sitio <Pendiente>certificahub.mx</Pendiente> y de su plataforma, conforme a la Ley
            Federal de Protección de Datos Personales en Posesión de los Particulares y demás normativa aplicable.
          </p>
          <p>
            Para cualquier asunto relacionado con este aviso, puedes escribir a{' '}
            <Pendiente>correo de contacto de privacidad</Pendiente>.
          </p>

          <h2>2. Datos personales que recabamos</h2>
          <p>Según cómo uses la plataforma, recabamos los siguientes datos:</p>
          <ul>
            <li>
              <strong>Instructores:</strong> nombre, correo electrónico, teléfono, estado de la República, fotografía de
              perfil (opcional), biografía, especialidades, precios y datos de sus cursos.
            </li>
            <li>
              <strong>Empresas:</strong> nombre y correo de la persona de contacto, razón social, RFC, domicilio fiscal,
              teléfono, nombre del área de recursos humanos y datos de los cursos que contratan.
            </li>
            <li>
              <strong>Trabajadores que reciben capacitación</strong> (los proporciona la empresa o el instructor para
              emitir la constancia DC-3): nombre completo, CURP, ocupación, puesto y el RFC de la empresa empleadora.
            </li>
            <li>
              <strong>Participantes que evalúan un curso:</strong> calificación y comentario anónimos y, solo si deciden
              darlo, su correo electrónico, que se guarda transformado de forma irreversible (nadie puede leerlo)
              únicamente para evitar evaluaciones duplicadas.
            </li>
            <li>
              <strong>Datos técnicos:</strong> dirección IP y datos de navegación necesarios para la seguridad del sitio.
            </li>
          </ul>
          <p>CertificaHub no solicita datos personales sensibles.</p>

          <h2>3. Finalidades del tratamiento</h2>
          <p>
            <strong>Finalidades necesarias</strong> (sin ellas no podemos prestar el servicio):
          </p>
          <ul>
            <li>Crear y administrar tu cuenta e identificarte al iniciar sesión.</li>
            <li>Mostrar el perfil público de los instructores y permitir que las empresas los contraten.</li>
            <li>Programar, dar seguimiento y cancelar cursos.</li>
            <li>Generar las constancias de competencias DC-3 y los exámenes con código QR de evaluación.</li>
            <li>
              Permitir que cualquier persona verifique la autenticidad de una constancia DC-3 mediante su número de serie.
            </li>
            <li>Calcular la calificación y las estadísticas de los instructores.</li>
            <li>Cobrar a los instructores el servicio de la plataforma, cuando aplique.</li>
            <li>Proteger la seguridad de la plataforma y cumplir obligaciones legales.</li>
          </ul>
          <p>
            <strong>Finalidades secundarias</strong> (puedes negarte sin que afecte el servicio): enviarte novedades y
            mejoras de la plataforma. Si no deseas que tus datos se usen para esto, escríbenos al correo indicado en la
            sección 1.
          </p>

          <h2>4. Verificación pública de constancias DC-3</h2>
          <p>
            Cada constancia DC-3 lleva un código QR y un número de serie. Quien tenga ese número puede consultar en este
            sitio el nombre del trabajador, el curso, la duración, las fechas, el instructor, la empresa y la fecha de
            emisión, para comprobar que la constancia es auténtica. La CURP se muestra de forma parcial y nunca completa.
          </p>

          <h2>5. Conservación de los datos</h2>
          <p>
            Los archivos de las constancias DC-3 se eliminan automáticamente de nuestro almacenamiento a los 5 días de
            generarse; el registro de la constancia (sin la CURP completa) se conserva para permitir su verificación.
            Los demás datos se conservan mientras la cuenta esté activa y durante el tiempo que exijan las disposiciones
            legales aplicables.
          </p>

          <h2>6. Transferencias y encargados</h2>
          <ul>
            <li>
              Los datos de un curso se comparten entre la empresa que lo contrata y el instructor que lo imparte, en la
              medida necesaria para prestar el servicio.
            </li>
            <li>
              Utilizamos servicios de terceros que tratan datos por nuestra cuenta como encargados: Microsoft Azure
              (hospedaje, base de datos y almacenamiento de archivos) y Cloudflare (medición anónima de visitas). Estos
              proveedores pueden almacenar información fuera de México.
            </li>
            <li>No vendemos ni rentamos tus datos personales.</li>
          </ul>

          <h2>7. Derechos ARCO y revocación del consentimiento</h2>
          <p>
            Tienes derecho a acceder a tus datos, rectificarlos, cancelarlos u oponerte a su tratamiento (derechos ARCO),
            así como a revocar tu consentimiento. Para ejercerlos, envía una solicitud a{' '}
            <Pendiente>correo de contacto de privacidad</Pendiente> con tu nombre, un medio para responderte, una copia de
            tu identificación, la descripción clara de lo que solicitas y cualquier documento que facilite localizar tus
            datos. Responderemos en un plazo máximo de 20 días hábiles.
          </p>

          <h2>8. Tecnologías de rastreo</h2>
          <p>
            Este sitio no utiliza cookies de publicidad ni de seguimiento. Guardamos en tu navegador únicamente la
            información necesaria para mantener tu sesión iniciada. Para medir visitas usamos Cloudflare Web Analytics,
            que no usa cookies ni identifica a las personas.
          </p>

          <h2>9. Cambios a este aviso</h2>
          <p>
            Cualquier cambio a este aviso de privacidad se publicará en esta misma página, indicando la fecha de la
            última actualización.
          </p>

          <p className="legal-volver">
            Consulta también los <Link to="/terminos">Términos y condiciones</Link>.
          </p>
        </article>
      </div>
    </div>
  )
}
