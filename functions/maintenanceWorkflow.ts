import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Handles maintenance workflow actions:
 * - submit_for_approval: technician submits WO for admin approval
 * - approve: admin approves WO
 * - reject: admin rejects WO with reason
 * - assign: assign WO to a technician (sends notification + email)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, work_order_id, assigned_to, rejection_reason } = await req.json();

    const wo = await base44.asServiceRole.entities.WorkOrder.get(work_order_id);
    if (!wo) return Response.json({ error: 'Orden de trabajo no encontrada' }, { status: 404 });

    const isAdmin = user.role === 'admin';

    if (action === 'submit_for_approval') {
      await base44.asServiceRole.entities.WorkOrder.update(work_order_id, { status: 'en_aprobacion' });

      // Notify all admins
      const allUsers = await base44.asServiceRole.entities.User.list();
      const admins = allUsers.filter(u => u.role === 'admin');
      await Promise.all(admins.map(admin =>
        base44.asServiceRole.entities.Notification.create({
          user_email: admin.email,
          type: 'work_order_approval_needed',
          title: 'Aprobación requerida',
          message: `La OT "${wo.description?.slice(0, 60)}" requiere tu aprobación.`,
          metadata: { work_order_id }
        })
      ));

      return Response.json({ success: true, message: 'OT enviada a aprobación' });
    }

    if (action === 'approve') {
      if (!isAdmin) return Response.json({ error: 'Solo admins pueden aprobar' }, { status: 403 });
      await base44.asServiceRole.entities.WorkOrder.update(work_order_id, {
        status: 'asignada',
        approval_notes: `Aprobado por ${user.full_name || user.email} el ${new Date().toLocaleDateString('es-CL')}`
      });

      // Notify creator/assigned
      const targets = [...new Set([wo.assigned_to, wo.created_by].filter(Boolean))];
      await Promise.all(targets.map(email =>
        base44.asServiceRole.entities.Notification.create({
          user_email: email,
          type: 'work_order_approved',
          title: '✅ OT Aprobada',
          message: `Tu orden de trabajo "${wo.description?.slice(0, 60)}" fue aprobada.`,
          metadata: { work_order_id }
        })
      ));

      // Email to assigned technician
      if (wo.assigned_to) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: wo.assigned_to,
          subject: `✅ Orden de Trabajo Aprobada`,
          body: `<p>Hola,</p><p>Tu orden de trabajo ha sido <strong>aprobada</strong>.</p><p><strong>Descripción:</strong> ${wo.description}</p><p>Puedes proceder con el trabajo. Accede al sistema para ver los detalles.</p>`
        });
      }

      return Response.json({ success: true, message: 'OT aprobada' });
    }

    if (action === 'reject') {
      if (!isAdmin) return Response.json({ error: 'Solo admins pueden rechazar' }, { status: 403 });
      await base44.asServiceRole.entities.WorkOrder.update(work_order_id, {
        status: 'pendiente',
        approval_notes: `Rechazado por ${user.full_name || user.email}: ${rejection_reason || 'Sin motivo'}`
      });

      const targets = [...new Set([wo.assigned_to, wo.created_by].filter(Boolean))];
      await Promise.all(targets.map(email =>
        base44.asServiceRole.entities.Notification.create({
          user_email: email,
          type: 'work_order_rejected',
          title: '❌ OT Rechazada',
          message: `La OT "${wo.description?.slice(0, 60)}" fue rechazada. Motivo: ${rejection_reason || 'Sin motivo'}`,
          metadata: { work_order_id }
        })
      ));

      return Response.json({ success: true, message: 'OT rechazada' });
    }

    if (action === 'assign') {
      if (!isAdmin) return Response.json({ error: 'Solo admins pueden asignar' }, { status: 403 });
      if (!assigned_to) return Response.json({ error: 'assigned_to requerido' }, { status: 400 });

      await base44.asServiceRole.entities.WorkOrder.update(work_order_id, {
        assigned_to,
        status: 'asignada'
      });

      await base44.asServiceRole.entities.Notification.create({
        user_email: assigned_to,
        type: 'work_order_assigned',
        title: '🔧 Nueva OT asignada',
        message: `Se te asignó la orden de trabajo: "${wo.description?.slice(0, 80)}"`,
        metadata: { work_order_id }
      });

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: assigned_to,
        subject: `🔧 Se te asignó una Orden de Trabajo`,
        body: `<p>Hola,</p><p>Se te ha asignado una nueva orden de trabajo.</p><p><strong>Descripción:</strong> ${wo.description}</p><p><strong>Prioridad:</strong> ${wo.priority}</p><p>Accede al sistema para ver todos los detalles.</p>`
      });

      return Response.json({ success: true, message: `OT asignada a ${assigned_to}` });
    }

    return Response.json({ error: 'Acción no reconocida' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});