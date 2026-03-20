import { base44 } from "@base44/sdk";

/**
 * Webhook que se dispara cuando se asigna una nueva WorkOrder (tarea)
 * Se ejecuta automáticamente cuando se crea un registro en WorkOrder
 */
export default async function onWorkOrderAssigned(data) {
  const { entity_type, action, record } = data;

  // Verificar que sea una creación de WorkOrder
  if (entity_type !== "WorkOrder" || action !== "create") {
    return;
  }

  try {
    // Obtener detalles del activo y usuario
    const asset = await base44.asServiceRole.entities.Asset.read(record.asset_id);
    const users = await base44.asServiceRole.entities.User.list();
    const assignedUser = users.find(u => u.email === record.assigned_to);

    if (!assignedUser) {
      throw new Error("Usuario asignado no encontrado");
    }

    // Enviar email
    await base44.integrations.Core.SendEmail({
      to: record.assigned_to,
      subject: `Nueva Tarea Asignada: ${record.description}`,
      body: `
        <h2>Nueva Tarea Asignada</h2>
        <p>Hola ${assignedUser.full_name},</p>
        <p>Se te ha asignado una nueva tarea de mantenimiento.</p>
        <p><strong>Detalles:</strong></p>
        <ul>
          <li>Número de OT: ${record.number}</li>
          <li>Equipo: ${asset?.name || 'N/A'}</li>
          <li>Tipo: ${record.type}</li>
          <li>Prioridad: ${record.priority}</li>
          <li>Descripción: ${record.description}</li>
          ${record.planned_start ? `<li>Inicio Planeado: ${new Date(record.planned_start).toLocaleDateString('es-ES')}</li>` : ''}
        </ul>
        <p>Accede a tu panel para más detalles y actualizar el estado de la tarea.</p>
        <br>
        <p>Saludos,<br>El equipo de Mantenimiento</p>
      `
    });

    // Crear una notificación en la app
    await base44.asServiceRole.entities.Notification.create({
      user_email: record.assigned_to,
      type: "task_assigned",
      title: "Nueva Tarea Asignada",
      message: `Se te ha asignado la tarea: ${record.description}`,
      related_entity_id: record.id,
      read: false
    });

    console.log(`Email enviado a ${record.assigned_to} por nueva tarea ${record.number}`);
  } catch (error) {
    console.error("Error en onWorkOrderAssigned:", error);
  }
}