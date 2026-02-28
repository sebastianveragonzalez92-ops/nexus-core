import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Cpu, Pencil, Trash2, Search, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import EquipmentForm from './EquipmentForm';

const statusConfig = {
  operativo: { label: 'Operativo', color: 'bg-green-100 text-green-700' },
  mantenimiento: { label: 'En mantención', color: 'bg-yellow-100 text-yellow-700' },
  fuera_servicio: { label: 'Fuera de servicio', color: 'bg-red-100 text-red-700' },
  standby: { label: 'Standby', color: 'bg-slate-100 text-slate-600' },
};

function EquipmentRow({ eq, reports, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const sc = statusConfig[eq.status] || statusConfig.operativo;
  const eqReports = reports.filter(r =>
    r.numero_interno_equipo === eq.numero_interno ||
    r.tipo_equipo === eq.tipo_equipo && r.numero_interno_equipo === eq.numero_interno
  );

  const isOverdue = eq.fecha_proxima_mantencion &&
    new Date(eq.fecha_proxima_mantencion + 'T00:00:00') < new Date();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center gap-4 px-4 py-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className="font-semibold text-slate-900">{eq.nombre}</span>
              <Badge className={sc.color}>{sc.label}</Badge>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
              <span>Tipo: <strong>{eq.tipo_equipo}</strong></span>
              <span>N° interno: <strong>{eq.numero_interno}</strong></span>
              {eq.empresa && <span>{eq.empresa}{eq.division ? ` · ${eq.division}` : ''}</span>}
              {eq.fecha_proxima_mantencion && (
                <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                  Próx. mantención: {eq.fecha_proxima_mantencion}{isOverdue ? ' ⚠️' : ''}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)} title="Ver historial">
              {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(eq)}><Pencil className="w-4 h-4 text-slate-400" /></Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(eq.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
          </div>
        </div>

        {/* Maintenance history */}
        {expanded && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Historial de informes vinculados ({eqReports.length})
            </p>
            {eqReports.length === 0 ? (
              <p className="text-xs text-slate-400">Sin informes de mantención registrados para este equipo.</p>
            ) : (
              <div className="space-y-1.5">
                {eqReports.map(r => (
                  <div key={r.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs">
                    <div>
                      <span className="font-medium text-slate-800">{r.title || `${r.tipo_equipo} ${r.numero_interno_equipo}`}</span>
                      <span className="text-slate-400 ml-2">{r.report_date}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <Badge className={r.type === 'preventivo' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}>
                        {r.type}
                      </Badge>
                      <Badge className={r.status === 'aprobado' ? 'bg-green-100 text-green-700' : r.status === 'enviado' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}>
                        {r.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function EquipmentManager() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 200),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['allMaintenanceReports'],
    queryFn: () => base44.entities.MaintenanceReport.list('-created_date', 200),
  });

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ['equipment'] });
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este equipo?')) return;
    await base44.entities.Equipment.delete(id);
    queryClient.invalidateQueries({ queryKey: ['equipment'] });
  };

  const filtered = equipment.filter(e =>
    !search ||
    e.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    e.tipo_equipo?.toLowerCase().includes(search.toLowerCase()) ||
    e.numero_interno?.toLowerCase().includes(search.toLowerCase()) ||
    e.empresa?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: equipment.length,
    operativo: equipment.filter(e => e.status === 'operativo').length,
    mantenimiento: equipment.filter(e => e.status === 'mantenimiento').length,
    fuera_servicio: equipment.filter(e => e.status === 'fuera_servicio').length,
  };

  const overdueCount = equipment.filter(e =>
    e.fecha_proxima_mantencion && new Date(e.fecha_proxima_mantencion + 'T00:00:00') < new Date()
  ).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Equipos</h2>
          <p className="text-sm text-slate-500">{stats.total} equipos registrados{overdueCount > 0 ? ` · ⚠️ ${overdueCount} con mantención vencida` : ''}</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" /> Agregar equipo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-slate-50 border-slate-200 text-slate-700' },
          { label: 'Operativos', value: stats.operativo, color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'En mantención', value: stats.mantenimiento, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'Fuera de servicio', value: stats.fuera_servicio, color: 'bg-red-50 border-red-200 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.color}`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar por nombre, tipo, N° interno, empresa…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
          <Cpu className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">{search ? 'Sin resultados' : 'Sin equipos registrados'}</p>
          {!search && (
            <Button onClick={() => setShowForm(true)} variant="outline" className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Agregar equipo
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(eq => (
            <EquipmentRow
              key={eq.id}
              eq={eq}
              reports={reports}
              onEdit={(e) => { setEditing(e); setShowForm(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={v => { setShowForm(v); if (!v) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar equipo' : 'Agregar equipo'}</DialogTitle>
          </DialogHeader>
          <EquipmentForm
            equipment={editing}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}