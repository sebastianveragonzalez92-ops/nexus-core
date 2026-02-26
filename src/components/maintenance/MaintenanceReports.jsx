import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, FileText, MapPin, Camera, PenLine, ChevronRight } from 'lucide-react';
import MaintenanceReportForm from './MaintenanceReportForm';

const statusColors = {
  borrador: 'bg-yellow-100 text-yellow-700',
  enviado: 'bg-blue-100 text-blue-700',
  aprobado: 'bg-green-100 text-green-700'
};

const typeColors = {
  preventivo: 'bg-indigo-100 text-indigo-700',
  correctivo: 'bg-red-100 text-red-700'
};

export default function MaintenanceReports({ assets = [], reportType = 'preventivo' }) {
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const { data: reports = [] } = useQuery({
    queryKey: ['maintenanceReports', reportType],
    queryFn: () => base44.entities.MaintenanceReport.filter({ type: reportType }, '-created_date', 50)
  });

  const getAssetName = (id) => {
    const a = assets.find(a => a.id === id);
    return a ? `${a.name} (${a.code})` : '—';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Informes de Mantenimiento {reportType === 'preventivo' ? 'Preventivo' : 'Correctivo'}
          </h2>
          <p className="text-sm text-slate-500">{reports.length} informes registrados</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Informe
        </Button>
      </div>

      {/* List */}
      {reports.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Sin informes aún</p>
          <p className="text-slate-400 text-sm mb-4">Crea el primer informe de campo</p>
          <Button onClick={() => setShowForm(true)} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" /> Crear Informe
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {reports.map(r => (
            <Card
              key={r.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelected(r)}
            >
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-medium text-slate-900 truncate">{r.title}</p>
                      <Badge className={typeColors[r.type]}>{r.type}</Badge>
                      <Badge className={statusColors[r.status]}>{r.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 truncate">{getAssetName(r.asset_id)}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{r.report_date}</span>
                      {r.photos?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Camera className="w-3 h-3" /> {r.photos.length} fotos
                        </span>
                      )}
                      {r.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> GPS
                        </span>
                      )}
                      {r.signature_url && (
                        <span className="flex items-center gap-1">
                          <PenLine className="w-3 h-3" /> Firmado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Report Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Nuevo Informe {reportType === 'preventivo' ? 'Preventivo' : 'Correctivo'}
            </DialogTitle>
          </DialogHeader>
          <MaintenanceReportForm
            assets={assets}
            reportType={reportType}
            onClose={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-500">Tipo:</span> <span className="capitalize font-medium">{selected.type}</span></div>
                <div><span className="text-slate-500">Fecha:</span> <span className="font-medium">{selected.report_date}</span></div>
                <div><span className="text-slate-500">Activo:</span> <span className="font-medium">{getAssetName(selected.asset_id)}</span></div>
                <div><span className="text-slate-500">Estado:</span> <Badge className={statusColors[selected.status]}>{selected.status}</Badge></div>
              </div>
              {selected.description && <div><p className="text-sm font-medium text-slate-700 mb-1">Descripción</p><p className="text-sm text-slate-600">{selected.description}</p></div>}
              {selected.work_performed && <div><p className="text-sm font-medium text-slate-700 mb-1">Trabajo realizado</p><p className="text-sm text-slate-600">{selected.work_performed}</p></div>}
              {selected.findings && <div><p className="text-sm font-medium text-slate-700 mb-1">Hallazgos</p><p className="text-sm text-slate-600">{selected.findings}</p></div>}
              {selected.recommendations && <div><p className="text-sm font-medium text-slate-700 mb-1">Recomendaciones</p><p className="text-sm text-slate-600">{selected.recommendations}</p></div>}
              {selected.photos?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Fotos ({selected.photos.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selected.photos.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt={`Foto ${i+1}`} className="w-full h-24 object-cover rounded-lg border border-slate-200 hover:opacity-80 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {selected.location && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Ubicación GPS</p>
                  <a
                    href={`https://www.google.com/maps?q=${selected.location.lat},${selected.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <MapPin className="w-4 h-4" />
                    {selected.location.lat.toFixed(5)}, {selected.location.lng.toFixed(5)}
                  </a>
                </div>
              )}
              {selected.signature_url && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Firma Digital</p>
                  <img src={selected.signature_url} alt="Firma" className="border border-slate-200 rounded-lg max-h-24 bg-white p-2" />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}