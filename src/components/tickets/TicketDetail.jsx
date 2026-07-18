import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Pencil, MapPin, Tag, Calendar, Clock, User, FileText, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { labelOf, priorityColor, statusStyle } from '@/lib/ticketConfigDefaults';

export default function TicketDetail({ ticket, user, config, onEdit, onBack, onStatusChange, isUpdating }) {
  if (!ticket) return null;

  const status = statusStyle(config, ticket.status);
  const priorityCls = priorityColor(config, ticket.priority);
  const statuses = config.statuses || [];

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
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${status.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${priorityCls}`}>
                {labelOf(config, 'priorities', ticket.priority)}
              </span>
              {ticket.tipo && (
                <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                  {labelOf(config, 'tipos', ticket.tipo)}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button size="sm" onClick={onEdit} className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700">
          <Pencil className="w-3.5 h-3.5" /> Editar
        </Button>
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
                  {labelOf(config, 'soluciones', ticket.solucion)}
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
              <InfoRow icon={<Tag className="w-4 h-4 text-slate-400" />} label="Categoría" value={labelOf(config, 'categories', ticket.category)} />
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
              {statuses.map(s => {
                const isActive = ticket.status === s.value;
                return (
                  <button
                    key={s.value}
                    disabled={isActive || isUpdating}
                    onClick={() => onStatusChange(ticket, s.value)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive
                        ? `${s.color || 'bg-slate-100'} cursor-default`
                        : 'text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                      }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${s.dot || 'bg-slate-400'}`} />
                    {s.label}
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