import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canExport = ['admin', 'supervisor'].includes(user?.role);
    if (!canExport) {
      return Response.json({ error: 'Forbidden: Se requiere rol admin o supervisor' }, { status: 403 });
    }

    const { dataset } = await req.json().catch(() => ({}));

    // Fetch all relevant data in parallel
    const [equipment, maintenanceRecords, kpis, kpiValues, workOrders] = await Promise.all([
      base44.asServiceRole.entities.Equipment.list('-created_date', 500),
      base44.asServiceRole.entities.MaintenanceRecord.list('-fecha', 500),
      base44.asServiceRole.entities.KPI.list('-created_date', 200),
      base44.asServiceRole.entities.KPIValue.list('-period', 500),
      base44.asServiceRole.entities.WorkOrder.list('-created_date', 500).catch(() => []),
    ]);

    // Shape data for Power BI consumption
    const datasets = {
      equipment: equipment.map(e => ({
        id: e.id,
        nombre: e.nombre,
        tipo_equipo: e.tipo_equipo,
        numero_interno: e.numero_interno,
        empresa: e.empresa,
        division: e.division,
        status: e.status,
        fabricante: e.fabricante,
        modelo: e.modelo,
        fecha_instalacion: e.fecha_instalacion,
        fecha_proxima_mantencion: e.fecha_proxima_mantencion,
      })),

      maintenance_records: maintenanceRecords.map(r => ({
        id: r.id,
        equipment_id: r.equipment_id,
        equipment_numero_interno: r.equipment_numero_interno,
        type: r.type,
        fecha: r.fecha,
        tecnico: r.tecnico,
        resultado: r.resultado,
        horas_trabajadas: r.horas_trabajadas,
        costo: r.costo,
        observaciones: r.observaciones,
      })),

      kpis: kpis.map(k => ({
        id: k.id,
        name: k.name,
        category: k.category,
        unit: k.unit,
        target: k.target,
        status: k.status,
      })),

      kpi_values: kpiValues.map(v => ({
        id: v.id,
        kpi_id: v.kpi_id,
        kpi_name: v.kpi_name,
        period: v.period,
        value: v.value,
        target: v.target,
        variance: v.variance,
      })),

      work_orders: workOrders.map(w => ({
        id: w.id,
        number: w.number,
        title: w.title,
        type: w.type,
        priority: w.priority,
        status: w.status,
        assigned_to: w.assigned_to,
        asset_id: w.asset_id,
        estimated_hours: w.estimated_hours,
        actual_hours: w.actual_hours,
        estimated_cost: w.estimated_cost,
        actual_cost: w.actual_cost,
        created_date: w.created_date,
        updated_date: w.updated_date,
      })),
    };

    // If a specific dataset is requested, return only that one
    const result = dataset && datasets[dataset] ? datasets[dataset] : datasets;

    return Response.json(result, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});