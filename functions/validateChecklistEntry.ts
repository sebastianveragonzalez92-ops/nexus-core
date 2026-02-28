import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateName, responses, failures } = await req.json();

    // Obtener ejecuciones históricas del mismo template
    const pastExecutions = await base44.entities.ChecklistExecution.filter(
      { template_name: templateName },
      '-execution_date',
      10
    );

    const historicalFailures = [];
    const commonIssues = {};

    pastExecutions.forEach(exec => {
      exec.failures?.forEach(failure => {
        commonIssues[failure] = (commonIssues[failure] || 0) + 1;
      });
      historicalFailures.push(...(exec.failures || []));
    });

    const prompt = `
Eres un auditor de seguridad industrial experimentado. Analiza este checklist completado y valida contra mejores prácticas:

Template: ${templateName}
Respuestas: ${JSON.stringify(responses)}
Fallos actuales: ${JSON.stringify(failures)}
Problemas históricos comunes en este template: ${JSON.stringify(commonIssues)}

Proporciona:
1. Validación de si los fallos reportados son consistentes con patrones históricos
2. Recomendaciones basadas en mejores prácticas
3. Áreas de riesgo identificadas
4. Sugerencias de mejora para el template

Responde SOLO con JSON válido:
{
  "is_valid": boolean,
  "risk_level": "bajo|medio|alto|crítico",
  "pattern_alerts": ["alerta 1", "alerta 2"],
  "best_practice_issues": ["problema 1", "problema 2"],
  "recommendations": ["recomendación 1", "recomendación 2"],
  "template_improvements": ["mejora 1", "mejora 2"]
}
    `;

    const validation = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          is_valid: { type: 'boolean' },
          risk_level: { type: 'string' },
          pattern_alerts: {
            type: 'array',
            items: { type: 'string' },
          },
          best_practice_issues: {
            type: 'array',
            items: { type: 'string' },
          },
          recommendations: {
            type: 'array',
            items: { type: 'string' },
          },
          template_improvements: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    });

    // Crear alerta si hay riesgo alto o crítico
    if (validation.risk_level === 'alto' || validation.risk_level === 'crítico') {
      await base44.entities.Notification.create({
        user_email: user.email,
        type: 'checklist_validation_alert',
        title: `⚠️ Alerta de validación: ${templateName}`,
        message: `Riesgo ${validation.risk_level} detectado. ${validation.pattern_alerts[0] || 'Revisar anomalías.'}`,
        action_url: `/Checklists`,
      });
    }

    return Response.json(validation);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});