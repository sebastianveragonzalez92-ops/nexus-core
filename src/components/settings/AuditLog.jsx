import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, ClipboardList, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const ACTION_CONFIG = {
  create: { label: 'Crear', color: 'bg-emerald-100 text-emerald-700' },
  update: { label: 'Actualizar', color: 'bg-blue-100 text-blue-700' },
  delete: { label: 'Eliminar', color: 'bg-red-100 text-red-700' },
  approve: { label: 'Aprobar', color: 'bg-violet-100 text-violet-700' },
  reject: { label: 'Rechazar', color: 'bg-orange-100 text-orange-700' },
  sync: { label: 'Sincronizar', color: 'bg-slate-100 text-slate-700' },
};

export default function AuditLog() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['activityLogs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 100),
  });

  const modules = [...new Set(logs.map((l) => l.module).filter(Boolean))];

  const filtered = logs.filter((log) => {
    const matchSearch =
      log.details?.toLowerCase().includes(search.toLowerCase()) ||
      log.module?.toLowerCase().includes(search.toLowerCase()) ||
      log.created_by?.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'all' || log.action === actionFilter;
    const matchModule = moduleFilter === 'all' || log.module === moduleFilter;

    if (dateRange !== 'all') {
      const daysDiff = (Date.now() - new Date(log.created_date)) / (1000 * 60 * 60 * 24);
      if (dateRange === 'today' && daysDiff > 1) return false;
      if (dateRange === 'week' && daysDiff > 7) return false;
      if (dateRange === 'month' && daysDiff > 30) return false;
    }

    return matchSearch && matchAction && matchModule;
  });

  const grouped = filtered.reduce((acc, log) => {
    const date = format(new Date(log.created_date), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  return (
    <Card className="rounded-2xl border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-50">
            <ClipboardList className="w-5 h-5 text-amber-600" />
          </div>
          Historial de Auditoría
        </CardTitle>
        <CardDescription>Registro de todas las acciones realizadas en la plataforma</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por usuario, módulo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-36 rounded-xl">
              <Filter className="w-3 h-3 mr-1 text-slate-400" />
              <SelectValue placeholder="Acción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Object.entries(ACTION_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {modules.length > 0 && (
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-40 rounded-xl">
                <SelectValue placeholder="Módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {modules.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40 rounded-xl">
              <Calendar className="w-3 h-3 mr-1 text-slate-400" />
              <SelectValue placeholder="Fecha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo el tiempo</SelectItem>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Log list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <ClipboardList className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            Sin registros de auditoría
          </div>
        ) : (
          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
            {Object.entries(grouped).map(([date, entries]) => (
              <div key={date}>
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
                  {format(new Date(date), "EEEE d 'de' MMMM yyyy", { locale: es })}
                </p>
                <div className="space-y-2">
                  {entries.map((log) => {
                    const cfg = ACTION_CONFIG[log.action] || { label: log.action, color: 'bg-slate-100 text-slate-700' };
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <Badge className={cn('text-xs border-0', cfg.color)}>{cfg.label}</Badge>
                            {log.module && <span className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md px-1.5 py-0.5">{log.module}</span>}
                          </div>
                          <p className="text-sm text-slate-700 truncate">{log.details || 'Sin detalle'}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {log.created_by || 'Sistema'} · {format(new Date(log.created_date), 'HH:mm')}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}