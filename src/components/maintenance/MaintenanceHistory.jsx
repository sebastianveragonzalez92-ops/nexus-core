import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Calendar, Wrench, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MaintenanceHistory({ workOrders, assets, user }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('completada');

  const filteredHistory = useMemo(() => {
    return workOrders
      .filter((wo) => {
        const matchSearch =
          wo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          wo.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assets.find((a) => a.id === wo.asset_id)?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchType = typeFilter === 'todos' || wo.type === typeFilter;
        const matchStatus = statusFilter === 'todos' || wo.status === statusFilter;

        return matchSearch && matchType && matchStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.actual_end || a.planned_end || a.created_date);
        const dateB = new Date(b.actual_end || b.planned_end || b.created_date);
        return dateB - dateA;
      });
  }, [workOrders, assets, searchTerm, typeFilter, statusFilter]);

  const getTypeIcon = (type) => {
    const icons = {
      preventivo: '🛡️',
      correctivo: '🔧',
      predictivo: '📊',
      mejora: '⚡',
    };
    return icons[type] || '⚙️';
  };

  const stats = {
    total: filteredHistory.length,
    completed: filteredHistory.filter((wo) => wo.status === 'completada').length,
    totalHours: filteredHistory.reduce((sum, wo) => sum + (wo.actual_hours || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Registros</p>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <Wrench className="w-10 h-10 text-slate-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Completadas</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Horas Totales</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.totalHours.toFixed(1)}h</p>
              </div>
              <Calendar className="w-10 h-10 text-indigo-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Buscar</label>
              <Input
                placeholder="Descripción, número o activo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="preventivo">Preventivo</SelectItem>
                  <SelectItem value="correctivo">Correctivo</SelectItem>
                  <SelectItem value="predictivo">Predictivo</SelectItem>
                  <SelectItem value="mejora">Mejora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="en_progreso">En Progreso</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">Sin registros de mantenimiento</p>
            </CardContent>
          </Card>
        ) : (
          filteredHistory.map((wo, idx) => {
            const asset = assets.find((a) => a.id === wo.asset_id);
            const completedDate = wo.actual_end || wo.planned_end || wo.created_date;

            return (
              <motion.div
                key={wo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                      {/* Type and Description */}
                      <div>
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-2xl">{getTypeIcon(wo.type)}</span>
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-1">
                              {wo.type}
                            </Badge>
                            <p className="text-sm font-medium text-slate-900 line-clamp-2">{wo.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Asset and Details */}
                      <div className="text-sm">
                        <p className="text-slate-600 mb-1">Activo</p>
                        <p className="font-medium text-slate-900">{asset?.name || 'N/A'}</p>
                        {wo.actual_hours && (
                          <p className="text-slate-600 text-xs mt-1">{wo.actual_hours}h empleadas</p>
                        )}
                      </div>

                      {/* Technician and Cost */}
                      <div className="text-sm">
                        <p className="text-slate-600 mb-1">Técnico</p>
                        <p className="font-medium text-slate-900">{wo.assigned_to || 'Sin asignar'}</p>
                        {wo.cost && (
                          <p className="text-slate-600 text-xs mt-1">Costo: ${wo.cost.toFixed(2)}</p>
                        )}
                      </div>

                      {/* Date and Status */}
                      <div className="text-sm">
                        <p className="text-slate-600 mb-1">Completado</p>
                        {completedDate ? (
                          <>
                            <p className="font-medium text-slate-900">
                              {format(new Date(completedDate), 'd MMM yyyy', { locale: es })}
                            </p>
                            <Badge className="mt-1 bg-green-100 text-green-800">Completada</Badge>
                          </>
                        ) : (
                          <Badge className="mt-1 bg-amber-100 text-amber-800">Pendiente</Badge>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {wo.notes && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-600 mb-1">Notas</p>
                        <p className="text-sm text-slate-700">{wo.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}