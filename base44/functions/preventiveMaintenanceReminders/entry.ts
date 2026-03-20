import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Scheduled function: runs daily to check equipment needing preventive maintenance.
 * - Sends in-app notification + email for equipment due in 7 days or overdue.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled (no user) or admin-only manual trigger
    let isScheduled = false;
    try {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        return Response.json({ error: 'Solo admins' }, { status: 403 });
      }
    } catch {
      isScheduled = true; // scheduled calls don't have a user
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);

    const todayStr = today.toISOString().split('T')[0];
    const in7DaysStr = in7Days.toISOString().split('T')[0];

    const equipment = await base44.asServiceRole.entities.Equipment.list();
    const allUsers = await base44.asServiceRole.entities.User.list();
    const admins = allUsers.filter(u => u.role === 'admin');

    const overdue = equipment.filter(e => e.fecha_proxima_mantencion && e.fecha_proxima_mantencion < todayStr && e.status !== 'fuera_servicio');
    const dueSoon = equipment.filter(e => e.fecha_proxima_mantencion && e.fecha_proxima_mantencion >= todayStr && e.fecha_proxima_mantencion <= in7DaysStr);

    let notificationsSent = 0;

    // Notify admins about overdue
    if (overdue.length > 0) {
      const list = overdue.map(e => `• ${e.nombre} (${e.numero_interno}) - venció: ${e.fecha_proxima_mantencion}`).join('\n');
      await Promise.all(admins.map(async (admin) => {
        await base44.asServiceRole.entities.Notification.create({
          user_email: admin.email,
          type: 'maintenance_overdue',
          title: `⚠️ ${overdue.length} mantención(es) vencida(s)`,
          message: `Los siguientes equipos tienen mantención vencida:\n${list}`,
          metadata: { equipment_ids: overdue.map(e => e.id) }
        });

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: admin.email,
          subject: `⚠️ Alerta: ${overdue.length} mantención(es) vencida(s)`,
          body: `<p>Estimado/a ${admin.full_name || admin.email},</p>
            <p>Los siguientes equipos tienen <strong>mantención preventiva vencida</strong>:</p>
            <ul>${overdue.map(e => `<li><strong>${e.nombre}</strong> (${e.numero_interno}) - Fecha vencida: ${e.fecha_proxima_mantencion}</li>`).join('')}</ul>
            <p>Por favor, programa las mantenciones lo antes posible.</p>`
        });
        notificationsSent++;
      }));
    }

    // Notify admins about due soon
    if (dueSoon.length > 0) {
      const list = dueSoon.map(e => `• ${e.nombre} (${e.numero_interno}) - próxima: ${e.fecha_proxima_mantencion}`).join('\n');
      await Promise.all(admins.map(async (admin) => {
        await base44.asServiceRole.entities.Notification.create({
          user_email: admin.email,
          type: 'maintenance_reminder',
          title: `🔔 ${dueSoon.length} mantención(es) en los próximos 7 días`,
          message: `Los siguientes equipos requieren mantención próximamente:\n${list}`,
          metadata: { equipment_ids: dueSoon.map(e => e.id) }
        });
        notificationsSent++;
      }));
    }

    return Response.json({
      success: true,
      overdue: overdue.length,
      due_soon: dueSoon.length,
      notifications_sent: notificationsSent
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});