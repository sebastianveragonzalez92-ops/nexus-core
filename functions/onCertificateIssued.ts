import { base44 } from "@base44/sdk";

/**
 * Webhook que se dispara cuando se emite un certificado
 * Se ejecuta automáticamente cuando se crea un registro en Certificate
 */
export default async function onCertificateIssued(data) {
  const { entity_type, action, record } = data;

  // Verificar que sea una creación de Certificate
  if (entity_type !== "Certificate" || action !== "create") {
    return;
  }

  try {
    // Llamar a la función de envío de email
    await base44.functions.sendCertificateEmail({
      certificate_id: record.id,
      user_email: record.user_email,
      course_id: record.course_id
    });

    // Crear una notificación en la app
    await base44.asServiceRole.entities.Notification.create({
      user_email: record.user_email,
      type: "certificate_issued",
      title: "Nuevo Certificado",
      message: `Has obtenido un nuevo certificado`,
      related_entity_id: record.id,
      read: false
    });

    console.log(`Email enviado a ${record.user_email} por certificado ${record.certificate_number}`);
  } catch (error) {
    console.error("Error en onCertificateIssued:", error);
  }
}