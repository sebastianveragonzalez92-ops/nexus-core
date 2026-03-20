import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateName, dateRange } = await req.json();

    // Obtener ejecutables del template en el rango de fechas
    const allExecutions = await base44.entities.ChecklistExecution.filter(
      { template_name: templateName },
      '-execution_date',
      100
    );

    const executions = allExecutions.filter(exec => {
      const execDate = new Date(exec.execution_date);
      const now = new Date();
      const daysAgo = dateRange || 30;
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      return execDate >= cutoffDate;
    });

    const aggregatedData = {
      total_executions: executions.length,
      avg_compliance: (
        executions.reduce((sum, e) => sum + e.compliance_rate, 0) / executions.length
      ).toFixed(1),
      high_risk_count: executions.filter(e => e.failures?.length > 2).length,
      all_failures: [],
      failure_frequency: {},
      by_shift: { mañana: 0, tarde: 0, noche: 0 },
      by_user: {},
    };

    executions.forEach(exec => {
      exec.failures?.forEach(failure => {
        aggregatedData.all_failures.push(failure);
        aggregatedData.failure_frequency[failure] =
          (aggregatedData.failure_frequency[failure] || 0) + 1;
      });

      aggregatedData.by_shift[exec.shift] =
        (aggregatedData.by_shift[exec.shift] || 0) + 1;

      aggregatedData.by_user[exec.user_email] =
        (aggregatedData.by_user[exec.user_email] || 0) + 1;
    });

    const prompt = `
Eres un analista de seguridad industrial. Genera un reporte ejecutivo basado en estos datos de checklists:

Template: ${templateName}
Período: últimos ${dateRange || 30} días
${JSON.stringify(aggregatedData, null, 2)}

Proporciona:
1. Resumen ejecutivo
2. Tendencias principales
3. Problemas recurrentes (top 5)
4. Recomendaciones prioritarias
5. Análisis por turno/equipo si es relevante

Responde SOLO con JSON válido:
{
  "executive_summary": "texto con visión general",
  "key_trends": ["tendencia 1", "tendencia 2"],
  "recurring_issues": [
    { "issue": "nombre", "frequency": número, "severity": "baja|media|alta|crítica" }
  ],
  "priority_recommendations": ["rec 1", "rec 2", "rec 3"],
  "shift_analysis": "análisis por turnos",
  "anomalies": ["anomalía 1", "anomalía 2"],
  "risk_score": número_0_a_100
}
    `;

    const report = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          executive_summary: { type: 'string' },
          key_trends: {
            type: 'array',
            items: { type: 'string' },
          },
          recurring_issues: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                issue: { type: 'string' },
                frequency: { type: 'number' },
                severity: { type: 'string' },
              },
            },
          },
          priority_recommendations: {
            type: 'array',
            items: { type: 'string' },
          },
          shift_analysis: { type: 'string' },
          anomalies: {
            type: 'array',
            items: { type: 'string' },
          },
          risk_score: { type: 'number' },
        },
      },
    });

    return Response.json({
      ...report,
      generated_at: new Date().toISOString(),
      data_points: executions.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});