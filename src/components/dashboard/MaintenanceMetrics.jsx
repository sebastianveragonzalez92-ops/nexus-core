import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Wrench, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MaintenanceMetrics() {
  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 200),
  });

  const { data: workOrders = [] } = useQuery({
    queryKey: ['workOrders'],
    queryFn: () => base44.entities.WorkOrder.list('-created_date', 200),
  });

  const { data: spareParts = [] } = useQuery({
    queryKey: ['spareParts'],
    queryFn: () => base44.entities.SparePart.list('-created_date', 200),
  });

  // Equipment stats
  const equipmentStats = {
    total: equipment.length,
    operativo: equipment.filter(e => e.status === 'operativo').length,
    standby: equipment.filter(e => e.status === 'standby').length,
    overdue: equipment.filter(e => 
      e.fecha_proxima_mantencion && new Date(e.fecha_proxima_mantencion + 'T00:00:00') < new Date()
    ).length,
  };

  const equipmentChartData = [
    { name: 'Operativo', value: equipmentStats.operativo, fill: '#10b981' },
    { name: 'Standby', value: equipmentStats.standby, fill: '#94a3b8' },
  ];

  // Work orders stats
  const workOrderStats = {
    total: workOrders.length,
    pendiente: workOrders.filter(wo => wo.status === 'pendiente').length,
    en_progreso: workOrders.filter(wo => wo.status === 'en_progreso').length,
    completada: workOrders.filter(wo => wo.status === 'completada').length,
  };

  const workOrderChartData = [
    { name: 'Pendiente', count: workOrderStats.pendiente },
    { name: 'En Progreso', count: workOrderStats.en_progreso },
    { name: 'Completada', count: workOrderStats.completada },
  ];

  // Spare parts stats
  const lowStockParts = spareParts.filter(p => p.stock_actual <= p.stock_minimo && p.stock_actual > 0);
  const outOfStockParts = spareParts.filter(p => p.stock_actual === 0);

  // Upcoming maintenance (próximos 30 días)
  const today = new Date();
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const upcomingMaintenance = equipment.filter(e => {
    if (!e.fecha_proxima_mantencion) return false;
    const date = new Date(e.fecha_proxima_mantencion + 'T00:00:00');
    return date >= today && date <= thirtyDaysLater;
  }).sort((a, b) => new Date(a.fecha_proxima_mantencion) - new Date(b.fecha_proxima_mantencion));

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">{equipmentStats.total}</div>
                <div className="text-sm text-slate-600 mt-1">Equipos Totales</div>
                <div className="text-xs text-slate-500 mt-2">{equipmentStats.operativo} operativos</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">{workOrderStats.total}</div>
                <div className="text-sm text-slate-600 mt-1">Órdenes de Trabajo</div>
                <div className="text-xs text-red-600 mt-2 font-medium">{workOrderStats.pendiente} pendientes</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={outOfStockParts.length > 0 ? 'border-orange-200 bg-orange-50' : ''}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">{lowStockParts.length + outOfStockParts.length}</div>
                <div className="text-sm text-slate-600 mt-1">Repuestos Críticos</div>
                <div className="text-xs text-orange-600 mt-2">{outOfStockParts.length} sin stock</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className={equipmentStats.overdue > 0 ? 'border-red-200 bg-red-50' : ''}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">{upcomingMaintenance.length}</div>
                <div className="text-sm text-slate-600 mt-1">Próximas Mantenciones</div>
                <div className={`text-xs mt-2 ${equipmentStats.overdue > 0 ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                  {equipmentStats.overdue > 0 ? `${equipmentStats.overdue} vencidas ⚠️` : 'Sin retrasos'}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                Estado de Equipos
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {equipmentStats.total > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={equipmentChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {equipmentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-slate-500">Sin datos</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Work orders status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-600" />
                Órdenes de Trabajo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workOrderStats.total > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={workOrderChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-slate-500">Sin datos</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Critical items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low stock spare parts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Repuestos con Stock Bajo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockParts.length === 0 ? (
                <p className="text-center py-8 text-slate-500">Todo el stock en condiciones normales</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {lowStockParts.slice(0, 10).map(part => (
                    <div key={part.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{part.name}</p>
                        <p className="text-xs text-slate-600">{part.code}</p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-sm font-semibold text-orange-600">{part.stock_actual}</p>
                        <p className="text-xs text-slate-500">mín: {part.stock_minimo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming maintenance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                Próximas Mantenciones (30 días)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingMaintenance.length === 0 ? (
                <p className="text-center py-8 text-slate-500">Sin mantenciones programadas próximamente</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {upcomingMaintenance.slice(0, 10).map(eq => {
                    const daysUntil = Math.ceil((new Date(eq.fecha_proxima_mantencion + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24));
                    const isOverdue = daysUntil < 0;
                    const isUrgent = daysUntil >= 0 && daysUntil <= 7;
                    return (
                      <div key={eq.id} className={`p-3 rounded-lg border ${isOverdue ? 'bg-red-50 border-red-200' : isUrgent ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{eq.nombre}</p>
                            <p className="text-xs text-slate-600">{eq.tipo_equipo}</p>
                          </div>
                          <div className="text-right ml-2">
                            <p className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-blue-600'}`}>
                              {isOverdue ? '⚠️ Vencida' : `${daysUntil}d`}
                            </p>
                            <p className="text-xs text-slate-500">{eq.fecha_proxima_mantencion}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}