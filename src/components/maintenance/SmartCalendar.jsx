import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Wrench, CheckSquare, Cpu, AlertTriangle, 
  Clock, User, Calendar, Filter, X, Zap, Plus
} from 'lucide-react';
import CreateTaskFromCalendarModal from './CreateTaskFromCalendarModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const EVENT_TYPES = {
  workorder: { label: 'Orden de Trabajo', color: 'bg-indigo-500', light: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Wrench },
  task: { label: 'Tarea', color: 'bg-emerald-500', light: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckSquare },
  maintenance: { label: 'Mantención Equipos', color: 'bg-amber-500', light: 'bg-amber-100 text-amber-800 border-amber-200', icon: Cpu },
};

const PRIORITY_COLORS = {
  urgente: 'bg-red-500',
  alta: 'bg-orange-500',
  media: 'bg-yellow-500',
  baja: 'bg-blue-500',
};

function EventPill({ event, onClick }) {
  const type = EVENT_TYPES[event.type];
  const Icon = type.icon;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(event); }}
      className={cn("w-full text-left text-xs px-1.5 py-0.5 rounded border truncate flex items-center gap-1 hover:opacity-80 transition-opacity", type.light)}
    >
      <Icon className="w-2.5 h-2.5 shrink-0" />
      <span className="truncate">{event.title}</span>
    </button>
  );
}

