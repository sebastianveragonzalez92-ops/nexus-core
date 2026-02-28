import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function KPIReports({ kpis, kpiValues }) {
  const prepareChartData = (kpiId) => {
    return kpiValues
      .filter(v => v.kpi_id === kpiId)
      .slice(0, 12)
      .sort((a, b) => new Date(a.period) - new Date(b.period))
      .map(v => ({
        period: v.period,
        value: v.value,
        target: v.target,
      }));
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Reportes de KPIs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {kpis.length > 0 ? (
              kpis.map((kpi, index) => {
                const chartData = prepareChartData(kpi.id);

                return chartData.length > 0 ? (
                  <motion.div
                    key={kpi.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-slate-100 pb-8 last:border-0"
                  >
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">{kpi.name}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#3b82f6"
                          name="Valor Actual"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="target"
                          stroke="#10b981"
                          name="Objetivo"
                          strokeDasharray="5 5"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>
                ) : null;
              })
            ) : (
              <p className="text-center text-slate-500 py-8">No hay datos de KPI disponibles</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}