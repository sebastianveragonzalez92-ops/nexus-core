import { base44 } from "@base44/sdk";

export default async function sendCourseCompletionEmail(data) {
  const { enrollment_id, user_email, course_id } = data;

  try {
    // Obtener detalles del curso
    const course = await base44.asServiceRole.entities.Course.read(course_id);
    
    // Obtener detalles del usuario
    const user = await base44.asServiceRole.entities.User.list();
    const userData = user.find(u => u.email === user_email);

    if (!course || !userData) {
      throw new Error("Curso o usuario no encontrado");
    }

    // Enviar email
    await base44.integrations.Core.SendEmail({
      to: user_email,
      subject: `¡Felicidades! Completaste el curso: ${course.title}`,
      body: `
        <h2>¡Excelente trabajo, ${userData.full_name}!</h2>
        <p>Has completado exitosamente el curso <strong>${course.title}</strong>.</p>
        <p>Tu dedicación y esfuerzo son reconocidos. Continúa aprendiendo con nuestros próximos cursos.</p>
        <p>Puedes acceder a tu certificado desde la sección "Mis Cursos".</p>
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