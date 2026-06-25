import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Pencil, Trash2, CheckCircle2, Circle, ClipboardList, ClipboardCheck, Calendar, User, Building2, Camera } from 'lucide-react';
import InstallationReportPDF from './InstallationReportPDF';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ESTADO_STYLES = {
  borrador: { bg: 'bg-slate-100 text-slate-600', label: 'Borrador' },
  enviado: { bg: 'bg-blue-100 text-blue-700', label: 'Enviado' },
  aprobado: { bg: 'bg-green-100 text-green-700', label: 'Aprobado' },
};

export default function InstallationReportDetail({ report, onBack, onEdit, onDelete, isDeleting }) {
  if (!report) return null;

  const estado = ESTADO_STYLES[report.estado] || ESTADO_STYLES.borrador;
  const isPost = report.tipo === 'postinstalacion';

  const fmsInstalados = report.componentes_fms?.filter(c => c.instalado).length || 0;
  const fmsTotal = report.componentes_fms?.length || 0;
  const casInstalados = report.componentes_cas?.filter(c => c.instalado).length || 0;
  const casTotal = report.componentes_cas?.length || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${isPost ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>
                {isPost ? <ClipboardCheck className="w-3 h-3" /> : <ClipboardList className="w-3 h-3" />}
                {isPost ? 'Post-instalación' : 'Pre-instalación'}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${estado.bg}`}>{estado.label}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Informe — {report.equipo_numero || 'Sin número'}
              {report.equipo_marca && <span className="text-slate-500 font-normal text-base ml-2">{report.equipo_marca} {report.equipo_modelo}</span>}
            </h1>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <InstallationReportPDF report={report} />
          <Button size="sm" onClick={onEdit} className="gap-1.5 text-xs bg-teal-600 hover:bg-teal-700">
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </Button>
          <Button size="sm" variant="outline" onClick={onDelete} disabled={isDeleting} className="gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50">
            <Trash2 className="w-3.5 h-3.5" />
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">

          {/* Foto frontal */}
          {report.foto_frontal_url && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 border-b px-5 py-3">
                <h3 className="text-sm font-semibold text-slate-700">Imagen Frontal del Equipo</h3>
              </div>
              <img src={report.foto_frontal_url} alt="Frontal equipo" className="w-full max-h-64 object-cover" />
            </div>
          )}

          {/* Números de serie (post) */}
          {isPost && (report.series_core || report.series_display || report.series_gps) && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 border-b px-5 py-3">
                <h3 className="text-sm font-semibold text-slate-700">Números de Serie Instalados</h3>
              </div>
              <div className="p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-teal-600 text-white">
                        <th className="px-3 py-2 text-left text-xs font-semibold">Core</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Display 9"</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">GPS</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">QD1400/QD200</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">QC1000</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="px-3 py-2 font-mono text-xs">{report.series_core || '—'}</td>
                        <td className="px-3 py-2 font-mono text-xs">{report.series_display || '—'}</td>
                        <td className="px-3 py-2 font-mono text-xs">{report.series_gps || '—'}</td>
                        <td className="px-3 py-2 font-mono text-xs">{report.series_qd200 || '—'}</td>
                        <td className="px-3 py-2 font-mono text-xs">{report.series_qc1000 || '—'}</td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="px-3 py-2 bg-slate-700 text-white text-xs font-semibold">LTE SAR</td>
                        <td colSpan={3} className="px-3 py-2 font-mono text-xs">{report.series_lte_sar || '—'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Componentes */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b px-5 py-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Componentes del Sistema</h3>
              <div className="flex gap-2 text-xs">
                <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">FMS {fmsInstalados}/{fmsTotal}</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">CAS {casInstalados}/{casTotal}</span>
              </div>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <ComponenteList title="Sistema FMS" items={report.componentes_fms || []} color="teal" />
              <ComponenteList title="Sistema CAS" items={report.componentes_cas || []} color="blue" />
            </div>
          </div>

          {/* Fotos */}
          {report.fotos?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 border-b px-5 py-3 flex items-center gap-2">
                <Camera className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-700">Registro Fotográfico</h3>
              </div>
              <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-3">
                {report.fotos.map((foto, i) => (
                  <div key={i} className="rounded-lg overflow-hidden border border-slate-200">
                    <div className="bg-teal-700 px-2 py-1">
                      <p className="text-white text-xs font-semibold uppercase tracking-wide truncate">{foto.label}</p>
                    </div>
                    <img src={foto.url} alt={foto.label} className="w-full h-36 object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observaciones */}
          {(report.conexion_electrica || report.observaciones) && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 border-b px-5 py-3">
                <h3 className="text-sm font-semibold text-slate-700">Conexión y Observaciones</h3>
              </div>
              <div className="p-5 space-y-4">
                {report.conexion_electrica && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Conexión Eléctrica</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{report.conexion_electrica}</p>
                  </div>
                )}
                {report.observaciones && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Observaciones</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{report.observaciones}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">Detalles</h3>
            <InfoRow icon={<Calendar className="w-4 h-4 text-slate-400" />} label="Fecha"
              value={report.fecha ? format(new Date(report.fecha), 'dd MMM yyyy', { locale: es }) : '—'} />
            <InfoRow icon={<User className="w-4 h-4 text-slate-400" />} label="Realizado por" value={report.realizado_por} />
            {report.validado_por && <InfoRow icon={<User className="w-4 h-4 text-teal-400" />} label="Validado por" value={report.validado_por} />}
            <InfoRow icon={<Building2 className="w-4 h-4 text-slate-400" />} label="Empresa" value={report.empresa} />
            {report.division && <InfoRow icon={<Building2 className="w-4 h-4 text-slate-300" />} label="División" value={report.division} />}
          </div>

          {/* Aprobación */}
          {(report.aprobacion_cliente_nombre || report.aprobacion_proveedor_nombre) && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-700 border-b pb-2 mb-3">Aprobación</h3>
              {report.aprobacion_cliente_nombre && (
                <div className="mb-3">
                  <p className="text-xs text-slate-400 font-medium mb-1">CLIENTE</p>
                  <p className="text-sm font-semibold text-slate-800">{report.aprobacion_cliente_nombre}</p>
                  {report.aprobacion_cliente_cargo && <p className="text-xs text-slate-500">{report.aprobacion_cliente_cargo}</p>}
                  {report.aprobacion_cliente_compania && <p className="text-xs text-slate-500">{report.aprobacion_cliente_compania}</p>}
                </div>
              )}
              {report.aprobacion_proveedor_nombre && (
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-1">PROVEEDOR</p>
                  <p className="text-sm font-semibold text-slate-800">{report.aprobacion_proveedor_nombre}</p>
                  {report.aprobacion_proveedor_cargo && <p className="text-xs text-slate-500">{report.aprobacion_proveedor_cargo}</p>}
                  {report.aprobacion_proveedor_compania && <p className="text-xs text-slate-500">{report.aprobacion_proveedor_compania}</p>}
                </div>
              )}
            </div>
          )}

          {report.objetivo && (
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-teal-700 uppercase mb-1">Objetivo</p>
              <p className="text-sm text-slate-700">{report.objetivo}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ComponenteList({ title, items, color }) {
  const colorMap = { teal: 'text-teal-700 bg-teal-50', blue: 'text-blue-700 bg-blue-50' };
  return (
    <div>
      <h4 className={`text-xs font-semibold px-2 py-1 rounded mb-2 ${colorMap[color]}`}>{title}</h4>
      <div className="space-y-1">
        {items.map((c, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {c.instalado
              ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
              : <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            }
            <span className={c.instalado ? 'text-green-700' : 'text-slate-500'}>{c.descripcion}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm text-slate-700 font-medium">{value || '—'}</p>
      </div>
    </div>
  );
}