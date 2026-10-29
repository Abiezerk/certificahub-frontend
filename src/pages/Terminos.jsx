import { Link } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import DatoNegocio from '../components/DatoNegocio'
import { PRECIOS, RESPONSABLE, dinero } from '../config/negocio'

// BORRADOR — debe revisarlo un abogado antes de publicarse en producción.
// Datos del responsable y precios: src/config/negocio.js
export const VERSION_TERMINOS = '2026-10-29'

export default function Terminos() {
  usePageMeta({
    titulo: 'Términos y condiciones',
    descripcion: 'Condiciones de uso de CertificaHub para instructores, instituciones y empresas.'
  })

  const iva = PRECIOS.ivaIncluido ? 'IVA incluido' : 'más IVA'

  return (
    <div className="page">
      <div className="container">
        <article className="legal">
          <h1>Términos y condiciones de uso</h1>
          <p className="legal-version">Última actualización: 15 de octubre de 2026</p>

          <h2>1. Quiénes somos y qué hace la plataforma</h2>
          <p>
            CertificaHub es operada por <DatoNegocio valor={RESPONSABLE.nombre} />, con domicilio en{' '}
            <DatoNegocio valor={RESPONSABLE.domicilio} />. Conecta a empresas con instructores de capacitación registrados
            ante la Secretaría del Trabajo y Previsión Social (STPS) y ofrece herramientas para programar cursos, generar
            constancias de competencias DC-3, aplicar evaluaciones de los participantes y verificar la autenticidad de las
            constancias.
          </p>
          <p>
            CertificaHub actúa como intermediario tecnológico: no imparte los cursos ni es parte de la relación de
            capacitación entre la empresa y el instructor.
          </p>

          <h2>2. Aceptación</h2>
          <p>
            Al crear una cuenta aceptas estos términos y el <Link to="/privacidad">Aviso de privacidad</Link>. Si no estás de
            acuerdo, no utilices la plataforma.
          </p>

          <h2>3. Tipos de cuenta</h2>
          <ul>
            <li>
              <strong>Instructor:</strong> persona física registrada ante la STPS como agente capacitador externo.
            </li>
            <li>
              <strong>Institución:</strong> persona moral registrada ante la STPS como agente capacitador, para la que
              trabajan instructores. No se contrata directamente: agrupa a sus instructores.
            </li>
            <li>
              <strong>Empresa:</strong> contrata cursos para su personal. Su uso de la plataforma es gratuito.
            </li>
          </ul>
          <p>
            Debes proporcionar información verdadera y actualizada, y eres responsable de mantener la confidencialidad de tu
            contraseña y de la actividad de tu cuenta.
          </p>

          <h2>4. Verificación ante la STPS</h2>
          <ul>
            <li>
              Los instructores y las instituciones deben verificar su registro de agente capacitador consultando con su RFC el
              padrón público de la STPS. Mientras no lo verifiquen no aparecen en el ranking y los instructores no pueden ser
              contratados.
            </li>
            <li>
              Un instructor solo puede ofrecer, impartir y emitir constancias de los cursos que tenga registrados ante la
              STPS. El nombre, la duración y el área temática de cada curso se toman del registro oficial.
            </li>
            <li>
              Revisamos periódicamente el padrón de la STPS. Si un registro deja de estar activo, la cuenta se suspende hasta
              que vuelva a estarlo; si un curso deja de aparecer, deja de ofrecerse.
            </li>
          </ul>

          <h2>5. Suscripción y pagos para instructores</h2>
          <ul>
            <li>
              <strong>Suscripción mensual:</strong> {dinero(PRECIOS.precioMensual)} {PRECIOS.moneda} al mes ({iva}), con
              constancias DC-3 ilimitadas.
            </li>
            <li>
              <strong>Prueba gratis:</strong> {PRECIOS.diasPrueba} días, una sola vez por instructor (y por RFC). Se activa
              después de verificar tu registro ante la STPS y requiere registrar una tarjeta. Si no cancelas antes de que
              termine la prueba, se realiza el primer cobro mensual de forma automática.
            </li>
            <li>
              El cobro es mensual y se renueva automáticamente con la tarjeta registrada. Los pagos se procesan a través de
              Stripe; CertificaHub no ve ni guarda los datos de tu tarjeta.
            </li>
            <li>
              Mientras tu suscripción no esté activa (prueba terminada sin pago, pago rechazado o suscripción cancelada), tu
              perfil no aparece en el ranking ni puede recibir nuevas contrataciones. Los cursos que ya tenías contratados
              puedes impartirlos y emitir sus constancias.
            </li>
            <li>
              Puedes cancelar tu suscripción en cualquier momento desde tu panel; seguirá activa hasta el final del periodo
              ya pagado y no se realizan reembolsos por periodos parciales.
            </li>
            <li>
              Los precios vigentes se publican en la <Link to="/precios">página de precios</Link>. Si cambian, te avisaremos
              con al menos 30 días de anticipación antes de aplicarlos a tu siguiente cobro.
            </li>
            <li>Si lo solicitas, emitimos la factura (CFDI) correspondiente a tus pagos.</li>
          </ul>

          <h2>6. Instructores</h2>
          <ul>
            <li>
              El instructor es el único responsable del contenido de sus cursos y de la veracidad de los datos que asienta en
              las constancias DC-3 que emite a través de la plataforma.
            </li>
            <li>
              Solo puede declarar que trabaja para una institución si realmente lo hace; la institución debe aprobarlo.
            </li>
          </ul>

          <h2>7. Instituciones</h2>
          <ul>
            <li>
              La institución solo debe aprobar a instructores que realmente trabajen con ella, ya que la calificación de sus
              instructores forma parte de la suya.
            </li>
            <li>Puede quitar a un instructor de su perfil en cualquier momento.</li>
          </ul>

          <h2>8. Empresas</h2>
          <ul>
            <li>
              La empresa es responsable de que los datos de sus trabajadores que proporciona para emitir constancias sean
              correctos y de contar con la autorización para compartirlos.
            </li>
            <li>
              Puede cancelar un curso contratado únicamente cuando falten más de 24 horas para su inicio. Un curso cancelado o
              completado no puede reactivarse.
            </li>
            <li>El pago del curso se acuerda directamente entre la empresa y el instructor.</li>
          </ul>

          <h2>9. Constancias DC-3</h2>
          <ul>
            <li>
              Los archivos de las constancias se eliminan automáticamente a los 5 días de generarse: el instructor y la
              empresa deben descargarlos y resguardarlos dentro de ese plazo.
            </li>
            <li>
              Cada constancia lleva un número de serie y un código QR que permite a cualquier persona verificar su
              autenticidad en <Link to="/verificar">la página de verificación</Link>. Una constancia emitida no se revoca y
              sigue siendo verificable aunque el instructor elimine su cuenta.
            </li>
          </ul>

          <h2>10. Evaluaciones</h2>
          <p>
            Las evaluaciones de los participantes son anónimas y alimentan la calificación pública de cada instructor y de su
            institución. Está prohibido manipularlas, por ejemplo, llenándolas en nombre de los participantes; detectar esta
            conducta es causa de suspensión de la cuenta.
          </p>

          <h2>11. Eliminación de la cuenta</h2>
          <p>
            Puedes eliminar tu cuenta desde tu panel, siempre que no tengas cursos pendientes, confirmados o en curso. Los
            efectos sobre tus datos se describen en el <Link to="/privacidad">Aviso de privacidad</Link>. Eliminar la cuenta no
            genera reembolsos de periodos ya pagados.
          </p>

          <h2>12. Propiedad intelectual</h2>
          <p>
            La plataforma, su marca y su diseño pertenecen a CertificaHub. Los materiales que cada instructor sube (por
            ejemplo, sus exámenes) siguen siendo suyos; nos autoriza a usarlos solo para prestar el servicio.
          </p>

          <h2>13. Limitación de responsabilidad</h2>
          <p>
            CertificaHub no garantiza la calidad de los cursos, el cumplimiento de los acuerdos entre empresas e
            instructores, ni la validez legal de las constancias emitidas por los instructores. La información del padrón de
            la STPS se muestra tal como la publica esa dependencia. La plataforma se ofrece “tal cual”, y procuramos que esté
            disponible de forma continua, sin garantizar que esté libre de interrupciones.
          </p>

          <h2>14. Cambios a estos términos</h2>
          <p>
            Podemos modificar estos términos. Los cambios se publicarán en esta página con su fecha de actualización; si son
            relevantes, te lo informaremos al iniciar sesión.
          </p>

          <h2>15. Ley aplicable y jurisdicción</h2>
          <p>
            Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia, las partes se
            someten a los tribunales competentes de {RESPONSABLE.jurisdiccion}, renunciando a cualquier otro fuero que
            pudiera corresponderles.
          </p>

          <h2>16. Contacto</h2>
          <p>
            Para dudas sobre estos términos escríbenos a <DatoNegocio valor={RESPONSABLE.correoContacto} />.
          </p>
        </article>
      </div>
    </div>
  )
}
