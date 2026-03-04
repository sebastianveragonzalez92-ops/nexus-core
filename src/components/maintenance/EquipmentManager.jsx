import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Cpu, Pencil, Trash2, FileText, ChevronDown, ChevronUp, Download, Upload, Calendar, Clock, User, Filter } from 'lucide-react';
import EquipmentForm from './EquipmentForm';
import AdvancedSearch from '@/components/AdvancedSearch';

const statusConfig = {
  operativo: { label: 'Operativo', color: 'bg-green-100 text-green-700' },
  standby: { label: 'Standby', color: 'bg-slate-100 text-slate-600' },
};

const typeColors = {
  preventivo: 'bg-blue-100 text-blue-700',
  correctivo: 'bg-orange-100 text-orange-700',
};
const statusColors = {
  aprobado: 'bg-green-100 text-green-700',
  enviado: 'bg-blue-100 text-blue-700',
  borrador: 'bg-yellow-100 text-yellow-700',
};

function EquipmentRow({ eq, reports, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [histFilter, setHistFilter] = useState({ type: 'all', status: 'all', dateFrom: '', dateTo: '' });
  const sc = statusConfig[eq.status] || statusConfig.operativo;

  const eqReports = reports.filter(r =>
    r.numero_interno_equipo === eq.numero_interno
  ).sort((a, b) => (b.report_date || '').localeCompare(a.report_date || ''));

  const filteredReports = eqReports.filter(r => {
    if (histFilter.type !== 'all' && r.type !== histFilter.type) return false;
    if (histFilter.status !== 'all' && r.status !== histFilter.status) return false;
    if (histFilter.dateFrom && r.report_date < histFilter.dateFrom) return false;
    if (histFilter.dateTo && r.report_date > histFilter.dateTo) return false;
    return true;
  });

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
            {onEdit && <Button variant="ghost" size="icon" onClick={() => onEdit(eq)}><Pencil className="w-4 h-4 text-slate-400" /></Button>}
            {onDelete && <Button variant="ghost" size="icon" onClick={() => onDelete(eq.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>}
          </div>
        </div>

        {/* Maintenance history */}
        {expanded && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 space-y-3">
            {/* Header + filters */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Historial de informes ({eqReports.length} total, {filteredReports.length} mostrando)
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <Select value={histFilter.type} onValueChange={v => setHistFilter(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="h-7 text-xs w-32">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="preventivo">Preventivo</SelectItem>
                    <SelectItem value="correctivo">Correctivo</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={histFilter.status} onValueChange={v => setHistFilter(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="h-7 text-xs w-32">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="aprobado">Aprobado</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="borrador">Borrador</SelectItem>
                  </SelectContent>
                </Select>
                <input
                  type="date"
                  value={histFilter.dateFrom}
                  onChange={e => setHistFilter(f => ({ ...f, dateFrom: e.target.value }))}
                  className="h-7 text-xs border border-slate-200 rounded-md px-2 bg-white"
                  placeholder="Desde"
                />
                <input
                  type="date"
                  value={histFilter.dateTo}
                  onChange={e => setHistFilter(f => ({ ...f, dateTo: e.target.value }))}
                  className="h-7 text-xs border border-slate-200 rounded-md px-2 bg-white"
                  placeholder="Hasta"
                />
                {(histFilter.type !== 'all' || histFilter.status !== 'all' || histFilter.dateFrom || histFilter.dateTo) && (
                  <button
                    onClick={() => setHistFilter({ type: 'all', status: 'all', dateFrom: '', dateTo: '' })}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Report list */}
            {filteredReports.length === 0 ? (
              <p className="text-xs text-slate-400">
                {eqReports.length === 0 ? 'Sin informes de mantención registrados.' : 'Sin resultados con los filtros aplicados.'}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredReports.map(r => (
                  <div key={r.id} className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs space-y-2">
                    {/* Row 1: title + badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800">{r.title || `Informe ${r.tipo_equipo} · ${r.numero_interno_equipo}`}</span>
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge className={typeColors[r.type] || 'bg-slate-100 text-slate-600'}>{r.type}</Badge>
                        <Badge className={statusColors[r.status] || 'bg-slate-100 text-slate-600'}>{r.status}</Badge>
                      </div>
                    </div>
                    {/* Row 2: meta details */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500">
                      {r.report_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {r.report_date}
                        </span>
                      )}
                      {(r.hora_inicio || r.hora_fin) && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {r.hora_inicio}{r.hora_fin ? ` – ${r.hora_fin}` : ''}
                        </span>
                      )}
                      {r.responsable && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {r.responsable}
                        </span>
                      )}
                      {r.fecha_proxima_mantencion && (
                        <span className="text-indigo-600">Próx. mantención: {r.fecha_proxima_mantencion}</span>
                      )}
                    </div>
                    {/* Row 3: observations */}
                    {r.observations && (
                      <p className="text-slate-500 italic border-t border-slate-100 pt-1.5">{r.observations}</p>
                    )}
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

export default function EquipmentManager({ user }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [importing, setImporting] = useState(false);
  const importRef = useRef(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'all', tipo: 'all' });
  const queryClient = useQueryClient();
  const canManage = ['admin', 'supervisor'].includes(user?.role);

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

  const filtered = equipment.filter(e => {
    const matchSearch = !search ||
      e.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      e.tipo_equipo?.toLowerCase().includes(search.toLowerCase()) ||
      e.numero_interno?.toLowerCase().includes(search.toLowerCase()) ||
      e.empresa?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filters.status === 'all' || e.status === filters.status;
    const matchType = filters.tipo === 'all' || e.tipo_equipo === filters.tipo;
    return matchSearch && matchStatus && matchType;
  });

  const stats = {
    total: equipment.length,
    operativo: equipment.filter(e => e.status === 'operativo').length,
  };

  const overdueCount = equipment.filter(e =>
    e.fecha_proxima_mantencion && new Date(e.fecha_proxima_mantencion + 'T00:00:00') < new Date()
  ).length;

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    try {
      let text = await file.text();
      // Remove BOM if present
      text = text.replace(/^\uFEFF/, '');
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) { alert('Archivo vacío o sin datos'); return; }
      // Detect separator (comma or semicolon)
      const separator = lines[0].includes(';') ? ';' : ',';
      // Normalize headers: remove accents, special chars, lowercase
      const normalize = (s) => s.normalize('NFD').replace(/[\u0300-\u036f°]/g, '').toLowerCase().trim();
      const headers = lines[0].split(separator).map(h => normalize(h.replace(/^"|"$/g, '')));
      // Map headers by index - use all columns, best-effort matching
      const hi = (terms) => {
        for (const t of terms) {
          const idx = headers.findIndex(h => h.includes(t));
          if (idx >= 0) return idx;
        }
        return -1;
      };
      const colMap = {
        nombre:                   hi(['equipo', 'nombre', 'name']),
        tipo_equipo:              hi(['hardware', 'tipo', 'flota']),
        numero_interno:           hi(['device', 'interno', 'id']),
        numero_serie:             hi(['serie', 'serial']),
        fabricante:               hi(['fabricante', 'marca']),
        modelo:                   hi(['modelo', 'model']),
        empresa:                  hi(['empresa', 'company']),
        division:                 hi(['divis']),
        status:                   hi(['conectiv', 'estado', 'status']),
        fecha_instalacion:        hi(['instalac']),
        fecha_proxima_mantencion: hi(['mantenc', 'prox']),
        notas:                    hi(['desconex', 'lastupdated', 'nota']),
      };
      // If nombre not found, use first column
      if (colMap.nombre < 0) colMap.nombre = 0;
      const parseRow = (line) => {
        const cols = [];
        let cur = '', inQ = false;
        for (const ch of line) {
          if (ch === '"') inQ = !inQ;
          else if (ch === separator && !inQ) { cols.push(cur); cur = ''; }
          else cur += ch;
        }
        cols.push(cur);
        return cols.map(c => c.replace(/^"|"$/g, '').trim());
      };
      const records = lines.slice(1).map(line => {
        const cols = parseRow(line);
        if (cols.every(c => !c)) return null; // skip empty lines
        const get = (idx) => idx >= 0 && idx < cols.length ? cols[idx] || '' : '';
        const nombre = get(colMap.nombre) || cols[0] || '';
        if (!nombre) return null;
        return {
          nombre,
          tipo_equipo: get(colMap.tipo_equipo),
          numero_interno: get(colMap.numero_interno) || nombre,
          numero_serie: get(colMap.numero_serie),
          fabricante: get(colMap.fabricante),
          modelo: get(colMap.modelo),
          empresa: get(colMap.empresa),
          division: get(colMap.division),
          status: 'operativo',
          fecha_instalacion: get(colMap.fecha_instalacion),
          fecha_proxima_mantencion: get(colMap.fecha_proxima_mantencion),
          notas: get(colMap.notas),
        };
      }).filter(Boolean);
      if (records.length === 0) {
        alert(`No se encontraron filas válidas.\n\nEncabezados: ${headers.join(', ')}`);
        return;
      }
      await base44.entities.Equipment.bulkCreate(records);
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      alert(`${records.length} equipos importados correctamente`);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const exportToExcel = () => {
    const headers = ['Nombre', 'Tipo Equipo', 'N° Interno', 'N° Serie', 'Fabricante', 'Modelo', 'Empresa', 'División', 'Estado', 'Fecha Instalación', 'Próx. Mantención', 'Notas'];
    const rows = filtered.map(e => [
      e.nombre || '',
      e.tipo_equipo || '',
      e.numero_interno || '',
      e.numero_serie || '',
      e.fabricante || '',
      e.modelo || '',
      e.empresa || '',
      e.division || '',
      e.status || '',
      e.fecha_instalacion || '',
      e.fecha_proxima_mantencion || '',
      e.notas || '',
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equipos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Equipos</h2>
          <p className="text-sm text-slate-500">{stats.total} equipos registrados{overdueCount > 0 ? ` · ⚠️ ${overdueCount} con mantención vencida` : ''}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={exportToExcel} className="gap-2">
            <Download className="w-4 h-4" /> Exportar
          </Button>
          {canManage && (
            <>
              <input ref={importRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
              <Button variant="outline" onClick={() => importRef.current?.click()} disabled={importing} className="gap-2">
                <Upload className="w-4 h-4" /> {importing ? 'Importando…' : 'Importar CSV'}
              </Button>
              <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                <Plus className="w-4 h-4" /> Crear equipo
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-slate-50 border-slate-200 text-slate-700' },
          { label: 'Operativos', value: stats.operativo, color: 'bg-green-50 border-green-200 text-green-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.color}`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Advanced Search */}
      <AdvancedSearch
        searchPlaceholder="Buscar por nombre, tipo, N° interno, empresa…"
        searchValue={search}
        onSearch={setSearch}
        filters={[
          {
            key: 'status',
            label: 'Estado',
            options: [
              { value: 'operativo', label: 'Operativo' },
              { value: 'standby', label: 'Standby' },
            ],
          },
          {
            key: 'tipo',
            label: 'Tipo',
            options: [...new Set(equipment.map(e => e.tipo_equipo))].map(t => ({ value: t, label: t })),
          },
        ]}
        activeFilters={filters}
        onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
      />

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
          <Cpu className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">{search ? 'Sin resultados' : 'Sin equipos registrados'}</p>
          {!search && canManage && (
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
              onEdit={canManage ? (e) => { setEditing(e); setShowForm(true); } : null}
              onDelete={canManage ? handleDelete : null}
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