import { Link } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'

// BORRADOR — debe revisarlo un abogado antes de publicarse en producción.
export const VERSION_TERMINOS = '2026-10-15'

function Pendiente({ children }) {
  return <mark className="legal-pendiente">[POR COMPLETAR: {children}]</mark>
}

export default function Terminos() {
  usePageMeta({
    titulo: 'Términos y condiciones',
    descripcion: 'Condiciones de uso de CertificaHub para instructores y empresas.'
  })

  return (
    <div className="page">
      <div className="container">
        <article className="legal">
          <h1>Términos y condiciones de uso</h1>
          <p className="legal-version">Última actualización: 15 de octubre de 2026</p>

          <h2>1. Quiénes somos y qué hace la plataforma</h2>
          <p>
            CertificaHub es una plataforma operada por <Pendiente>nombre o razón social</Pendiente>, con domicilio en{' '}
            <Pendiente>domicilio completo</Pendiente>, que conecta a empresas con instructores de capacitación, y ofrece
            herramientas para programar cursos, generar constancias de competencias DC-3, aplicar evaluaciones de los
            participantes y verificar la autenticidad de las constancias.
          </p>
          <p>
            CertificaHub actúa como intermediario tecnológico: no imparte los cursos ni es parte de la relación de
            capacitación entre la empresa y el instructor.
          </p>

          <h2>2. Aceptación</h2>
          <p>
            Al crear una cuenta aceptas estos términos y el <Link to="/privacidad">Aviso de privacidad</Link>. Si no estás
            de acuerdo, no utilices la plataforma.
          </p>

          <h2>3. Cuentas</h2>
          <ul>
            <li>Debes proporcionar información verdadera, completa y actualizada.</li>
            <li>Eres responsable de mantener la confidencialidad de tu contraseña y de la actividad de tu cuenta.</li>
            <li>Podemos suspender cuentas que incumplan estos términos o se usen de forma fraudulenta.</li>
          </ul>

          <h2>4. Instructores</h2>
          <ul>
            <li>
              El instructor declara contar con las autorizaciones necesarias para impartir capacitación y emitir
              constancias DC-3, incluyendo su registro como agente capacitador ante la Secretaría del Trabajo y Previsión
              Social cuando la normativa lo requiera.
            </li>
            <li>
              El instructor es el único responsable del contenido de sus cursos y de la veracidad de los datos que asienta
              en las constancias DC-3 que emite a través de la plataforma.
            </li>
            <li>
              El uso de la plataforma por parte de los instructores tiene un costo, conforme a las tarifas vigentes
              publicadas en <Pendiente>dónde se publicarán las tarifas y la forma de pago</Pendiente>.
            </li>
          </ul>

          <h2>5. Empresas</h2>
          <ul>
            <li>El uso de la plataforma es gratuito para las empresas.</li>
            <li>
              La empresa es responsable de que los datos de sus trabajadores que proporciona para emitir constancias sean
              correctos y de contar con la autorización para compartirlos.
            </li>
            <li>
              La empresa puede cancelar un curso contratado únicamente cuando falten más de 24 horas para su inicio. Un
              curso cancelado o completado no puede reactivarse.
            </li>
            <li>
              El pago del curso se acuerda directamente entre la empresa y el instructor, salvo que la plataforma indique
              otra cosa.
            </li>
          </ul>

          <h2>6. Constancias DC-3</h2>
          <ul>
            <li>
              Los archivos de las constancias se eliminan automáticamente a los 5 días de generarse: el instructor y la
              empresa deben descargarlos y resguardarlos dentro de ese plazo.
            </li>
            <li>
              Cada constancia lleva un número de serie y un código QR que permite a cualquier persona verificar su
              autenticidad en <Link to="/verificar">la página de verificación</Link>. Una constancia emitida no se revoca.
            </li>
          </ul>

          <h2>7. Evaluaciones</h2>
          <p>
            Las evaluaciones de los participantes son anónimas y alimentan la calificación pública de cada instructor.
            Está prohibido manipularlas, por ejemplo, llenándolas en nombre de los participantes. Detectar esta conducta es
            causa de suspensión de la cuenta.
          </p>

          <h2>8. Propiedad intelectual</h2>
          <p>
            La plataforma, su marca y su diseño pertenecen a CertificaHub. Los materiales que cada instructor sube (por
            ejemplo, sus exámenes) siguen siendo suyos; nos autoriza a usarlos solo para prestar el servicio.
          </p>

          <h2>9. Limitación de responsabilidad</h2>
          <p>
            CertificaHub no garantiza la calidad de los cursos, el cumplimiento de los acuerdos entre empresas e
            instructores, ni la validez legal de las constancias emitidas por los instructores. La plataforma se ofrece
            “tal cual”, y procuramos que esté disponible de forma continua, sin garantizar que esté libre de
            interrupciones.
          </p>

          <h2>10. Cambios a estos términos</h2>
          <p>
            Podemos modificar estos términos. Los cambios se publicarán en esta página con su fecha de actualización; si
            son relevantes, te lo informaremos al iniciar sesión.
          </p>

          <h2>11. Ley aplicable y jurisdicción</h2>
          <p>
            Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia, las partes
            se someten a los tribunales competentes de <Pendiente>ciudad y estado</Pendiente>, renunciando a cualquier otro
            fuero que pudiera corresponderles.
          </p>

          <h2>12. Contacto</h2>
          <p>
            Para dudas sobre estos términos escríbenos a <Pendiente>correo de contacto</Pendiente>.
          </p>
        </article>
      </div>
    </div>
  )
}
