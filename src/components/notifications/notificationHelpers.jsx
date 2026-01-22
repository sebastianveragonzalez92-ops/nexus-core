import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

/**
 * Utility functions to create notifications for different events
 */

export const notifyNewCourse = async (course, allUsers) => {
  const notifications = allUsers.map(user => ({
    user_email: user.email,
    type: 'new_course',
    title: 'Nuevo Curso Disponible',
    message: `"${course.title}" está ahora disponible para inscripción`,
    action_url: createPageUrl('CourseDetail') + `?id=${course.id}`,
    metadata: { course_id: course.id },
  }));

  await base44.entities.Notification.bulkCreate(notifications);
};

export const notifyCourseUpdate = async (course, enrolledUsers) => {
  const notifications = enrolledUsers.map(user => ({
    user_email: user.email,
    type: 'course_update',
    title: 'Curso Actualizado',
    message: `El curso "${course.title}" ha sido actualizado con nuevo contenido`,
    action_url: createPageUrl('CourseDetail') + `?id=${course.id}`,
    metadata: { course_id: course.id },
  }));

  await base44.entities.Notification.bulkCreate(notifications);
};

export const notifyForumReply = async (originalPost, reply, originalAuthorEmail) => {
  if (reply.user_email === originalAuthorEmail) return; // Don't notify self
  
  await base44.entities.Notification.create({
    user_email: originalAuthorEmail,
    type: 'forum_reply',
    title: 'Nueva Respuesta en el Foro',
    message: `${reply.user_name} respondió a tu publicación: "${originalPost.content.substring(0, 50)}..."`,
    action_url: createPageUrl('CourseDetail') + `?id=${originalPost.course_id}`,
    metadata: { 
      post_id: originalPost.id, 
      reply_id: reply.id,
      course_id: originalPost.course_id 
    },
  });
};

export const notifyQuizDeadline = async (quiz, enrollment, daysUntilDeadline) => {
  await base44.entities.Notification.create({
    user_email: enrollment.user_email,
    type: 'quiz_deadline',
    title: 'Recordatorio de Quiz',
    message: `Tienes ${daysUntilDeadline} días para completar el quiz "${quiz.title}"`,
    action_url: createPageUrl('CourseDetail') + `?id=${enrollment.course_id}`,
    metadata: { 
      quiz_id: quiz.id, 
      course_id: enrollment.course_id 
    },
  });
};

export const notifyDirectMessage = async (recipientEmail, senderName, message) => {
  await base44.entities.Notification.create({
    user_email: recipientEmail,
    type: 'direct_message',
    title: `Mensaje de ${senderName}`,
    message: message.substring(0, 100),
    action_url: createPageUrl('Messages'), // Future feature
    metadata: { sender_name: senderName },
  });
};

export const notifyEnrollmentConfirmation = async (userEmail, course) => {
  await base44.entities.Notification.create({
    user_email: userEmail,
    type: 'general',
    title: 'Inscripción Exitosa',
    message: `Te has inscrito exitosamente en "${course.title}"`,
    action_url: createPageUrl('CourseDetail') + `?id=${course.id}`,
    metadata: { course_id: course.id },
  });
};

export const notifyCourseCompletion = async (userEmail, course, score) => {
  await base44.entities.Notification.create({
    user_email: userEmail,
    type: 'general',
    title: '¡Curso Completado!',
    message: `Has completado "${course.title}" con un puntaje de ${score}%`,
    action_url: createPageUrl('MyCourses'),
    metadata: { course_id: course.id, score },
  });
};

export const notifyCertificateIssued = async (userEmail, course, certificateId) => {
  await base44.entities.Notification.create({
    user_email: userEmail,
    type: 'general',
    title: 'Certificado Emitido',
    message: `Tu certificado para "${course.title}" está listo`,
    action_url: createPageUrl('MyCourses'),
    metadata: { 
      course_id: course.id, 
      certificate_id: certificateId 
    },
  });
};

// Notificaciones para módulos específicos
export const notifySpecializedCourseAvailable = async (userEmail, courseName, courseType) => {
  const messages = {
    conduccion: `Curso de Conducción Segura disponible. Inscríbete ahora.`,
    extintores: `Curso de Manejo de Extintores disponible. Capacitación obligatoria.`,
    altura: `Curso de Trabajo en Altura disponible. Certificación requerida.`,
    default: `Nuevo curso especializado "${courseName}" disponible.`
  };

  await base44.entities.Notification.create({
    user_email: userEmail,
    type: 'new_course',
    title: 'Curso Especializado Disponible',
    message: messages[courseType] || messages.default,
    action_url: createPageUrl('Courses'),
    metadata: { course_type: courseType, course_name: courseName },
  });
};

export const notifyMandatoryCourseReminder = async (userEmail, courseName, daysRemaining) => {
  await base44.entities.Notification.create({
    user_email: userEmail,
    type: 'quiz_deadline',
    title: 'Curso Obligatorio Pendiente',
    message: `Tienes ${daysRemaining} días para completar "${courseName}"`,
    action_url: createPageUrl('MyCourses'),
    metadata: { course_name: courseName, days_remaining: daysRemaining },
  });
};

// Notificaciones para exámenes ocupacionales
export const notifyExamExpiring = async (userEmail, examName, daysUntilExpiry) => {
  await base44.entities.Notification.create({
    user_email: userEmail,
    type: 'quiz_deadline',
    title: 'Examen Ocupacional Próximo a Vencer',
    message: `Tu ${examName} vence en ${daysUntilExpiry} días. Programa tu renovación.`,
    action_url: createPageUrl('Dashboard'),
    metadata: { exam_name: examName, days_until_expiry: daysUntilExpiry },
  });
};

export const notifyExamExpired = async (userEmail, examName) => {
  await base44.entities.Notification.create({
    user_email: userEmail,
    type: 'quiz_deadline',
    title: 'Examen Ocupacional Vencido',
    message: `Tu ${examName} ha vencido. Debes renovarlo inmediatamente.`,
    action_url: createPageUrl('Dashboard'),
    metadata: { exam_name: examName, status: 'expired' },
  });
};

export const notifyExamScheduled = async (userEmail, examName, examDate) => {
  await base44.entities.Notification.create({
    user_email: userEmail,
    type: 'general',
    title: 'Examen Ocupacional Programado',
    message: `Tu ${examName} está programado para el ${new Date(examDate).toLocaleDateString('es-ES')}`,
    action_url: createPageUrl('Dashboard'),
    metadata: { exam_name: examName, exam_date: examDate },
  });
};