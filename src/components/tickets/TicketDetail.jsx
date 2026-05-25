import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Pencil, MapPin, Tag, Calendar, Clock, User, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_STYLES = {
  abierto: { bg: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', label: 'Abierto' },
  en_progreso: { bg: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500', label: 'En Progreso' },
  resuelto: { bg: 'bg-green-100 text-green-700', dot: 'bg-green-500', label: 'Resuelto' },
  cerrado: { bg: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400', label: 'Cerrado' },
};

const PRIORITY_STYLES = {
  baja: { bg: 'bg-slate-100 text-slate-600', label: 'Baja' },
  media: { bg: 'bg-blue-100 text-blue-700', label: 'Media' },
  alta: { bg: 'bg-orange-100 text-orange-700', label: 'Alta' },
  urgente: { bg: 'bg-red-100 text-red-700', label: 'Urgente' },
};

const TIPO_LABELS = {
  incidente: 'Incidente', solicitud: 'Solicitud', consulta: 'Consulta', cambio: 'Cambio', otro: 'Otro',
};

const SOLUCION_LABELS = {
  resuelto_remotamente: 'Resuelto remotamente',
  visita_tecnica: 'Visita técnica',
  reemplazo: 'Reemplazo de equipo',
  configuracion: 'Configuración',
  capacitacion: 'Capacitación',
  sin_solucion: 'Sin solución',
};

const NEXT_STATUS = {
  abierto: 'en_progreso',
  en_progreso: 'resuelto',
  resuelto: 'cerrado',
};

const NEXT_LABEL = {
  abierto: 'Iniciar',
  en_progreso: 'Resolver',
  resuelto: 'Cerrar',
};

export default function TicketDetail({ ticket, user, onEdit, onBack, onStatusChange, isUpdating }) {
  if (!ticket) return null;

  const status = STATUS_STYLES[ticket.status] || STATUS_STYLES.abierto;
  const priority = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.media;
  const nextStatus = NEXT_STATUS[ticket.status];

  const formatDate = (d) => d ? format(new Date(d), "dd MMM yyyy, HH:mm", { locale: es }) : '—';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{ticket.subject}</h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${priority.bg}`}>
                {priority.label}
              </span>
              {ticket.tipo && (
                <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                  {TIPO_LABELS[ticket.tipo] || ticket.tipo}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {nextStatus && (
            <Button
              size="sm"
              variant="outline"
              disabled={isUpdating}
              onClick={() => onStatusChange(ticket, nextStatus)}
              className="gap-1.5 text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {NEXT_LABEL[ticket.status]}
            </Button>
          )}
          <Button size="sm" onClick={onEdit} className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700">
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Descripción */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" /> Descripción
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
              {ticket.description || <span className="text-slate-400">Sin descripción</span>}
            </p>
          </div>

          {/* Resolución */}
          {(ticket.resolution_notes || ticket.solucion) && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Resolución
              </h3>
              {ticket.solucion && (
                <p className="text-xs text-green-600 bg-green-100 px-2.5 py-1 rounded-full inline-block mb-2">
                  {SOLUCION_LABELS[ticket.solucion] || ticket.solucion}
                </p>
              )}
              {ticket.resolution_notes && (
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{ticket.resolution_notes}</p>
              )}
            </div>
          )}

          {/* Timeline fechas */}
          {(ticket.fecha_inicio || ticket.fecha_fin) && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" /> Fechas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {ticket.fecha_inicio && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Inicio</p>
                    <p className="text-sm font-medium text-slate-700">{formatDate(ticket.fecha_inicio)}</p>
                  </div>
                )}
                {ticket.fecha_fin && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Fin</p>
                    <p className="text-sm font-medium text-slate-700">{formatDate(ticket.fecha_fin)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Detalles</h3>

            <InfoRow icon={<User className="w-4 h-4 text-slate-400" />} label="Reportado por" value={ticket.user_email} />
            {ticket.assigned_to && (
              <InfoRow icon={<User className="w-4 h-4 text-indigo-400" />} label="Asignado a" value={ticket.assigned_to} />
            )}
            {ticket.ubicacion && (
              <InfoRow icon={<MapPin className="w-4 h-4 text-slate-400" />} label="Ubicación" value={ticket.ubicacion} />
            )}
            {ticket.category && (
              <InfoRow icon={<Tag className="w-4 h-4 text-slate-400" />} label="Categoría" value={ticket.category} />
            )}
            <InfoRow
              icon={<Calendar className="w-4 h-4 text-slate-400" />}
              label="Creado"
              value={ticket.created_date ? format(new Date(ticket.created_date), 'dd MMM yyyy', { locale: es }) : '—'}
            />
          </div>

          {/* Quick status change */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Cambiar Estado</h3>
            <div className="space-y-2">
              {['abierto', 'en_progreso', 'resuelto', 'cerrado'].map(s => {
                const st = STATUS_STYLES[s];
                const isActive = ticket.status === s;
                return (
                  <button
                    key={s}
                    disabled={isActive || isUpdating}
                    onClick={() => onStatusChange(ticket, s)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive
                        ? `${st.bg} cursor-default`
                        : 'text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                      }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                    {st.label}
                    {isActive && <span className="ml-auto text-xs opacity-60">Actual</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
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
        <p className="text-sm text-slate-700 font-medium break-all">{value || '—'}</p>
      </div>
    </div>
  );
}