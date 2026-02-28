import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';

export default function KPITracking({ user, kpis, kpiValues }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const getLatestValue = (kpiId) => {
    return kpiValues
      .filter(v => v.kpi_id === kpiId)
      .sort((a, b) => new Date(b.period) - new Date(a.period))[0];
  };

  const getStatus = (kpi) => {
    const latest = getLatestValue(kpi.id);
    if (!latest) return 'no_data';
    
    const variance = ((latest.value - latest.target) / latest.target) * 100;
    if (variance >= -5) return 'achieved';
    if (variance >= -15) return 'at_risk';
    return 'not_achieved';
  };

  const filteredKPIs = kpis.filter(kpi => {
    const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kpi.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || getStatus(kpi) === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'achieved':
        return { label: 'En Objetivo', color: 'bg-green-100 text-green-800' };
      case 'at_risk':
        return { label: 'En Riesgo', color: 'bg-amber-100 text-amber-800' };
      case 'not_achieved':
        return { label: 'No Alcanzado', color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Sin Datos', color: 'bg-slate-100 text-slate-800' };
    }
  };

  const getTrendIcon = (latest, target) => {
    if (!latest || !target) return null;
    const variance = latest.value - target;
    return variance >= 0 ? (
      <TrendingUp className="w-5 h-5 text-green-600" />
    ) : (
      <TrendingDown className="w-5 h-5 text-red-600" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar KPIs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Todos los estados</SelectItem>
            <SelectItem value="achieved">En Objetivo</SelectItem>
            <SelectItem value="at_risk">En Riesgo</SelectItem>
            <SelectItem value="not_achieved">No Alcanzado</SelectItem>
            <SelectItem value="no_data">Sin Datos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs List */}
      <div className="space-y-4">
        {filteredKPIs.length > 0 ? (
          filteredKPIs.map((kpi, index) => {
            const latest = getLatestValue(kpi.id);
            const status = getStatus(kpi);
            const statusBadge = getStatusBadge(status);
            const variance = latest ? ((latest.value - latest.target) / latest.target) * 100 : 0;

            return (
              <motion.div
                key={kpi.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">{kpi.name}</h3>
                          <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                        </div>
                        {kpi.description && (
                          <p className="text-sm text-slate-600">{kpi.description}</p>
                        )}
                      </div>
                      {latest && getTrendIcon(latest.value, latest.target)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {latest && (
                        <>
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Valor Actual</p>
                            <p className="text-2xl font-bold text-slate-900">{latest.value}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Objetivo</p>
                            <p className="text-2xl font-bold text-slate-600">{latest.target}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Varianza</p>
                            <p className={`text-2xl font-bold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {variance >= 0 ? '+' : ''}{variance.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Período</p>
                            <p className="text-sm text-slate-700">{latest.period}</p>
                          </div>
                        </>
                      )}
                      {!latest && (
                        <p className="text-sm text-slate-500 col-span-full">Sin datos registrados</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <p className="text-center text-slate-500 py-8">No se encontraron KPIs</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}