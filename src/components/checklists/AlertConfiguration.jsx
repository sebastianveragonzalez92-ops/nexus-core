import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Plus, Trash2, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AlertConfiguration({ userRole }) {
  const queryClient = useQueryClient();
  const [newConfig, setNewConfig] = useState({
    alert_type: 'ai_risk',
    enabled: true,
    risk_threshold: 'crítico',
    min_execution_frequency: 3,
    frequency_period_days: 7,
    failure_rate_increase_threshold: 20,
    notify_roles: ['admin', 'supervisor'],
    notify_email: true,
    notify_inapp: true,
  });

  const { data: configs = [] } = useQuery({
    queryKey: ['alertConfigurations'],
    queryFn: () => base44.entities.AlertConfiguration.list('-created_date'),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['checklistTemplates'],
    queryFn: () => base44.entities.ChecklistTemplate.list(),
  });

  const createMutation = useMutation({
    mutationFn: async (configData) => {
      return base44.entities.AlertConfiguration.create({
        ...configData,
        created_by: (await base44.auth.me()).email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertConfigurations'] });
      setNewConfig({
        alert_type: 'ai_risk',
        enabled: true,
        risk_threshold: 'crítico',
        min_execution_frequency: 3,
        frequency_period_days: 7,
        failure_rate_increase_threshold: 20,
        notify_roles: ['admin', 'supervisor'],
        notify_email: true,
        notify_inapp: true,
      });
      toast.success('Configuración de alerta creada');
    },
    onError: (error) => {
      toast.error('Error al crear configuración');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (configId) => base44.entities.AlertConfiguration.delete(configId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertConfigurations'] });
      toast.success('Configuración eliminada');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (config) =>
      base44.entities.AlertConfiguration.update(config.id, { enabled: !config.enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertConfigurations'] });
    },
  });

  if (userRole !== 'admin') {
    return (
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <p className="text-slate-500 text-center">Solo administradores pueden configurar alertas</p>
        </CardContent>
      </Card>
    );
  }

  const alertTypeLabels = {
    ai_risk: 'Riesgo IA',
    low_execution_frequency: 'Baja Frecuencia',
    failure_rate_change: 'Cambio en Tasa de Fallos',
  };

  return (
    <div className="space-y-6">
      {/* New Configuration Form */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Nueva Configuración de Alerta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Alerta
              </label>
              <Select
                value={newConfig.alert_type}
                onValueChange={(value) =>
                  setNewConfig({ ...newConfig, alert_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai_risk">Riesgo IA</SelectItem>
                  <SelectItem value="low_execution_frequency">Baja Frecuencia de Ejecución</SelectItem>
                  <SelectItem value="failure_rate_change">Cambio en Tasa de Fallos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newConfig.alert_type === 'ai_risk' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Umbral de Riesgo
                </label>
                <Select
                  value={newConfig.risk_threshold}
                  onValueChange={(value) =>
                    setNewConfig({ ...newConfig, risk_threshold: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alto">Alto</SelectItem>
                    <SelectItem value="crítico">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {newConfig.alert_type === 'low_execution_frequency' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mín. Ejecuciones
                  </label>
                  <Input
                    type="number"
                    value={newConfig.min_execution_frequency}
                    onChange={(e) =>
                      setNewConfig({
                        ...newConfig,
                        min_execution_frequency: parseInt(e.target.value) || 0,
                      })
                    }
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Período (días)
                  </label>
                  <Input
                    type="number"
                    value={newConfig.frequency_period_days}
                    onChange={(e) =>
                      setNewConfig({
                        ...newConfig,
                        frequency_period_days: parseInt(e.target.value) || 7,
                      })
                    }
                    min="1"
                  />
                </div>
              </>
            )}

            {newConfig.alert_type === 'failure_rate_change' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Umbral Aumento % Fallos
                </label>
                <Input
                  type="number"
                  value={newConfig.failure_rate_increase_threshold}
                  onChange={(e) =>
                    setNewConfig({
                      ...newConfig,
                      failure_rate_increase_threshold: parseInt(e.target.value) || 20,
                    })
                  }
                  min="1"
                  max="100"
                />
              </div>
            )}
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Notificaciones</label>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={newConfig.notify_inapp}
                  onCheckedChange={(checked) =>
                    setNewConfig({ ...newConfig, notify_inapp: checked })
                  }
                />
                <span className="text-sm text-slate-700">Notificaciones en la aplicación</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={newConfig.notify_email}
                  onCheckedChange={(checked) =>
                    setNewConfig({ ...newConfig, notify_email: checked })
                  }
                />
                <span className="text-sm text-slate-700">Notificaciones por email</span>
              </label>
            </div>
          </div>

          <Button
            onClick={() => createMutation.mutate(newConfig)}
            disabled={createMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Configuración
          </Button>
        </CardContent>
      </Card>

      {/* Existing Configurations */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">Configuraciones Activas</h3>
        {configs.length > 0 ? (
          configs.map((config) => (
            <motion.div
              key={config.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      className={
                        config.enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-800'
                      }
                    >
                      {config.enabled ? 'Activa' : 'Inactiva'}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800">
                      {alertTypeLabels[config.alert_type]}
                    </Badge>
                  </div>

                  <div className="text-sm text-slate-600 space-y-1">
                    {config.alert_type === 'ai_risk' && (
                      <p>Umbral: {config.risk_threshold}</p>
                    )}
                    {config.alert_type === 'low_execution_frequency' && (
                      <p>Mín. {config.min_execution_frequency} ejecuciones en {config.frequency_period_days} días</p>
                    )}
                    {config.alert_type === 'failure_rate_change' && (
                      <p>Umbral: +{config.failure_rate_increase_threshold}% de fallos</p>
                    )}
                    <p>
                      Notificaciones:
                      {config.notify_inapp && ' En-app'}
                      {config.notify_email && ' Email'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant={config.enabled ? 'outline' : 'default'}
                    onClick={() => toggleMutation.mutate(config)}
                  >
                    {config.enabled ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(config.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-slate-500 text-center py-8">No hay configuraciones creadas</p>
        )}
      </div>
    </div>
  );
}