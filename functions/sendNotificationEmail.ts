import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    console.log('📧 sendNotificationEmail: INICIANDO');
    console.log('📧 event:', event);
    console.log('📧 data:', data);

    // Solo procesar cuando se crea una notificación
    if (event.type !== 'create') {
      console.log('⏭️ Ignorando evento:', event.type);
      return Response.json({ skipped: true });
    }

    const notification = data;

    if (!notification?.user_email) {
      console.error('❌ No hay email en la notificación');
      return Response.json({ error: 'No user_email' }, { status: 400 });
    }

    console.log('📧 Enviando email a:', notification.user_email);

    // Enviar email usando integración Core
    const emailResult = await base44.integrations.Core.SendEmail({
      to: notification.user_email,
      subject: notification.title || 'Nueva Notificación',
      body: `
        <h2>${notification.title}</h2>
        <p>${notification.message}</p>
        ${notification.action_url ? `<p><a href="${notification.action_url}">Ver más</a></p>` : ''}
      `,
      from_name: 'ModulaX',
    });

    console.log('✅ Email enviado exitosamente');
    console.log('📧 Resultado:', emailResult);

    return Response.json({ success: true, result: emailResult });
  } catch (error) {
    console.error('❌ Error en sendNotificationEmail:', error);
    console.error('❌ Detalles:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});