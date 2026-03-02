import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Cpu, Pencil, Trash2, FileText, ChevronDown, ChevronUp, Download, Upload } from 'lucide-react';
import { useRef } from 'react';
import EquipmentForm from './EquipmentForm';
import AdvancedSearch from '@/components/AdvancedSearch';

const statusConfig = {
  operativo: { label: 'Operativo', color: 'bg-green-100 text-green-700' },
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
            {onEdit && <Button variant="ghost" size="icon" onClick={() => onEdit(eq)}><Pencil className="w-4 h-4 text-slate-400" /></Button>}
            {onDelete && <Button variant="ghost" size="icon" onClick={() => onDelete(eq.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>}
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
      const colMap = {
        nombre: headers.findIndex(h => h.includes('nombre')),
        tipo_equipo: headers.findIndex(h => h.includes('tipo')),
        numero_interno: headers.findIndex(h => h.includes('interno')),
        numero_serie: headers.findIndex(h => h.includes('serie')),
        fabricante: headers.findIndex(h => h.includes('fabricante')),
        modelo: headers.findIndex(h => h.includes('modelo')),
        empresa: headers.findIndex(h => h.includes('empresa')),
        division: headers.findIndex(h => h.includes('divis')),
        status: headers.findIndex(h => h.includes('estado') || h.includes('status')),
        fecha_instalacion: headers.findIndex(h => h.includes('instalac')),
        fecha_proxima_mantencion: headers.findIndex(h => h.includes('mantenc') || h.includes('prox')),
        notas: headers.findIndex(h => h.includes('nota')),
      };
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
        const get = (idx) => idx >= 0 ? cols[idx] || '' : '';
        return {
          nombre: get(colMap.nombre),
          tipo_equipo: get(colMap.tipo_equipo),
          numero_interno: get(colMap.numero_interno),
          numero_serie: get(colMap.numero_serie),
          fabricante: get(colMap.fabricante),
          modelo: get(colMap.modelo),
          empresa: get(colMap.empresa),
          division: get(colMap.division),
          status: get(colMap.status) || 'operativo',
          fecha_instalacion: get(colMap.fecha_instalacion),
          fecha_proxima_mantencion: get(colMap.fecha_proxima_mantencion),
          notas: get(colMap.notas),
        };
      }).filter(r => r.nombre && r.numero_interno);
      if (records.length === 0) {
        alert('No se encontraron filas válidas. Asegúrate que el CSV tenga columnas "Nombre" y "N° Interno".');
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