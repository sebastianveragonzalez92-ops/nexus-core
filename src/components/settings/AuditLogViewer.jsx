import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { History, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ACTION_COLORS = {
  login: 'bg-green-50 text-green-700',
  logout: 'bg-slate-50 text-slate-700',
  user_created: 'bg-blue-50 text-blue-700',
  user_updated: 'bg-amber-50 text-amber-700',
  user_deactivated: 'bg-red-50 text-red-700',
  user_reactivated: 'bg-green-50 text-green-700',
  group_created: 'bg-purple-50 text-purple-700',
  group_updated: 'bg-purple-50 text-purple-700',
  group_deleted: 'bg-red-50 text-red-700',
  user_added_to_group: 'bg-blue-50 text-blue-700',
  user_removed_from_group: 'bg-amber-50 text-amber-700',
  role_changed: 'bg-orange-50 text-orange-700',
  permissions_changed: 'bg-orange-50 text-orange-700',
  data_accessed: 'bg-slate-50 text-slate-700',
  report_generated: 'bg-slate-50 text-slate-700',
  settings_changed: 'bg-slate-50 text-slate-700',
};

const ACTION_LABELS = {
  login: 'Acceso',
  logout: 'Cierre de Sesión',
  user_created: 'Usuario Creado',
  user_updated: 'Usuario Actualizado',
  user_deactivated: 'Usuario Desactivado',
  user_reactivated: 'Usuario Reactivado',
  group_created: 'Grupo Creado',
  group_updated: 'Grupo Actualizado',
  group_deleted: 'Grupo Eliminado',
  user_added_to_group: 'Usuario Agregado al Grupo',
  user_removed_from_group: 'Usuario Removido del Grupo',
  role_changed: 'Rol Cambiado',
  permissions_changed: 'Permisos Cambiados',
  data_accessed: 'Datos Accesados',
  report_generated: 'Reporte Generado',
  settings_changed: 'Configuración Cambiada',
};

export default function AuditLogViewer() {
  const [searchEmail, setSearchEmail] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['activityLogs'],
    queryFn: () => base44.asServiceRole.entities.ActivityLog.list('-created_date', 200),
    refetchInterval: 30000,
  });

  const filteredLogs = logs.filter((log) => {
    if (searchEmail && !log.user_email.toLowerCase().includes(searchEmail.toLowerCase())) {
      return false;
    }
    if (filterAction && log.action !== filterAction) {
      return false;
    }
    if (filterStatus && log.status !== filterStatus) {
      return false;
    }
    return true;
  });

  const getActionBadgeClass = (action) => ACTION_COLORS[action] || 'bg-slate-50 text-slate-700';
  const getActionLabel = (action) => ACTION_LABELS[action] || action;

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Historial de Auditoría
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por email del usuario..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por acción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Todas las acciones</SelectItem>
              {Object.entries(ACTION_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Todos los estados</SelectItem>
              <SelectItem value="success">Exitoso</SelectItem>
              <SelectItem value="failure">Fallido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Cargando registro...</div>
          ) : filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow ${getActionBadgeClass(log.action)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-xs ${getActionBadgeClass(log.action)}`}>
                        {getActionLabel(log.action)}
                      </Badge>
                      <Badge
                        className={`text-xs ${log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {log.status === 'success' ? 'OK' : 'Error'}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-slate-900">
                        {log.user_name || log.user_email}
                      </p>

                      <p className="text-slate-600">{log.description}</p>

                      {log.target_email && (
                        <p className="text-xs text-slate-500">
                          Usuario afectado: {log.target_name || log.target_email}
                        </p>
                      )}

                      {log.module && (
                        <p className="text-xs text-slate-500">Módulo: {log.module}</p>
                      )}

                      {log.error_message && (
                        <p className="text-xs text-red-600 font-medium">{log.error_message}</p>
                      )}

                      <p className="text-xs text-slate-400 mt-2">
                        {format(new Date(log.created_date), "d MMM yyyy HH:mm:ss", { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No hay registros de auditoría que coincidan con los filtros</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}