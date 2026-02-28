import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FileDown, FileText, Filter, Wrench, CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';
import jsPDF from 'jspdf';

const TYPE_COLORS = {
  preventivo: '#3b82f6',
  correctivo: '#f97316',
  predictivo: '#a855f7',
  mejora: '#14b8a6',
};

const RESULT_COLORS = {
  exitoso: '#22c55e',
  parcial: '#eab308',
  fallido: '#ef4444',
};

function exportCSV(rows, filename) {
  const headers = ['Fecha', 'Tipo', 'Equipo', 'N° Interno', 'Técnico', 'Descripción', 'Resultado', 'Horas', 'Repuestos', 'Observaciones'];
  const lines = [headers.join(',')];
  rows.forEach(r => {
    const repuestos = (r.repuestos || []).map(rp => `${rp.nombre}${rp.cantidad > 1 ? ` x${rp.cantidad}` : ''}`).join('; ');
    lines.push([
      r.fecha,
      r.type,
      r._equipmentName || '',
      r._equipmentNumero || '',
      r.tecnico || '',
      `"${(r.descripcion || '').replace(/"/g, '""')}"`,
      r.resultado || '',
      r.horas_trabajadas || '',
      `"${repuestos.replace(/"/g, '""')}"`,
      `"${(r.observaciones || '').replace(/"/g, '""')}"`,
    ].join(','));
  });
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = filename; a.click();
}

function exportPDF(rows, filters, stats) {
  const doc = new jsPDF({ orientation: 'landscape' });
  const now = new Date().toLocaleDateString('es-CL');
  
  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 297, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte Consolidado de Mantenimiento', 14, 13);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${now}`, 250, 13);

  // Filters applied
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  const filterText = [
    filters.dateFrom && `Desde: ${filters.dateFrom}`,
    filters.dateTo && `Hasta: ${filters.dateTo}`,
    filters.type !== 'todos' && `Tipo: ${filters.type}`,
    filters.tipoEquipo && `Tipo equipo: ${filters.tipoEquipo}`,
    filters.estado !== 'todos' && `Resultado: ${filters.estado}`,
  ].filter(Boolean).join('   ');
  if (filterText) doc.text(filterText, 14, 27);

  // Stats row
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const statsY = filterText ? 34 : 28;
  [
    `Total: ${stats.total}`,
    `Preventivos: ${stats.preventivo}`,
    `Correctivos: ${stats.correctivo}`,
    `Exitosos: ${stats.exitoso}`,
    `Horas totales: ${stats.horas.toFixed(1)}h`,
  ].forEach((s, i) => {
    doc.text(s, 14 + i * 56, statsY);
  });

  // Table
  const tableY = statsY + 8;
  const cols = [['Fecha', 22], ['Tipo', 22], ['Equipo', 35], ['N° Interno', 22], ['Técnico', 35], ['Descripción', 60], ['Resultado', 22], ['Horas', 16], ['Repuestos', 40]];
  let x = 14;

  doc.setFillColor(240, 245, 255);
  doc.rect(14, tableY, 283, 7, 'F');
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 30, 30);
  cols.forEach(([label, w]) => { doc.text(label, x + 1, tableY + 5); x += w; });

  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
  let y = tableY + 7;
  rows.forEach((r, i) => {
    if (y > 190) { doc.addPage(); y = 14; }
    if (i % 2 === 0) { doc.setFillColor(250, 251, 255); doc.rect(14, y, 283, 7, 'F'); }
    doc.setTextColor(50, 50, 50);
    x = 14;
    const repuestos = (r.repuestos || []).map(rp => `${rp.nombre}${rp.cantidad > 1 ? ` x${rp.cantidad}` : ''}`).join(', ');
    const values = [r.fecha, r.type, r._equipmentName || '', r._equipmentNumero || '', r.tecnico || '', r.descripcion || '', r.resultado || '', r.horas_trabajadas ? `${r.horas_trabajadas}h` : '', repuestos];
    cols.forEach(([, w], ci) => {
      const val = String(values[ci] || '');
      doc.text(doc.splitTextToSize(val, w - 2)[0], x + 1, y + 5);
      x += w;
    });
    y += 7;
  });

  doc.save(`reporte_mantenimiento_${now.replace(/\//g, '-')}.pdf`);
}

