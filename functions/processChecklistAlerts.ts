import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Obtener configuraciones de alertas activas
    const configs = await base44.entities.AlertConfiguration.filter({ enabled: true });
    const templates = await base44.entities.ChecklistTemplate.list();
    const executions = await base44.entities.ChecklistExecution.list('-execution_date', 1000);

    const alerts = [];

    // Procesar cada configuración
    for (const config of configs) {
      if (config.alert_type === 'ai_risk') {
        // Detectar checklists con riesgo alto o crítico
        const riskExecutions = executions.filter(e => {
          if (config.template_id && e.template_id !== config.template_id) return false;
          return e.ai_validation?.risk_level === config.risk_threshold;
        });

        if (riskExecutions.length > 0) {
          const latestRisk = riskExecutions[0];
          const alertData = await base44.asServiceRole.entities.ChecklistAlert.create({
            configuration_id: config.id,
            alert_type: 'ai_risk',
            template_id: latestRisk.template_id,
            template_name: latestRisk.template_name,
            severity: config.risk_threshold === 'crítico' ? 'critical' : 'warning',
            title: `⚠️ Checklist con Riesgo ${config.risk_threshold}`,
            message: `El template "${latestRisk.template_name}" ejecutado por ${latestRisk.user_name} detectó riesgo ${config.risk_threshold}. Alertas: ${latestRisk.ai_validation?.pattern_alerts?.slice(0, 2).join(', ') || 'Ver detalles'}`,
            data: {
              execution_id: latestRisk.id,
              user_email: latestRisk.user_email,
              risk_level: latestRisk.ai_validation?.risk_level,
              pattern_alerts: latestRisk.ai_validation?.pattern_alerts,
            },
            triggered_at: new Date().toISOString(),
            notified_users: [],
          });
          alerts.push(alertData);
        }
      }

      if (config.alert_type === 'low_execution_frequency') {
        // Detectar pocas ejecuciones en período
        const now = new Date();
        const periodStart = new Date(now.getTime() - config.frequency_period_days * 24 * 60 * 60 * 1000);
        
        const template = templates.find(t => t.id === config.template_id);
        if (!template) continue;

        const recentExecutions = executions.filter(e => {
          if (e.template_id !== config.template_id) return false;
          const execDate = new Date(e.execution_date);
          return execDate >= periodStart && execDate <= now;
        });

        if (recentExecutions.length < (config.min_execution_frequency || 3)) {
          const alertData = await base44.asServiceRole.entities.ChecklistAlert.create({
            configuration_id: config.id,
            alert_type: 'low_execution_frequency',
            template_id: config.template_id,
            template_name: template.name,
            severity: 'warning',
            title: `📉 Baja Ejecución de Checklist`,
            message: `El template "${template.name}" solo tiene ${recentExecutions.length} ejecuciones en los últimos ${config.frequency_period_days} días (mínimo esperado: ${config.min_execution_frequency}).`,
            data: {
              template_id: config.template_id,
              executions_count: recentExecutions.length,
              min_expected: config.min_execution_frequency,
              period_days: config.frequency_period_days,
            },
            triggered_at: new Date().toISOString(),
            notified_users: [],
          });
          alerts.push(alertData);
        }
      }

      if (config.alert_type === 'failure_rate_change') {
        // Detectar cambios en tasa de fallos
        const template = templates.find(t => t.id === config.template_id);
        if (!template) continue;

        const now = new Date();
        const period = 7; // últimos 7 días
        const periodStart = new Date(now.getTime() - period * 24 * 60 * 60 * 1000);
        const prevPeriodStart = new Date(now.getTime() - 2 * period * 24 * 60 * 60 * 1000);

        const currentExecutions = executions.filter(e => {
          if (e.template_id !== config.template_id) return false;
          const execDate = new Date(e.execution_date);
          return execDate >= periodStart && execDate <= now;
        });

        const prevExecutions = executions.filter(e => {
          if (e.template_id !== config.template_id) return false;
          const execDate = new Date(e.execution_date);
          return execDate >= prevPeriodStart && execDate < periodStart;
        });

        if (currentExecutions.length > 0 && prevExecutions.length > 0) {
          const currentFailureRate = currentExecutions.filter(e => e.failures?.length > 0).length / currentExecutions.length * 100;
          const prevFailureRate = prevExecutions.filter(e => e.failures?.length > 0).length / prevExecutions.length * 100;
          const rateChange = currentFailureRate - prevFailureRate;

          if (rateChange > config.failure_rate_increase_threshold) {
            const alertData = await base44.asServiceRole.entities.ChecklistAlert.create({
              configuration_id: config.id,
              alert_type: 'failure_rate_change',
              template_id: config.template_id,
              template_name: template.name,
              severity: rateChange > 50 ? 'critical' : 'warning',
              title: `📈 Aumento en Tasa de Fallos`,
              message: `El template "${template.name}" muestra un aumento del ${rateChange.toFixed(1)}% en la tasa de fallos respecto a la semana anterior.`,
              data: {
                template_id: config.template_id,
                current_failure_rate: currentFailureRate.toFixed(1),
                previous_failure_rate: prevFailureRate.toFixed(1),
                rate_change: rateChange.toFixed(1),
              },
              triggered_at: new Date().toISOString(),
              notified_users: [],
            });
            alerts.push(alertData);
          }
        }
      }
    }

    // Notificar a usuarios
    for (const alert of alerts) {
      const users = await base44.asServiceRole.entities.User.filter({
        role: { $in: config.notify_roles || ['admin', 'supervisor'] },
      });

      for (const notifyUser of users) {
        if (config.notify_inapp) {
          await base44.asServiceRole.entities.Notification.create({
            user_email: notifyUser.email,
            type: 'checklist_alert',
            title: alert.title,
            message: alert.message,
            action_url: `/Checklists?alert=${alert.id}`,
          });
        }

        if (config.notify_email) {
          await base44.integrations.Core.SendEmail({
            to: notifyUser.email,
            subject: alert.title,
            body: `${alert.message}\n\nSeveridad: ${alert.severity}`,
          });
        }
      }

      // Actualizar usuarios notificados
      await base44.asServiceRole.entities.ChecklistAlert.update(alert.id, {
        notified_users: users.map(u => u.email),
      });
    }

    return Response.json({
      status: 'success',
      alerts_generated: alerts.length,
      alerts: alerts.map(a => ({ id: a.id, type: a.alert_type, title: a.title })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});