import { base44 } from "@base44/sdk";

export default async function sendCertificateEmail(data) {
  const { certificate_id, user_email, course_id } = data;

  try {
    // Obtener detalles del certificado y curso
    const certificate = await base44.asServiceRole.entities.Certificate.read(certificate_id);
    const course = await base44.asServiceRole.entities.Course.read(course_id);
    
    // Obtener detalles del usuario
    const users = await base44.asServiceRole.entities.User.list();
    const userData = users.find(u => u.email === user_email);

    if (!certificate || !course || !userData) {
      throw new Error("Certificado, curso o usuario no encontrado");
    }

    // Enviar email
    await base44.integrations.Core.SendEmail({
      to: user_email,
      subject: `🎉 Certificado Obtenido: ${course.title}`,
      body: `
        <h2>¡Felicidades, ${userData.full_name}!</h2>
        <p>Te complace comunicamos que has obtenido tu certificado en <strong>${course.title}</strong>.</p>
        <p><strong>Detalles del Certificado:</strong></p>
        <ul>
          <li>Número de Certificado: ${certificate.certificate_number}</li>
          <li>Calificación: ${certificate.score}%</li>
          <li>Fecha de Emisión: ${new Date(certificate.issued_date).toLocaleDateString('es-ES')}</li>
          ${certificate.expiry_date ? `<li>Válido hasta: ${new Date(certificate.expiry_date).toLocaleDateString('es-ES')}</li>` : ''}
        </ul>
        <p>Puedes descargar tu certificado desde la sección "Certificados" de tu perfil.</p>
        <br>
        <p>Saludos,<br>El equipo de ModulaX</p>
      `
    });

    return { success: true, message: "Email enviado correctamente" };
  } catch (error) {
    console.error("Error al enviar email:", error);
    return { success: false, error: error.message };
  }
}