import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Pencil, AlertCircle, ClipboardList, ClipboardCheck, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import InstallationReportPDF from './InstallationReportPDF';

const ESTADO_STYLES = {
  borrador: { bg: 'bg-slate-100 text-slate-600', label: 'Borrador' },
  enviado: { bg: 'bg-blue-100 text-blue-700', label: 'Enviado' },
  aprobado: { bg: 'bg-green-100 text-green-700', label: 'Aprobado' },
};

export default function InstallationReportList({ reports, isLoading, onView, onEdit }) {
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('all');
  const [estadoFilter, setEstadoFilter] = useState('all');

  const filtered = reports.filter(r => {
    const matchSearch = !search ||
      r.equipo_numero?.toLowerCase().includes(search.toLowerCase()) ||
      r.cliente?.toLowerCase().includes(search.toLowerCase()) ||
      r.empresa?.toLowerCase().includes(search.toLowerCase()) ||
      r.realizado_por?.toLowerCase().includes(search.toLowerCase());
    const matchTipo = tipoFilter === 'all' || r.tipo === tipoFilter;
    const matchEstado = estadoFilter === 'all' || r.estado === estadoFilter;
    return matchSearch && matchTipo && matchEstado;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 bg-slate-50">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por equipo, cliente, empresa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-48 bg-white">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="preinstalacion">Pre-instalación</SelectItem>
            <SelectItem value="postinstalacion">Post-instalación</SelectItem>
          </SelectContent>
        </Select>
        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
          <SelectTrigger className="w-36 bg-white">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="borrador">Borrador</SelectItem>
            <SelectItem value="enviado">Enviado</SelectItem>
            <SelectItem value="aprobado">Aprobado</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-slate-400 self-center">{filtered.length} resultado(s)</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Tipo</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Equipo</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Cliente / Empresa</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Realizado por</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Fecha</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-slate-400">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No hay informes</p>
                  <p className="text-xs mt-1">Crea tu primer informe de instalación</p>
                </td>
              </tr>
            ) : (
              filtered.map(report => {
                const estado = ESTADO_STYLES[report.estado] || ESTADO_STYLES.borrador;
                const isPost = report.tipo === 'postinstalacion';
                return (
                  <tr
                    key={report.id}
                    className="border-b border-slate-50 hover:bg-teal-50/20 transition-colors cursor-pointer group"
                    onClick={() => onView(report)}
                  >
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${isPost ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>
                        {isPost ? <ClipboardCheck className="w-3 h-3" /> : <ClipboardList className="w-3 h-3" />}
                        {isPost ? 'Post-instalación' : 'Pre-instalación'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                        {report.equipo_numero || '—'}
                      </p>
                      <p className="text-xs text-slate-400">{report.equipo_marca} {report.equipo_modelo}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700 text-sm">{report.cliente || '—'}</p>
                      <p className="text-xs text-slate-400">{report.empresa}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-sm">{report.realizado_por || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${estado.bg}`}>
                        {estado.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {report.fecha ? format(new Date(report.fecha), 'dd MMM yyyy', { locale: es }) : '—'}
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onView(report)} className="h-7 w-7 hover:bg-teal-100">
                          <Eye className="w-3.5 h-3.5 text-teal-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onEdit(report)} className="h-7 w-7 hover:bg-slate-100">
                          <Pencil className="w-3.5 h-3.5 text-slate-400" />
                        </Button>
                        <InstallationReportPDF report={report} />
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