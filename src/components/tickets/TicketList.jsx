import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Pencil, Eye, AlertCircle, Clock, CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_STYLES = {
  abierto: { bg: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'Abierto' },
  en_progreso: { bg: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500', label: 'En Progreso' },
  resuelto: { bg: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500', label: 'Resuelto' },
  cerrado: { bg: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400', label: 'Cerrado' },
};

const PRIORITY_STYLES = {
  baja: { bg: 'bg-slate-100 text-slate-600', label: 'Baja' },
  media: { bg: 'bg-blue-100 text-blue-700', label: 'Media' },
  alta: { bg: 'bg-orange-100 text-orange-700', label: 'Alta' },
  urgente: { bg: 'bg-red-100 text-red-700', label: '🔴 Urgente' },
};

const TIPO_LABELS = {
  incidente: 'Incidente', solicitud: 'Solicitud', consulta: 'Consulta',
  cambio: 'Cambio', otro: 'Otro',
};

const CATEGORY_LABELS = {
  bug: 'Bug', feature: 'Función', billing: 'Facturación', account: 'Cuenta', other: 'Otro',
};

export default function TicketList({ tickets, isLoading, onEdit, onView, onStatusChange }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filtered = tickets.filter(t => {
    const matchSearch = !search ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      t.ubicacion?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Filtros */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 bg-slate-50">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por asunto, email o ubicación..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 bg-white">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="abierto">Abierto</SelectItem>
            <SelectItem value="en_progreso">En Progreso</SelectItem>
            <SelectItem value="resuelto">Resuelto</SelectItem>
            <SelectItem value="cerrado">Cerrado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36 bg-white">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="baja">Baja</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-slate-400 self-center">{filtered.length} resultado(s)</span>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Ticket</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Tipo</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Prioridad</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Ubicación</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Fecha</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-slate-400">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No hay tickets</p>
                  <p className="text-xs mt-1">Intenta cambiar los filtros de búsqueda</p>
                </td>
              </tr>
            ) : (
              filtered.map(ticket => {
                const status = STATUS_STYLES[ticket.status] || STATUS_STYLES.abierto;
                const priority = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.media;
                return (
                  <tr
                    key={ticket.id}
                    className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                    onClick={() => onView(ticket)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors line-clamp-1">
                        {ticket.subject}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{ticket.user_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        {TIPO_LABELS[ticket.tipo] || CATEGORY_LABELS[ticket.category] || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priority.bg}`}>
                        {priority.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${status.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {ticket.ubicacion || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {ticket.created_date
                        ? format(new Date(ticket.created_date), 'dd MMM yyyy', { locale: es })
                        : '—'}
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onView(ticket)} className="h-7 w-7 hover:bg-indigo-100">
                          <Eye className="w-3.5 h-3.5 text-indigo-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onEdit(ticket)} className="h-7 w-7 hover:bg-slate-100">
                          <Pencil className="w-3.5 h-3.5 text-slate-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}