import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Zap, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const getAlertIcon = (type) => {
  switch (type) {
    case 'ai_risk':
      return AlertTriangle;
    case 'low_execution_frequency':
      return AlertCircle;
    case 'failure_rate_change':
      return Zap;
    default:
      return AlertCircle;
  }
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-50 border-red-200 text-red-700';
    case 'warning':
      return 'bg-amber-50 border-amber-200 text-amber-700';
    default:
      return 'bg-blue-50 border-blue-200 text-blue-700';
  }
};

const getSeverityBadgeColor = (severity) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'warning':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

export default function AlertPanel({ userRole }) {
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['checklistAlerts'],
    queryFn: async () => {
      const allAlerts = await base44.entities.ChecklistAlert.list('-triggered_at', 50);
      return allAlerts.filter(a => !a.dismissed);
    },
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });

  const handleDismiss = async (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    await base44.entities.ChecklistAlert.update(alertId, { dismissed: true });
  };

  const handleMarkRead = async (alertId) => {
    await base44.entities.ChecklistAlert.update(alertId, {
      read: true,
      read_at: new Date().toISOString(),
    });
  };

  const unreadAlerts = alerts.filter(a => !a.read);
  const visibleAlerts = alerts.filter(a => !dismissedAlerts.has(a.id));

  if (isLoading) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Alertas del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">Cargando alertas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Alertas del Sistema
            {unreadAlerts.length > 0 && (
              <Badge className="bg-red-100 text-red-800 ml-2">
                {unreadAlerts.length} nueva{unreadAlerts.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <AnimatePresence>
          {visibleAlerts.length > 0 ? (
            visibleAlerts.map(alert => {
              const Icon = getAlertIcon(alert.alert_type);
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)} transition-all`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{alert.title}</h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={getSeverityBadgeColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm opacity-90 mb-2">{alert.message}</p>

                      {alert.data && (
                        <div className="text-xs opacity-75 mb-3 space-y-1">
                          {Object.entries(alert.data).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span> {String(value)}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs opacity-75">
                          {format(new Date(alert.triggered_at), "d MMM, HH:mm", { locale: es })}
                        </span>
                        <div className="flex gap-2">
                          {!alert.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkRead(alert.id)}
                              className="h-7 text-xs"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Marcar leída
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDismiss(alert.id)}
                            className="h-7"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No hay alertas en este momento</p>
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}