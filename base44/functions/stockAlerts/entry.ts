import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both authenticated calls and service-role scheduled calls
    let callerIsAdmin = false;
    try {
      const user = await base44.auth.me();
      callerIsAdmin = user?.role === 'admin';
    } catch {
      // Called from scheduler (no user context) — allow via service role
    }

    // Fetch all active spare parts
    const parts = await base44.asServiceRole.entities.SparePart.filter({ activo: true });

    // Filter those at or below minimum
    const alertParts = parts.filter(p =>
      typeof p.stock_actual === 'number' &&
      typeof p.stock_minimo === 'number' &&
      p.stock_actual <= p.stock_minimo
    );

    if (alertParts.length === 0) {
      return Response.json({ ok: true, alerts: 0, message: 'No hay repuestos con stock crítico.' });
    }

    // Get all admin users to notify
    const allUsers = await base44.asServiceRole.entities.User.filter({});
    const adminUsers = allUsers.filter(u => u.role === 'admin');

    const results = { notified: 0, emails_sent: 0, already_notified: [] };

    for (const part of alertParts) {
      const isOutOfStock = part.stock_actual === 0;
      const title = isOutOfStock
        ? `⚠️ Sin Stock: ${part.name}`
        : `🔶 Stock Bajo: ${part.name}`;
      const message = isOutOfStock
        ? `El repuesto "${part.name}" (${part.code}) está SIN STOCK. Stock actual: 0 ${part.unit || 'unidades'}.`
        : `El repuesto "${part.name}" (${part.code}) tiene stock bajo el mínimo. Actual: ${part.stock_actual}, Mínimo: ${part.stock_minimo} ${part.unit || 'unidades'}.`;

      // Create in-app notification for each admin (avoid duplicates: check last 24h)
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const existing = await base44.asServiceRole.entities.Notification.filter({
        type: 'general',
      });
      const recentForPart = existing.filter(n =>
        n.metadata?.spare_part_id === part.id &&
        n.created_date > since
      );

      if (recentForPart.length === 0) {
        // Create notifications for all admins
        const notifications = adminUsers.map(u => ({
          user_email: u.email,
          type: 'general',
          title,
          message,
          action_url: '/SpareParts',
          metadata: {
            spare_part_id: part.id,
            spare_part_code: part.code,
            stock_actual: part.stock_actual,
            stock_minimo: part.stock_minimo,
            alert_type: isOutOfStock ? 'out_of_stock' : 'low_stock',
          },
        }));
        await base44.asServiceRole.entities.Notification.bulkCreate(notifications);
        results.notified += 1;

        // Send email to admins
        for (const admin of adminUsers) {
          const emailBody = `
<h2 style="color:#dc2626;">Alerta de Stock - ${isOutOfStock ? 'SIN STOCK' : 'STOCK BAJO'}</h2>
<p>${message}</p>
<table style="border-collapse:collapse;width:100%;margin-top:12px;">
  <tr><td style="padding:6px 12px;background:#f1f5f9;font-weight:600;">Repuesto</td><td style="padding:6px 12px;">${part.name}</td></tr>
  <tr><td style="padding:6px 12px;background:#f1f5f9;font-weight:600;">Código</td><td style="padding:6px 12px;">${part.code}</td></tr>
  <tr><td style="padding:6px 12px;background:#f1f5f9;font-weight:600;">Stock Actual</td><td style="padding:6px 12px;color:${isOutOfStock ? '#dc2626' : '#ea580c'};font-weight:700;">${part.stock_actual}</td></tr>
  <tr><td style="padding:6px 12px;background:#f1f5f9;font-weight:600;">Stock Mínimo</td><td style="padding:6px 12px;">${part.stock_minimo}</td></tr>
  ${part.ubicacion ? `<tr><td style="padding:6px 12px;background:#f1f5f9;font-weight:600;">Ubicación</td><td style="padding:6px 12px;">${part.ubicacion}</td></tr>` : ''}
  ${part.proveedor ? `<tr><td style="padding:6px 12px;background:#f1f5f9;font-weight:600;">Proveedor</td><td style="padding:6px 12px;">${part.proveedor}</td></tr>` : ''}
</table>
<p style="margin-top:16px;">
  <a href="/SpareParts" style="background:#4f46e5;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
    Ver Inventario de Repuestos
  </a>
</p>
          `.trim();

          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: admin.email,
              subject: `[Alerta Repuestos] ${title}`,
              body: emailBody,
            });
            results.emails_sent += 1;
          } catch (e) {
            // Email sending failed, continue
          }
        }
      } else {
        results.already_notified.push(part.code);
      }
    }

    return Response.json({
      ok: true,
      alerts_total: alertParts.length,
      new_alerts: results.notified,
      emails_sent: results.emails_sent,
      already_notified: results.already_notified,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});