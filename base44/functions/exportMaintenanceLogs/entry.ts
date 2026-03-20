import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all work orders
    const workOrders = await base44.asServiceRole.entities.WorkOrder.list('-created_date', 1000);

    if (workOrders.length === 0) {
      return Response.json({ error: 'No work orders to export' }, { status: 400 });
    }

    // Format as CSV
    const headers = ['Número', 'Activo', 'Tipo', 'Prioridad', 'Estado', 'Descripción', 'Asignado a', 'Horas Estimadas', 'Costo', 'Fecha Creación'];
    const rows = workOrders.map(wo => [
      wo.number || '',
      wo.asset_id || '',
      wo.type || '',
      wo.priority || '',
      wo.status || '',
      wo.description || '',
      wo.assigned_to || '',
      wo.estimated_hours || '',
      wo.cost || '',
      new Date(wo.created_date).toLocaleDateString('es-CL')
    ]);

    // Create CSV content
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // Get Google Drive access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');

    // Create file in Google Drive
    const fileName = `Registros_Mantenimiento_${new Date().toISOString().split('T')[0]}.csv`;
    const fileMetadata = {
      name: fileName,
      mimeType: 'text/csv'
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
    form.append('file', new Blob([csvContent], { type: 'text/csv' }));

    const driveResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: form
      }
    );

    if (!driveResponse.ok) {
      const errorData = await driveResponse.text();
      return Response.json({ error: `Failed to upload to Drive: ${errorData}` }, { status: 400 });
    }

    const fileData = await driveResponse.json();

    return Response.json({
      success: true,
      message: `Exportado ${workOrders.length} registros a Google Drive`,
      fileName: fileName,
      fileId: fileData.id,
      driveLink: `https://drive.google.com/file/d/${fileData.id}/view`
    });
  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});