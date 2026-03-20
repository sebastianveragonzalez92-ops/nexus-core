import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { spreadsheetId, range = 'Sheet1' } = await req.json();

    if (!spreadsheetId) {
      return Response.json({ error: 'spreadsheetId is required' }, { status: 400 });
    }

    // Get access token for Google Sheets
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');

    // Format range properly for Google Sheets API
    const formattedRange = range.includes('!') ? range : `${range}!A:Z`;
    
    const sheetsResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(formattedRange)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!sheetsResponse.ok) {
      const errorData = await sheetsResponse.text();
      return Response.json({ error: `Failed to fetch from Google Sheets: ${errorData}` }, { status: 400 });
    }

    const sheetsData = await sheetsResponse.json();
    const rows = sheetsData.values || [];

    if (rows.length < 2) {
      return Response.json({ error: 'Sheet must have headers and at least one data row' }, { status: 400 });
    }

    // Parse headers and rows
    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Map columns to WorkOrder properties
    const workOrders = dataRows.map((row) => {
      const obj = {};
      headers.forEach((header, idx) => {
        obj[header.toLowerCase().trim()] = row[idx] || '';
      });

      return {
        asset_id: obj['asset_id'] || obj['activo_id'] || '',
        type: obj['type'] || obj['tipo'] || 'preventivo',
        priority: obj['priority'] || obj['prioridad'] || 'media',
        description: obj['description'] || obj['descripcion'] || '',
        assigned_to: obj['assigned_to'] || obj['asignado_a'] || user.email,
        estimated_hours: parseFloat(obj['estimated_hours'] || obj['horas_estimadas'] || 0),
        status: obj['status'] || obj['estado'] || 'pendiente'
      };
    });

    // Validate work orders
    const validWorkOrders = workOrders.filter(wo => wo.asset_id && wo.description);

    if (validWorkOrders.length === 0) {
      return Response.json({ error: 'No valid work orders found' }, { status: 400 });
    }

    // Bulk create work orders
    const created = await base44.asServiceRole.entities.WorkOrder.bulkCreate(validWorkOrders);

    return Response.json({
      success: true,
      imported: created.length,
      total: validWorkOrders.length,
      workOrders: created
    });
  } catch (error) {
    console.error('Import error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});