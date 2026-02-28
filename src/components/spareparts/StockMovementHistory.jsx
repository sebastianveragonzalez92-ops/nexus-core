import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, Search, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const tipoConfig = {
  entrada: { label: 'Entrada', color: 'bg-green-100 text-green-700', icon: ArrowUpCircle, iconColor: 'text-green-600' },
  salida:  { label: 'Salida',  color: 'bg-red-100 text-red-700',   icon: ArrowDownCircle, iconColor: 'text-red-500' },
  ajuste:  { label: 'Ajuste',  color: 'bg-blue-100 text-blue-700', icon: RefreshCw, iconColor: 'text-blue-500' },
};

export default function StockMovementHistory({ spareParts }) {
  const [search, setSearch] = useState('');
  const [partFilter, setPartFilter] = useState('all');
  const [tipoFilter, setTipoFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['stockMovements'],
    queryFn: () => base44.entities.StockMovement.list('-created_date', 500),
  });

  const filtered = movements.filter(m => {
    if (partFilter !== 'all' && m.spare_part_id !== partFilter) return false;
    if (tipoFilter !== 'all' && m.tipo !== tipoFilter) return false;
    if (search && !m.spare_part_name?.toLowerCase().includes(search.toLowerCase()) && !m.spare_part_code?.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateFrom) {
      const mDate = new Date(m.created_date);
      const from = new Date(dateFrom);
      if (mDate < from) return false;
    }
    if (dateTo) {
      const mDate = new Date(m.created_date);
      const to = new Date(dateTo);
      to.setHours(23, 59, 59);
      if (mDate > to) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setSearch('');
    setPartFilter('all');
    setTipoFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasFilters = search || partFilter !== 'all' || tipoFilter !== 'all' || dateFrom || dateTo;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative min-w-[180px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Buscar repuesto..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Select value={partFilter} onValueChange={setPartFilter}>
          <SelectTrigger className="w-52">
            <Filter className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
            <SelectValue placeholder="Repuesto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los repuestos</SelectItem>
            {spareParts.map(p => (
              <SelectItem key={p.id} value={p.id}>[{p.code}] {p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="entrada">Entrada</SelectItem>
            <SelectItem value="salida">Salida</SelectItem>
            <SelectItem value="ajuste">Ajuste</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-36 text-xs" />
          <span className="text-slate-400 text-sm">—</span>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-36 text-xs" />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-slate-500">
            <X className="w-4 h-4" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-500">{filtered.length} movimiento(s)</p>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Cargando historial...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <RefreshCw className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Sin movimientos registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Repuesto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cantidad</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stock ant.</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stock post.</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Usuario</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">OT</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(m => {
                  const cfg = tipoConfig[m.tipo] || tipoConfig.ajuste;
                  const Icon = cfg.icon;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {m.created_date ? format(new Date(m.created_date), 'dd MMM yyyy HH:mm', { locale: es }) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-400">{m.spare_part_code}</span>
                        <br />
                        <span className="font-medium text-slate-800">{m.spare_part_name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${cfg.color} gap-1.5 border-transparent`}>
                          <Icon className={`w-3 h-3 ${cfg.iconColor}`} />
                          {cfg.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">{m.cantidad}</td>
                      <td className="px-4 py-3 text-right text-slate-500">{m.stock_anterior ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700">{m.stock_posterior ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{m.user_name || m.user_email || '—'}</td>
                      <td className="px-4 py-3 text-xs text-indigo-600">
                        {m.work_order_number ? `#${m.work_order_number}` : m.work_order_id ? `OT` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-[160px] truncate">{m.notas || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}