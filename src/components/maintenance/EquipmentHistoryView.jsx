import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Cpu, Wrench, Clock, DollarSign, Package, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

const typeColors = {
  preventivo: 'bg-blue-100 text-blue-700',
  correctivo: 'bg-orange-100 text-orange-700',
  predictivo: 'bg-purple-100 text-purple-700',
  mejora: 'bg-teal-100 text-teal-700',
};

const resultConfig = {
  exitoso: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  parcial: { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  fallido: { color: 'bg-red-100 text-red-700', icon: XCircle },
};

const statusConfig = {
  operativo: 'bg-green-100 text-green-700',
  mantenimiento: 'bg-yellow-100 text-yellow-700',
  fuera_servicio: 'bg-red-100 text-red-700',
  standby: 'bg-slate-100 text-slate-600',
};

export default function EquipmentHistoryView({ equipment, onBack }) {
  const { data: records = [] } = useQuery({
    queryKey: ['maintenanceRecords', equipment.id],
    queryFn: () => base44.entities.MaintenanceRecord.filter({ equipment_id: equipment.id }, '-fecha', 100),
  });

  const totalHours = records.reduce((s, r) => s + (r.horas_trabajadas || 0), 0);
  const totalCost = records.reduce((s, r) => s + (r.costo || 0), 0);

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{equipment.nombre}</h2>
            <p className="text-sm text-slate-500">{equipment.tipo_equipo} · N° {equipment.numero_interno}</p>
          </div>
          <Badge className={statusConfig[equipment.status] || 'bg-slate-100 text-slate-600'}>
            {equipment.status}
          </Badge>
        </div>
      </div>

      {/* Equipment info card */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        {equipment.empresa && <div><p className="text-slate-500 text-xs">Empresa</p><p className="font-medium">{equipment.empresa}</p></div>}
        {equipment.division && <div><p className="text-slate-500 text-xs">División</p><p className="font-medium">{equipment.division}</p></div>}
        {equipment.fabricante && <div><p className="text-slate-500 text-xs">Fabricante</p><p className="font-medium">{equipment.fabricante}</p></div>}
        {equipment.modelo && <div><p className="text-slate-500 text-xs">Modelo</p><p className="font-medium">{equipment.modelo}</p></div>}
        {equipment.numero_serie && <div><p className="text-slate-500 text-xs">N° Serie</p><p className="font-medium">{equipment.numero_serie}</p></div>}
        {equipment.fecha_instalacion && <div><p className="text-slate-500 text-xs">Instalación</p><p className="font-medium">{equipment.fecha_instalacion}</p></div>}
        {equipment.fecha_proxima_mantencion && <div><p className="text-slate-500 text-xs">Próxima mantención</p><p className="font-medium">{equipment.fecha_proxima_mantencion}</p></div>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 px-4 py-3 bg-white">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><Wrench className="w-3.5 h-3.5" /> Intervenciones</div>
          <p className="text-2xl font-bold text-slate-900">{records.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 px-4 py-3 bg-white">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><Clock className="w-3.5 h-3.5" /> Horas totales</div>
          <p className="text-2xl font-bold text-indigo-600">{totalHours.toFixed(1)}h</p>
        </div>
        <div className="rounded-xl border border-slate-200 px-4 py-3 bg-white">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><DollarSign className="w-3.5 h-3.5" /> Costo total</div>
          <p className="text-2xl font-bold text-green-600">${totalCost.toLocaleString()}</p>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-3">Historial de intervenciones</h3>
        {records.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
            <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Sin intervenciones registradas</p>
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-indigo-100 space-y-6">
            {records.map((r, i) => {
              const rc = resultConfig[r.resultado] || resultConfig.exitoso;
              const ResultIcon = rc.icon;
              return (
                <div key={r.id} className="relative">
                  <div className="absolute -left-[29px] w-4 h-4 rounded-full bg-indigo-500 border-2 border-white shadow" />
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-slate-900">{r.fecha}</span>
                      <Badge className={typeColors[r.type]}>{r.type}</Badge>
                      <Badge className={rc.color}><ResultIcon className="w-3 h-3 mr-1" />{r.resultado}</Badge>
                      {r.horas_trabajadas > 0 && <span className="text-xs text-slate-500">{r.horas_trabajadas}h</span>}
                      {r.costo > 0 && <span className="text-xs text-slate-500">${r.costo.toLocaleString()}</span>}
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{r.descripcion}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      {r.tecnico && <span>👤 {r.tecnico}</span>}
                      {r.hora_inicio && <span>🕐 {r.hora_inicio}{r.hora_fin ? ` – ${r.hora_fin}` : ''}</span>}
                    </div>
                    {r.repuestos?.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-1"><Package className="w-3 h-3" /> Repuestos:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {r.repuestos.map((rep, j) => (
                            <span key={j} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">
                              {rep.nombre}{rep.cantidad > 1 ? ` ×${rep.cantidad}` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {r.observaciones && (
                      <p className="mt-2 text-xs text-slate-500 italic">{r.observaciones}</p>
                    )}
                    {r.proxima_mantencion && (
                      <p className="mt-1 text-xs text-indigo-600 font-medium">📅 Próxima: {r.proxima_mantencion}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}