function EventDetailPanel({ event, onClose }) {
  if (!event) return null;
  const type = EVENT_TYPES[event.type];
  const Icon = type.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5 space-y-4"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl", type.color)}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{type.label}</p>
              <h3 className="font-semibold text-slate-900 text-sm leading-tight">{event.title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="space-y-2 text-sm">
          {event.date && (
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{format(new Date(event.date), "dd MMM yyyy", { locale: es })}</span>
              {event.endDate && <span className="text-slate-400">→ {format(new Date(event.endDate), "dd MMM", { locale: es })}</span>}
            </div>
          )}
          {event.assignedTo && (
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4 text-slate-400" />
              <span>{event.assignedTo}</span>
            </div>
          )}
          {event.priority && (
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-slate-400" />
              <Badge className={cn("text-xs capitalize", 
                event.priority === 'urgente' ? 'bg-red-100 text-red-800' :
                event.priority === 'alta' ? 'bg-orange-100 text-orange-800' :
                event.priority === 'media' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              )}>
                {event.priority}
              </Badge>
            </div>
          )}
          {event.status && (
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="capitalize">{event.status.replace('_', ' ')}</span>
            </div>
          )}
          {event.description && (
            <p className="text-slate-600 text-xs bg-slate-50 rounded-lg p-2 mt-2">{event.description}</p>
          )}
        </div>

        {event.aiAlert && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">{event.aiAlert}</p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default function SmartCalendar({ user }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [createTaskDate, setCreateTaskDate] = useState('');

  const { data: workOrders = [] } = useQuery({
    queryKey: ['workOrders'],
    queryFn: () => base44.entities.WorkOrder.list('-created_date', 200),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['maintenanceTasks'],
    queryFn: () => base44.entities.MaintenanceTask.list('-created_date', 200),
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list(),
  });

  // Build unified events list
  const events = useMemo(() => {
    const list = [];

    workOrders.forEach(wo => {
      const date = wo.planned_start || wo.created_date;
      if (!date) return;
      // AI alert for urgent/overdue
      let aiAlert = null;
      if (wo.priority === 'urgente' && wo.status !== 'completada') aiAlert = 'OT urgente sin completar. Requiere atención inmediata.';
      else if (wo.status === 'pendiente' && wo.planned_start) {
        const planned = new Date(wo.planned_start);
        if (planned < new Date() && wo.status !== 'completada') aiAlert = 'OT vencida. Considere reasignar o reprogramar.';
      }
      list.push({
        id: `wo-${wo.id}`,
        type: 'workorder',
        title: wo.description?.substring(0, 40) || wo.number || 'Orden de Trabajo',
        date,
        endDate: wo.planned_end,
        assignedTo: wo.assigned_to,
        priority: wo.priority,
        status: wo.status,
        description: wo.description,
        aiAlert,
      });
    });

    tasks.forEach(task => {
      if (!task.due_date) return;
      let aiAlert = null;
      const due = new Date(task.due_date);
      if (due < new Date() && task.status !== 'completada') aiAlert = 'Tarea vencida. Actualiza el estado o reprograma.';
      else if (task.priority === 'urgente') aiAlert = 'Tarea de alta urgencia pendiente.';
      list.push({
        id: `task-${task.id}`,
        type: 'task',
        title: task.title,
        date: task.due_date,
        assignedTo: task.assigned_to,
        priority: task.priority,
        status: task.status,
        description: task.description,
        aiAlert,
      });
    });

    equipment.forEach(eq => {
      if (!eq.fecha_proxima_mantencion) return;
      const mainDate = new Date(eq.fecha_proxima_mantencion);
      const diffDays = Math.ceil((mainDate - new Date()) / (1000 * 60 * 60 * 24));
      let aiAlert = null;
      if (diffDays <= 7 && diffDays >= 0) aiAlert = `Mantención en ${diffDays} día(s). Prepare recursos y personal.`;
      else if (diffDays < 0) aiAlert = 'Mantención vencida. Programe intervención urgente.';
      list.push({
        id: `eq-${eq.id}`,
        type: 'maintenance',
        title: `Mantención: ${eq.nombre || eq.numero_interno}`,
        date: eq.fecha_proxima_mantencion,
        status: eq.status,
        description: `${eq.tipo_equipo || ''} - ${eq.numero_interno || ''}`,
        aiAlert,
      });
    });

    return list;
  }, [workOrders, tasks, equipment]);

  const filteredEvents = useMemo(() => 
    filterType === 'all' ? events : events.filter(e => e.type === filterType),
    [events, filterType]
  );

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEventsForDay = (day) =>
    filteredEvents.filter(e => e.date && isSameDay(new Date(e.date), day));

  // Summary counts
  const monthEvents = filteredEvents.filter(e => e.date && isSameMonth(new Date(e.date), currentMonth));
  const alertEvents = monthEvents.filter(e => e.aiAlert);

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Calendario Inteligente</h2>
          <p className="text-sm text-slate-500">OTs, tareas y mantenciones con alertas automáticas</p>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <div className="bg-indigo-50 rounded-xl px-3 py-2 text-center">
            <p className="text-lg font-bold text-indigo-700">{monthEvents.length}</p>
            <p className="text-xs text-indigo-500">Eventos</p>
          </div>
          <div className="bg-amber-50 rounded-xl px-3 py-2 text-center">
            <p className="text-lg font-bold text-amber-700">{alertEvents.length}</p>
            <p className="text-xs text-amber-500">Alertas IA</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[['all', 'Todos'], ...Object.entries(EVENT_TYPES).map(([k, v]) => [k, v.label])].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilterType(key)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
              filterType === key 
                ? "bg-indigo-600 text-white border-indigo-600" 
                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 rounded-xl">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <h3 className="font-semibold text-slate-900 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h3>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 rounded-xl">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {weekDays.map(d => (
              <div key={d} className="py-2 text-center text-xs font-medium text-slate-400">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const inMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);
              const hasAlert = dayEvents.some(e => e.aiAlert);
              return (
                <div
                  key={idx}
                  className={cn(
                    "min-h-[80px] p-1 border-b border-r border-slate-100 relative",
                    !inMonth && "bg-slate-50/60",
                    today && "bg-indigo-50/40"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                      !inMonth && "text-slate-300",
                      today ? "bg-indigo-600 text-white" : "text-slate-600"
                    )}>
                      {format(day, 'd')}
                    </span>
                    {hasAlert && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map(ev => (
                      <EventPill key={ev.id} event={ev} onClick={setSelectedEvent} />
                    ))}
                    {dayEvents.length > 2 && (
                      <button
                        onClick={() => setSelectedEvent(dayEvents[2])}
                        className="w-full text-center text-xs text-slate-400 hover:text-slate-600"
                      >
                        +{dayEvents.length - 2} más
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {selectedEvent ? (
            <EventDetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500 text-center py-4">Haz clic en un evento para ver detalles</p>
            </div>
          )}

          {/* AI Alerts panel */}
          {alertEvents.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h4 className="font-semibold text-slate-800 text-sm">Alertas del mes ({alertEvents.length})</h4>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {alertEvents.slice(0, 8).map(ev => {
                  const type = EVENT_TYPES[ev.type];
                  const Icon = type.icon;
                  return (
                    <button
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100"
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-slate-800 truncate">{ev.title}</p>
                          <p className="text-xs text-amber-600 mt-0.5">{ev.aiAlert}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Leyenda</h4>
            {Object.entries(EVENT_TYPES).map(([key, val]) => {
              const Icon = val.icon;
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className={cn("w-2.5 h-2.5 rounded-full", val.color)} />
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-600">{val.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}