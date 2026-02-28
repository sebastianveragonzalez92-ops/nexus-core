import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Wrench, Clock, DollarSign, Search, Package, CheckCircle2, AlertCircle, XCircle, Pencil, Trash2, Filter, ChevronDown, ChevronUp, History } from 'lucide-react';
import MaintenanceRecordForm from './MaintenanceRecordForm';
import EquipmentHistoryView from './EquipmentHistoryView';

const typeColors = {
  preventivo: 'bg-blue-100 text-blue-700',
  correctivo: 'bg-orange-100 text-orange-700',
  predictivo: 'bg-purple-100 text-purple-700',
  mejora: 'bg-teal-100 text-teal-700',
};

const resultConfig = {
  exitoso: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Exitoso' },
  parcial: { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle, label: 'Parcial' },
  fallido: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Fallido' },
};

function RecordCard({ record, equipment, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const rc = resultConfig[record.resultado] || resultConfig.exitoso;
  const Icon = rc.icon;
  const eq = equipment.find(e => e.id === record.equipment_id);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex gap-3 p-4">
          <div className="w-1 rounded-full shrink-0" style={{
            background: record.type === 'preventivo' ? '#3b82f6' : record.type === 'correctivo' ? '#f97316' : record.type === 'predictivo' ? '#a855f7' : '#14b8a6'
          }} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-semibold text-slate-900 text-sm">{record.fecha}</span>
              <Badge className={typeColors[record.type]}>{record.type}</Badge>
              <Badge className={rc.color}><Icon className="w-3 h-3 mr-1" />{rc.label}</Badge>
              {eq && <span className="text-xs text-slate-500 font-medium">{eq.nombre} · {eq.numero_interno}</span>}
            </div>
            <p className="text-sm text-slate-700 line-clamp-2 mb-1">{record.descripcion}</p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              {record.tecnico && <span>👤 {record.tecnico}</span>}
              {record.hora_inicio && <span>🕐 {record.hora_inicio}{record.hora_fin ? ` – ${record.hora_fin}` : ''}</span>}
              {record.horas_trabajadas > 0 && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{record.horas_trabajadas}h</span>}
              {record.costo > 0 && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${record.costo.toLocaleString()}</span>}
              {record.repuestos?.length > 0 && <span className="flex items-center gap-1"><Package className="w-3 h-3" />{record.repuestos.length} repuesto(s)</span>}
            </div>
          </div>
          <div className="flex items-start gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(record)}><Pencil className="w-3.5 h-3.5 text-slate-400" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(record.id)}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 space-y-2">
            {record.repuestos?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1"><Package className="w-3 h-3" /> Repuestos utilizados</p>
                <div className="flex flex-wrap gap-1.5">
                  {record.repuestos.map((r, i) => (
                    <span key={i} className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs">
                      {r.nombre}{r.codigo ? ` (${r.codigo})` : ''}{r.cantidad > 1 ? ` ×${r.cantidad}` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {record.observaciones && (
              <p className="text-xs text-slate-600 italic">📝 {record.observaciones}</p>
            )}
            {record.proxima_mantencion && (
              <p className="text-xs text-indigo-600 font-medium">📅 Próxima mantención recomendada: {record.proxima_mantencion}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MaintenanceHistory({ workOrders, assets, user }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [techFilter, setTechFilter] = useState('todos');
  const [resultFilter, setResultFilter] = useState('todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [repuestoSearch, setRepuestoSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();

  const { data: records = [] } = useQuery({
    queryKey: ['maintenanceRecords'],
    queryFn: () => base44.entities.MaintenanceRecord.list('-fecha', 300),
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 200),
  });

  const allTechnicians = useMemo(() => {
    const set = new Set(records.map(r => r.tecnico).filter(Boolean));
    return [...set];
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter(r => {
      const eq = equipment.find(e => e.id === r.equipment_id);
      const matchSearch = !search ||
        r.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
        r.tecnico?.toLowerCase().includes(search.toLowerCase()) ||
        eq?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        eq?.numero_interno?.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'todos' || r.type === typeFilter;
      const matchTech = techFilter === 'todos' || r.tecnico === techFilter;
      const matchResult = resultFilter === 'todos' || r.resultado === resultFilter;
      const matchDateFrom = !dateFrom || r.fecha >= dateFrom;
      const matchDateTo = !dateTo || r.fecha <= dateTo;
      const matchRepuesto = !repuestoSearch ||
        r.repuestos?.some(rep => rep.nombre?.toLowerCase().includes(repuestoSearch.toLowerCase()) || rep.codigo?.toLowerCase().includes(repuestoSearch.toLowerCase()));
      return matchSearch && matchType && matchTech && matchResult && matchDateFrom && matchDateTo && matchRepuesto;
    });
  }, [records, equipment, search, typeFilter, techFilter, resultFilter, dateFrom, dateTo, repuestoSearch]);

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ['maintenanceRecords'] });
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este registro?')) return;
    await base44.entities.MaintenanceRecord.delete(id);
    queryClient.invalidateQueries({ queryKey: ['maintenanceRecords'] });
  };

  const totalHours = filtered.reduce((s, r) => s + (r.horas_trabajadas || 0), 0);
  const totalCost = filtered.reduce((s, r) => s + (r.costo || 0), 0);
  const activeFilters = [typeFilter !== 'todos', techFilter !== 'todos', resultFilter !== 'todos', dateFrom, dateTo, repuestoSearch].filter(Boolean).length;

  // Equipment history view
  if (selectedEquipment) {
    return <EquipmentHistoryView equipment={selectedEquipment} onBack={() => setSelectedEquipment(null)} />;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Historial de Mantenimiento</h2>
          <p className="text-sm text-slate-500">{filtered.length} registros · {totalHours.toFixed(1)}h · ${totalCost.toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className={`gap-2 ${activeFilters > 0 ? 'border-indigo-400 text-indigo-700 bg-indigo-50' : ''}`}>
            <Filter className="w-4 h-4" />
            Filtros{activeFilters > 0 ? ` (${activeFilters})` : ''}
          </Button>
          <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" /> Nueva intervención
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: filtered.length, color: 'bg-slate-50 border-slate-200 text-slate-700' },
          { label: 'Preventivos', value: filtered.filter(r => r.type === 'preventivo').length, color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Correctivos', value: filtered.filter(r => r.type === 'correctivo').length, color: 'bg-orange-50 border-orange-200 text-orange-700' },
          { label: 'Exitosos', value: filtered.filter(r => r.resultado === 'exitoso').length, color: 'bg-green-50 border-green-200 text-green-700' },
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
        <Input placeholder="Buscar por descripción, técnico, equipo…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">Tipo</p>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="preventivo">Preventivo</SelectItem>
                <SelectItem value="correctivo">Correctivo</SelectItem>
                <SelectItem value="predictivo">Predictivo</SelectItem>
                <SelectItem value="mejora">Mejora</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">Técnico</p>
            <Select value={techFilter} onValueChange={setTechFilter}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {allTechnicians.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">Resultado</p>
            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="exitoso">Exitoso</SelectItem>
                <SelectItem value="parcial">Parcial</SelectItem>
                <SelectItem value="fallido">Fallido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">Desde</p>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">Hasta</p>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">Repuesto</p>
            <Input placeholder="Buscar repuesto…" value={repuestoSearch} onChange={e => setRepuestoSearch(e.target.value)} className="h-8 text-sm" />
          </div>
          {activeFilters > 0 && (
            <div className="col-span-2 md:col-span-3 flex justify-end">
              <Button variant="ghost" size="sm" className="text-slate-500 text-xs" onClick={() => {
                setTypeFilter('todos'); setTechFilter('todos'); setResultFilter('todos');
                setDateFrom(''); setDateTo(''); setRepuestoSearch('');
              }}>Limpiar filtros</Button>
            </div>
          )}
        </div>
      )}

      {/* Equipment quick access */}
      {equipment.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1"><History className="w-3.5 h-3.5" /> Ver historial por equipo</p>
          <div className="flex gap-2 flex-wrap">
            {equipment.map(eq => (
              <button
                key={eq.id}
                onClick={() => setSelectedEquipment(eq)}
                className="text-xs bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors font-medium text-slate-700"
              >
                {eq.nombre} · {eq.numero_interno}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Records list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">{search || activeFilters > 0 ? 'Sin resultados' : 'Sin registros de intervenciones'}</p>
          {!search && activeFilters === 0 && (
            <Button onClick={() => setShowForm(true)} variant="outline" className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Registrar intervención
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <RecordCard
              key={r.id}
              record={r}
              equipment={equipment}
              onEdit={(rec) => { setEditing(rec); setShowForm(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Form dialog */}
      <Dialog open={showForm} onOpenChange={v => { setShowForm(v); if (!v) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar intervención' : 'Nueva intervención de mantenimiento'}</DialogTitle>
          </DialogHeader>
          <MaintenanceRecordForm
            record={editing}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}