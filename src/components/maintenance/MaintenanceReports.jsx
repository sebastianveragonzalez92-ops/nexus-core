import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, FileText, MapPin, Camera, PenLine, ChevronRight, CheckCircle2, XCircle, Archive, ArchiveRestore } from 'lucide-react';
import MaintenanceReportForm from './MaintenanceReportForm';
import { ALL_ITEMS } from './ComponentChecklist';
import ReportPDFExport from './ReportPDFExport';

const statusColors = {
  borrador: 'bg-yellow-100 text-yellow-700',
  enviado: 'bg-blue-100 text-blue-700',
  aprobado: 'bg-green-100 text-green-700'
};

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex border-b border-slate-100 last:border-0">
      <div className="w-1/2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50">{label}</div>
      <div className="w-1/2 px-4 py-2.5 text-sm text-slate-800">{value}</div>
    </div>
  );
}

function ComponentTable({ values = {}, title }) {
  const hasAny = ALL_ITEMS.some(item => values[item] !== undefined);
  if (!hasAny) return null;
  return (
    <div>
      <h3 className="text-blue-600 font-bold text-base mb-2">{title}</h3>
      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
        {ALL_ITEMS.map(item => (
          <div key={item} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-slate-700 font-medium">{item}</span>
            {values[item]
              ? <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1 inline" />Yes</Badge>
              : <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1 inline" />No</Badge>
            }
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MaintenanceReports({ assets = [], reportType = 'preventivo' }) {
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery({
    queryKey: ['maintenanceReports', reportType],
    queryFn: () => base44.entities.MaintenanceReport.filter({ type: reportType }, '-created_date', 100)
  });

  const activeReports = reports.filter(r => !r.archived);
  const archivedReports = reports.filter(r => r.archived);
  const visibleReports = showArchived ? archivedReports : activeReports;

  const handleArchive = async (report, e) => {
    e.stopPropagation();
    await base44.entities.MaintenanceReport.update(report.id, { archived: !report.archived });
    queryClient.invalidateQueries({ queryKey: ['maintenanceReports', reportType] });
    if (selected?.id === report.id) setSelected(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Informes {reportType === 'preventivo' ? 'Preventivos' : 'Correctivos'}
          </h2>
          <p className="text-sm text-slate-500">{activeReports.length} informes activos · {archivedReports.length} archivados</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowArchived(!showArchived)}
            className={`gap-2 ${showArchived ? 'bg-amber-50 border-amber-300 text-amber-700' : ''}`}
          >
            <Archive className="w-4 h-4" />
            {showArchived ? 'Ver activos' : 'Archivados'}
          </Button>
          <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" /> Nuevo Informe
          </Button>
        </div>
      </div>

      {visibleReports.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">{showArchived ? 'Sin informes archivados' : 'Sin informes aún'}</p>
          {!showArchived && (
            <Button onClick={() => setShowForm(true)} variant="outline" className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Crear Informe
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {visibleReports.map(r => (
            <Card key={r.id} className={`cursor-pointer hover:shadow-md transition-shadow ${r.archived ? 'opacity-70' : ''}`} onClick={() => setSelected(r)}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-medium text-slate-900 truncate">{r.title || `${r.tipo_equipo} ${r.numero_interno_equipo}`}</p>
                      <Badge className={statusColors[r.status]}>{r.status}</Badge>
                      {r.archived && <Badge className="bg-amber-100 text-amber-700">Archivado</Badge>}
                    </div>
                    <p className="text-sm text-slate-500">{r.empresa} {r.division && `· ${r.division}`}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{r.report_date}</span>
                      {r.photo_entries?.length > 0 && <span className="flex items-center gap-1"><Camera className="w-3 h-3" />{r.photo_entries.length} fotos</span>}
                      {r.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />GPS</span>}
                      {r.signature_url && <span className="flex items-center gap-1"><PenLine className="w-3 h-3" />Firmado</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleArchive(r, e)}
                    title={r.archived ? 'Desarchivar' : 'Archivar'}
                    className="text-slate-400 hover:text-amber-600"
                  >
                    {r.archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                  </Button>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Report Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo Informe {reportType === 'preventivo' ? 'Preventivo' : 'Correctivo'}</DialogTitle>
          </DialogHeader>
          <MaintenanceReportForm assets={assets} reportType={reportType} onClose={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="text-blue-600">MineProtect CAS10 FMS - Mantención Equipos Pesados</DialogTitle>
              {selected && <ReportPDFExport report={selected} />}
            </div>
          </DialogHeader>
          {selected && (
            <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
              {/* Info general */}
              <div>
                <h3 className="text-blue-600 font-bold text-base mb-2">Información General</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <InfoRow label="Empresa" value={selected.empresa} />
                  <InfoRow label="División" value={selected.division} />
                  <InfoRow label="Tipo de mantención" value={selected.type} />
                  <InfoRow label="Tipo de equipo" value={selected.tipo_equipo} />
                  <InfoRow label="N° interno equipo" value={selected.numero_interno_equipo} />
                  <InfoRow label="Fecha mantención" value={selected.report_date} />
                  <InfoRow label="Fecha próxima mantención" value={selected.fecha_proxima_mantencion} />
                  <InfoRow label="Hora inicio actividad" value={selected.hora_inicio} />
                  <InfoRow label="Hora finalización actividad" value={selected.hora_fin} />
                  <InfoRow label="Responsable de la actividad" value={selected.responsable} />
                </div>
              </div>

              {/* CAS series */}
              {selected.cas_series && (selected.cas_series.antena_qc1000 || selected.cas_series.pantalla_qd1400) && (
                <div>
                  <h3 className="text-blue-600 font-bold text-base mb-2">CAS Números de Series</h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <InfoRow label="Antena QC1000" value={selected.cas_series.antena_qc1000} />
                    <InfoRow label="Pantalla QD1400/QD200" value={selected.cas_series.pantalla_qd1400} />
                  </div>
                </div>
              )}

              {/* FMS series */}
              {selected.fms_series && (selected.fms_series.core_lp || selected.fms_series.pantalla || selected.fms_series.gps1) && (
                <div>
                  <h3 className="text-blue-600 font-bold text-base mb-2">FMS Números de Series</h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <InfoRow label="Core LP" value={selected.fms_series.core_lp} />
                    <InfoRow label="Pantalla" value={selected.fms_series.pantalla} />
                    <InfoRow label="GPS 1" value={selected.fms_series.gps1} />
                  </div>
                </div>
              )}

              <ComponentTable values={selected.componentes_pre} title="Componentes Operativos Pre-mantención" />
              <ComponentTable values={selected.componentes_post} title="Componentes Operativos Post-mantención" />

              {/* Fotos */}
              {selected.photo_entries?.length > 0 && (
                <div>
                  <h3 className="text-blue-600 font-bold text-base mb-2">Fotografía de Componentes</h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {selected.photo_entries.map((entry, i) => (
                      <div key={i} className="flex gap-4 p-3">
                        <span className="text-sm font-semibold text-slate-700 w-40 shrink-0">{entry.label}</span>
                        <a href={entry.url} target="_blank" rel="noopener noreferrer">
                          <img src={entry.url} alt={entry.label} className="w-32 h-24 object-cover rounded-lg border border-slate-200 hover:opacity-80 transition-opacity" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GPS */}
              {selected.location && (
                <div>
                  <h3 className="text-blue-600 font-bold text-base mb-2">Ubicación GPS</h3>
                  <a href={`https://www.google.com/maps?q=${selected.location.lat},${selected.location.lng}`} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                    <MapPin className="w-4 h-4" />{selected.location.lat.toFixed(5)}, {selected.location.lng.toFixed(5)}
                  </a>
                </div>
              )}

              {/* Observaciones */}
              {selected.observations && (
                <div>
                  <h3 className="text-blue-600 font-bold text-base mb-2">Observaciones</h3>
                  <p className="text-sm text-slate-700">{selected.observations}</p>
                </div>
              )}

              {/* Firma */}
              {selected.signature_url && (
                <div>
                  <h3 className="text-blue-600 font-bold text-base mb-2">Firma Digital</h3>
                  <img src={selected.signature_url} alt="Firma" className="border border-slate-200 rounded-lg max-h-28 bg-white p-2" />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}