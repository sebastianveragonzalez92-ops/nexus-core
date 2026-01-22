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