export default function ConsolidatedReports() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [tipoEquipoFilter, setTipoEquipoFilter] = useState('todos');
  const [estadoFilter, setEstadoFilter] = useState('todos');

  const { data: records = [] } = useQuery({
    queryKey: ['maintenanceRecords'],
    queryFn: () => base44.entities.MaintenanceRecord.list('-fecha', 500),
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 200),
  });

  const tiposEquipo = useMemo(() => [...new Set(equipment.map(e => e.tipo_equipo).filter(Boolean))], [equipment]);

  const enriched = useMemo(() => records.map(r => {
    const eq = equipment.find(e => e.id === r.equipment_id);
    return { ...r, _equipmentName: eq?.nombre || '', _equipmentNumero: eq?.numero_interno || '', _tipoEquipo: eq?.tipo_equipo || '' };
  }), [records, equipment]);

  const filtered = useMemo(() => enriched.filter(r => {
    const matchDate = (!dateFrom || r.fecha >= dateFrom) && (!dateTo || r.fecha <= dateTo);
    const matchType = typeFilter === 'todos' || r.type === typeFilter;
    const matchTipoEquipo = tipoEquipoFilter === 'todos' || r._tipoEquipo === tipoEquipoFilter;
    const matchEstado = estadoFilter === 'todos' || r.resultado === estadoFilter;
    return matchDate && matchType && matchTipoEquipo && matchEstado;
  }), [enriched, dateFrom, dateTo, typeFilter, tipoEquipoFilter, estadoFilter]);

  const stats = useMemo(() => ({
    total: filtered.length,
    preventivo: filtered.filter(r => r.type === 'preventivo').length,
    correctivo: filtered.filter(r => r.type === 'correctivo').length,
    exitoso: filtered.filter(r => r.resultado === 'exitoso').length,
    parcial: filtered.filter(r => r.resultado === 'parcial').length,
    fallido: filtered.filter(r => r.resultado === 'fallido').length,
    horas: filtered.reduce((s, r) => s + (r.horas_trabajadas || 0), 0),
  }), [filtered]);

  const byTypeChart = useMemo(() => ['preventivo', 'correctivo', 'predictivo', 'mejora'].map(t => ({
    name: t.charAt(0).toUpperCase() + t.slice(1),
    value: filtered.filter(r => r.type === t).length,
    fill: TYPE_COLORS[t],
  })).filter(d => d.value > 0), [filtered]);

  const byResultChart = useMemo(() => [
    { name: 'Exitoso', value: stats.exitoso, fill: RESULT_COLORS.exitoso },
    { name: 'Parcial', value: stats.parcial, fill: RESULT_COLORS.parcial },
    { name: 'Fallido', value: stats.fallido, fill: RESULT_COLORS.fallido },
  ].filter(d => d.value > 0), [stats]);

  // Monthly trend
  const byMonthChart = useMemo(() => {
    const map = {};
    filtered.forEach(r => {
      const m = r.fecha?.slice(0, 7);
      if (!m) return;
      if (!map[m]) map[m] = { month: m, total: 0, preventivo: 0, correctivo: 0 };
      map[m].total++;
      if (r.type === 'preventivo') map[m].preventivo++;
      if (r.type === 'correctivo') map[m].correctivo++;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);
  }, [filtered]);

  const activeFilters = [typeFilter !== 'todos', tipoEquipoFilter !== 'todos', estadoFilter !== 'todos', dateFrom, dateTo].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Reportes Consolidados</h2>
          <p className="text-sm text-slate-500">{filtered.length} intervenciones · {stats.horas.toFixed(1)}h totales</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportCSV(filtered, 'reporte_mantenimiento.csv')} className="gap-2">
            <FileDown className="w-4 h-4" /> CSV
          </Button>
          <Button onClick={() => exportPDF(filtered, { dateFrom, dateTo, type: typeFilter, tipoEquipo: tipoEquipoFilter, estado: estadoFilter }, stats)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <FileText className="w-4 h-4" /> Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-1">Desde</p>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-8 text-sm" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-1">Hasta</p>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-8 text-sm" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-1">Tipo trabajo</p>
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
          <p className="text-xs font-semibold text-slate-600 mb-1">Tipo equipo</p>
          <Select value={tipoEquipoFilter} onValueChange={setTipoEquipoFilter}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {tiposEquipo.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-1">Resultado</p>
          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="exitoso">Exitoso</SelectItem>
              <SelectItem value="parcial">Parcial</SelectItem>
              <SelectItem value="fallido">Fallido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {activeFilters > 0 && (
          <div className="col-span-2 md:col-span-5 flex justify-end">
            <Button variant="ghost" size="sm" className="text-xs text-slate-500" onClick={() => {
              setDateFrom(''); setDateTo(''); setTypeFilter('todos'); setTipoEquipoFilter('todos'); setEstadoFilter('todos');
            }}>Limpiar filtros</Button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total intervenciones', value: stats.total, icon: Wrench, color: 'text-slate-700 bg-slate-50 border-slate-200' },
          { label: 'Preventivos', value: stats.preventivo, icon: CheckCircle2, color: 'text-blue-700 bg-blue-50 border-blue-200' },
          { label: 'Correctivos', value: stats.correctivo, icon: AlertCircle, color: 'text-orange-700 bg-orange-50 border-orange-200' },
          { label: 'Horas trabajadas', value: `${stats.horas.toFixed(1)}h`, icon: Clock, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${color}`}>
            <Icon className="w-6 h-6 opacity-60 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs font-medium mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {filtered.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          {/* Monthly trend */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Tendencia mensual</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={byMonthChart} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="preventivo" name="Preventivo" fill={TYPE_COLORS.preventivo} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="correctivo" name="Correctivo" fill={TYPE_COLORS.correctivo} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Result pie */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Resultado</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={byResultChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {byResultChart.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Detalle de intervenciones ({filtered.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">Sin datos para los filtros seleccionados</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Fecha</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Tipo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Equipo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Técnico</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Descripción</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Resultado</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Horas</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Repuestos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(r => {
                    const rc = { exitoso: 'bg-green-100 text-green-700', parcial: 'bg-yellow-100 text-yellow-700', fallido: 'bg-red-100 text-red-700' };
                    return (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2.5 whitespace-nowrap text-slate-700">{r.fecha}</td>
                        <td className="px-4 py-2.5"><Badge className={`text-xs ${['bg-blue-100 text-blue-700','bg-orange-100 text-orange-700','bg-purple-100 text-purple-700','bg-teal-100 text-teal-700'][['preventivo','correctivo','predictivo','mejora'].indexOf(r.type)] || 'bg-slate-100 text-slate-700'}`}>{r.type}</Badge></td>
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-slate-900">{r._equipmentName || '—'}</p>
                          {r._equipmentNumero && <p className="text-xs text-slate-500">{r._equipmentNumero}</p>}
                        </td>
                        <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">{r.tecnico || '—'}</td>
                        <td className="px-4 py-2.5 text-slate-700 max-w-xs truncate">{r.descripcion}</td>
                        <td className="px-4 py-2.5"><Badge className={`text-xs ${rc[r.resultado] || 'bg-slate-100 text-slate-600'}`}>{r.resultado || '—'}</Badge></td>
                        <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">{r.horas_trabajadas ? `${r.horas_trabajadas}h` : '—'}</td>
                        <td className="px-4 py-2.5 text-slate-500 text-xs">{r.repuestos?.map(rp => rp.nombre).join(', ') || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}