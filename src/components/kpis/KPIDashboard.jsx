import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

export default function KPIDashboard({ user, kpis, kpiValues }) {
  // Calcular estadísticas generales
  const totalKPIs = kpis.length;
  const metricsOnTarget = kpis.filter(k => k.status === 'achieved').length;
  const metricsAtRisk = kpis.filter(k => k.status === 'at_risk').length;

  // Agrupar valores por KPI para gráficos
  const chartData = kpis.map(kpi => {
    const values = kpiValues.filter(v => v.kpi_id === kpi.id).slice(0, 12);
    return {
      kpi_id: kpi.id,
      kpi_name: kpi.name,
      data: values.map(v => ({
        period: v.period,
        value: v.value,
        target: v.target,
      })),
    };
  });

  const statusDistribution = [
    { name: 'En Objetivo', value: metricsOnTarget, color: '#10b981' },
    { name: 'En Riesgo', value: metricsAtRisk, color: '#f59e0b' },
    { name: 'No Alcanzado', value: totalKPIs - metricsOnTarget - metricsAtRisk, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total KPIs</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{totalKPIs}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">En Objetivo</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{metricsOnTarget}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {totalKPIs > 0 ? ((metricsOnTarget / totalKPIs) * 100).toFixed(0) : 0}%
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {((metricsOnTarget / totalKPIs) * 100).toFixed(0)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">En Riesgo</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{metricsAtRisk}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Requiere atención
                  </p>
                </div>
                <Badge className="bg-amber-100 text-amber-800">
                  ⚠️
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Distribution Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Distribución de Estados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* KPI Trends */}
      {chartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Tendencias de KPIs</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.map((item) => (
                item.data.length > 0 && (
                  <div key={item.kpi_id} className="mb-8">
                    <h4 className="text-sm font-semibold text-slate-900 mb-4">{item.kpi_name}</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={item.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" name="Valor" />
                        <Line type="monotone" dataKey="target" stroke="#10b981" name="Objetivo" strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )
              ))}
              {chartData.every(d => d.data.length === 0) && (
                <p className="text-center text-slate-500 py-8">No hay datos de KPI disponibles</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}