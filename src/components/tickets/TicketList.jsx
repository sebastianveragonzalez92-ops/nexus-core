import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Pencil, Eye, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { labelOf, priorityColor, statusStyle } from '@/lib/ticketConfigDefaults';

export default function TicketList({ tickets, config, isLoading, onEdit, onView, onStatusChange }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const statuses = config.statuses || [];
  const priorities = config.priorities || [];

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
          <Input placeholder="Buscar por asunto, email o ubicación..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 bg-white"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {statuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36 bg-white"><SelectValue placeholder="Prioridad" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {priorities.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
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
                const status = statusStyle(config, ticket.status);
                const priorityCls = priorityColor(config, ticket.priority);
                return (
                  <tr key={ticket.id} className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors cursor-pointer group" onClick={() => onView(ticket)}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors line-clamp-1">{ticket.subject}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{ticket.user_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        {ticket.tipo ? labelOf(config, 'tipos', ticket.tipo) : (ticket.category ? labelOf(config, 'categories', ticket.category) : '—')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityCls}`}>
                        {labelOf(config, 'priorities', ticket.priority)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{ticket.ubicacion || '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {ticket.created_date ? format(new Date(ticket.created_date), 'dd MMM yyyy', { locale: es }) : '—'}
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