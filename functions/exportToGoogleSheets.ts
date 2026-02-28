import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type } = body; // 'maintenance' o 'inventory'

    // Obtener token de Google Sheets
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');

    let data = [];
    let sheetName = '';

    if (type === 'maintenance') {
      // Exportar reportes de mantenimiento
      const reports = await base44.asServiceRole.entities.MaintenanceReport.list('-created_date', 100);
      data = reports.map(r => ({
        'Tipo': r.type,
        'Título': r.title,
        'Empresa': r.empresa,
        'División': r.division,
        'Equipo': r.tipo_equipo,
        'Número Interno': r.numero_interno_equipo,
        'Fecha': r.report_date,
        'Responsable': r.responsable,
        'Estado': r.status,
        'Observaciones': r.observations || '',
      }));
      sheetName = 'Reportes Mantenimiento';
    } else if (type === 'inventory') {
      // Exportar inventario de repuestos
      const spareParts = await base44.asServiceRole.entities.SparePart.list('-created_date', 100);
      data = spareParts.map(sp => ({
        'Código': sp.code,
        'Nombre': sp.name,
        'Categoría': sp.category,
        'Stock Actual': sp.stock_actual,
        'Stock Mínimo': sp.stock_minimo,
        'Stock Máximo': sp.stock_maximo,
        'Ubicación': sp.ubicacion || '',
        'Proveedor': sp.proveedor || '',
        'Precio Unitario': sp.precio_unitario || 0,
        'Activo': sp.activo ? 'Sí' : 'No',
      }));
      sheetName = 'Inventario Repuestos';
    }

    if (data.length === 0) {
      return Response.json({ error: 'No data to export' }, { status: 400 });
    }

    // Crear spreadsheet en Google Sheets
    const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: `${sheetName} - ${new Date().toLocaleDateString('es-CL')}`,
        },
        sheets: [{
          properties: {
            title: sheetName,
          },
        }],
      }),
    });

    const spreadsheet = await createResponse.json();
    const spreadsheetId = spreadsheet.spreadsheetId;
    const sheetId = spreadsheet.sheets[0].properties.sheetId;

    // Headers
    const headers = Object.keys(data[0]);
    const values = [headers, ...data.map(row => headers.map(h => row[h] || ''))];

    // Agregar datos a la hoja
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: values,
        majorDimension: 'ROWS',
      }),
    });

    // Formatear header
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{
          repeatCell: {
            range: {
              sheetId: sheetId,
              startRowIndex: 0,
              endRowIndex: 1,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: {
                  red: 0.2,
                  green: 0.2,
                  blue: 0.2,
                },
                textFormat: {
                  foregroundColor: {
                    red: 1,
                    green: 1,
                    blue: 1,
                  },
                  bold: true,
                },
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)',
          },
        }],
      }),
    });

    // Compartir con el usuario
    await fetch(`https://www.googleapis.com/drive/v3/files/${spreadsheetId}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'owner',
        type: 'user',
        emailAddress: user.email,
      }),
    });

    return Response.json({
      success: true,
      spreadsheetId: spreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      message: `Datos exportados a Google Sheets: ${sheetName}`,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});