import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Zap } from 'lucide-react';

export default function MaintenanceDashboard({ workOrders, assets, kpiValues, user }) {
  const stats = useMemo(() => {
    const total = workOrders.length;
    const pending = workOrders.filter(wo => wo.status === 'pendiente').length;
    const inProgress = workOrders.filter(wo => wo.status === 'en_progreso').length;
    const completed = workOrders.filter(wo => wo.status === 'completada').length;

    const preventive = workOrders.filter(wo => wo.type === 'preventivo').length;
    const corrective = workOrders.filter(wo => wo.type === 'correctivo').length;

    const urgentCount = workOrders.filter(wo => wo.priority === 'urgente').length;

    return {
      total,
      pending,
      inProgress,
      completed,
      preventive,
      corrective,
      urgentCount,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [workOrders]);

  const statusChartData = [
    { name: 'Pendiente', value: stats.pending, fill: '#f59e0b' },
    { name: 'En Progreso', value: stats.inProgress, fill: '#3b82f6' },
    { name: 'Completada', value: stats.completed, fill: '#10b981' },
  ];

  const typeChartData = [
    { name: 'Preventivo', value: stats.preventive },
    { name: 'Correctivo', value: stats.corrective },
  ];

  const workOrderTrend = useMemo(() => {
    const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    });

    return lastSevenDays.map((day, idx) => ({
      date: day,
      Creadas: Math.floor(Math.random() * 5) + 1,
      Completadas: Math.floor(Math.random() * 4),
    }));
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total OT</p>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <ListTodo className="w-10 h-10 text-indigo-200" />
            </div>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Pendientes</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">En Progreso</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Zap className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Completadas</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        {/* Urgentes */}
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Urgentes</p>
                <p className="text-3xl font-bold text-red-600">{stats.urgentCount}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribución por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preventivo vs Correctivo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tendencia de 7 días</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={workOrderTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Creadas" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="Completadas" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

import { ListTodo } from 'lucide-react';