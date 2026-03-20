import { base44 } from "@base44/sdk";

/**
 * Webhook que se dispara cuando un usuario completa un curso
 * Se ejecuta automáticamente cuando el estado de Enrollment cambia a 'completed'
 */
export default async function onCourseCompleted(data) {
  const { entity_type, action, record } = data;

  // Verificar que sea una actualización de Enrollment
  if (entity_type !== "Enrollment" || action !== "update") {
    return;
  }

  // Verificar que el estado sea 'completed'
  if (record.status !== "completed") {
    return;
  }

  try {
    // Llamar a la función de envío de email
    await base44.functions.sendCourseCompletionEmail({
      enrollment_id: record.id,
      user_email: record.user_email,
      course_id: record.course_id
    });

    // Crear una notificación en la app
    await base44.asServiceRole.entities.Notification.create({
      user_email: record.user_email,
      type: "course_completed",
      title: "Curso Completado",
      message: `Has completado un curso exitosamente`,
      related_entity_id: record.course_id,
      read: false
    });

    console.log(`Email enviado a ${record.user_email} por completar curso ${record.course_id}`);
  } catch (error) {
    console.error("Error en onCourseCompleted:", error);
  }
}