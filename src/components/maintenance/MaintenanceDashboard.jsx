import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wrench, CheckCircle, Clock, Cpu, AlertTriangle, Calendar } from 'lucide-react';
import { format, addDays, isAfter, isBefore } from 'date-fns';

const TYPE_COLORS = {
  preventivo: '#3b82f6',
  correctivo: '#f97316',
  predictivo: '#a855f7',
  mejora: '#14b8a6',
};

export default function MaintenanceDashboard({ user }) {
  const { data: records = [] } = useQuery({
    queryKey: ['maintenanceRecords'],
    queryFn: () => base44.entities.MaintenanceRecord.list('-fecha', 300),
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 200),
  });

  const today = new Date().toISOString().split('T')[0];
  const in30Days = addDays(new Date(), 30).toISOString().split('T')[0];

  const stats = useMemo(() => {
    const operativo = equipment.filter(e => e.status === 'operativo').length;
    const enMantenimiento = equipment.filter(e => e.status === 'mantenimiento').length;
    const fueraServicio = equipment.filter(e => e.status === 'fuera_servicio').length;

    const proximasMantencion = equipment.filter(e =>
      e.fecha_proxima_mantencion && e.fecha_proxima_mantencion >= today && e.fecha_proxima_mantencion <= in30Days
    );
    const vencidas = equipment.filter(e =>
      e.fecha_proxima_mantencion && e.fecha_proxima_mantencion < today
    );

    const thisMonth = new Date().toISOString().slice(0, 7);
    const interventionsThisMonth = records.filter(r => r.fecha?.startsWith(thisMonth)).length;
    const totalHours = records.reduce((s, r) => s + (r.horas_trabajadas || 0), 0);

    return { operativo, enMantenimiento, fueraServicio, proximasMantencion, vencidas, interventionsThisMonth, totalHours };
  }, [equipment, records, today, in30Days]);

  const byTypeChart = useMemo(() => Object.entries(
    records.reduce((acc, r) => { acc[r.type] = (acc[r.type] || 0) + 1; return acc; }, {})
  ).map(([type, value]) => ({ name: type.charAt(0).toUpperCase() + type.slice(1), value, fill: TYPE_COLORS[type] || '#6366f1' })), [records]);

  const byMonthChart = useMemo(() => {
    const map = {};
    records.forEach(r => {
      const m = r.fecha?.slice(0, 7); if (!m) return;
      if (!map[m]) map[m] = { month: m, preventivo: 0, correctivo: 0 };
      if (r.type === 'preventivo') map[m].preventivo++;
      if (r.type === 'correctivo') map[m].correctivo++;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [records]);

  const equipmentStatusData = [
    { name: 'Operativo', value: stats.operativo, fill: '#22c55e' },
    { name: 'Mantenimiento', value: stats.enMantenimiento, fill: '#eab308' },
    { name: 'Fuera servicio', value: stats.fueraServicio, fill: '#ef4444' },
    { name: 'Standby', value: equipment.filter(e => e.status === 'standby').length, fill: '#94a3b8' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Equipos totales', value: equipment.length, icon: Cpu, color: 'border-l-slate-400 text-slate-700' },
          { label: 'Operativos', value: stats.operativo, icon: CheckCircle, color: 'border-l-green-500 text-green-700' },
          { label: 'En mantención', value: stats.enMantenimiento, icon: Wrench, color: 'border-l-yellow-500 text-yellow-700' },
          { label: 'Fuera servicio', value: stats.fueraServicio, icon: AlertTriangle, color: 'border-l-red-500 text-red-700' },
          { label: 'Intervenciones mes', value: stats.interventionsThisMonth, icon: Calendar, color: 'border-l-indigo-500 text-indigo-700' },
          { label: 'Horas acumuladas', value: `${stats.totalHours.toFixed(0)}h`, icon: Clock, color: 'border-l-blue-500 text-blue-700' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className={`border-l-4 ${color.split(' ')[0]}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${color.split(' ')[1]}`}>{value}</p>
                </div>
                <Icon className="w-7 h-7 opacity-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {(stats.vencidas.length > 0 || stats.proximasMantencion.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {stats.vencidas.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Mantenciones vencidas ({stats.vencidas.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {stats.vencidas.slice(0, 5).map(e => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-red-800">{e.nombre} · {e.numero_interno}</span>
                    <Badge className="bg-red-100 text-red-700 text-xs">{e.fecha_proxima_mantencion}</Badge>
                  </div>
                ))}
                {stats.vencidas.length > 5 && <p className="text-xs text-red-600">+{stats.vencidas.length - 5} más</p>}
              </CardContent>
            </Card>
          )}
          {stats.proximasMantencion.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-yellow-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Próximas 30 días ({stats.proximasMantencion.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {stats.proximasMantencion.slice(0, 5).map(e => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-yellow-800">{e.nombre} · {e.numero_interno}</span>
                    <Badge className="bg-yellow-100 text-yellow-700 text-xs">{e.fecha_proxima_mantencion}</Badge>
                  </div>
                ))}
                {stats.proximasMantencion.length > 5 && <p className="text-xs text-yellow-600">+{stats.proximasMantencion.length - 5} más</p>}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Intervenciones por mes</CardTitle></CardHeader>
          <CardContent>
            {byMonthChart.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Sin datos de intervenciones</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byMonthChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="preventivo" name="Preventivo" fill={TYPE_COLORS.preventivo} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="correctivo" name="Correctivo" fill={TYPE_COLORS.correctivo} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Estado equipos</CardTitle></CardHeader>
          <CardContent>
            {equipmentStatusData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Sin equipos registrados</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={equipmentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {equipmentStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent interventions */}
      {records.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Últimas intervenciones</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {records.slice(0, 5).map(r => {
                const eq = equipment.find(e => e.id === r.equipment_id);
                return (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: TYPE_COLORS[r.type] || '#6366f1' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{r.descripcion}</p>
                      <p className="text-xs text-slate-500">{eq ? `${eq.nombre} · ${eq.numero_interno}` : 'Equipo no especificado'} · {r.tecnico || 'Sin técnico'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge className={`text-xs ${r.type === 'preventivo' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{r.type}</Badge>
                      <p className="text-xs text-slate-400 mt-0.5">{r.fecha}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}