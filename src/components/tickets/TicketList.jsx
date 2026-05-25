import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Pencil, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_COLORS = {
  abierto: 'bg-blue-100 text-blue-700',
  en_progreso: 'bg-yellow-100 text-yellow-700',
  resuelto: 'bg-green-100 text-green-700',
  cerrado: 'bg-slate-100 text-slate-600',
};

const PRIORITY_COLORS = {
  baja: 'bg-slate-100 text-slate-600',
  media: 'bg-blue-100 text-blue-700',
  alta: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
};

const STATUS_LABELS = {
  abierto: 'Abierto',
  en_progreso: 'En Progreso',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
};

const CATEGORY_LABELS = {
  bug: 'Bug',
  feature: 'Función',
  billing: 'Facturación',
  account: 'Cuenta',
  other: 'Otro',
};

export default function TicketList({ tickets, isLoading, onEdit }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filtered = tickets.filter(t => {
    const matchSearch = !search ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.user_email?.toLowerCase().includes(search.toLowerCase());
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
    <div className="bg-white rounded-xl border border-slate-200">
      {/* Filtros */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por asunto o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
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
          <SelectTrigger className="w-36">
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
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Asunto</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Usuario</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Categoría</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Prioridad</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Estado</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Fecha</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No hay tickets registrados
                </td>
              </tr>
            ) : (
              filtered.map(ticket => (
                <tr key={ticket.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">
                    {ticket.subject}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{ticket.user_email}</td>
                  <td className="px-4 py-3">
                    <span className="text-slate-600 text-xs">
                      {CATEGORY_LABELS[ticket.category] || ticket.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${PRIORITY_COLORS[ticket.priority] || ''}`}>
                      {ticket.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${STATUS_COLORS[ticket.status] || ''}`}>
                      {STATUS_LABELS[ticket.status] || ticket.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {ticket.created_date
                      ? format(new Date(ticket.created_date), 'dd MMM yyyy', { locale: es })
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(ticket)}>
                      <Pencil className="w-4 h-4 text-slate-500" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}