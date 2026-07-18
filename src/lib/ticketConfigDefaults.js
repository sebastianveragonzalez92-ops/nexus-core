export const DEFAULT_TICKET_CONFIG = {
  categories: [
    { value: 'soporte', label: 'Soporte Técnico' },
    { value: 'incidente', label: 'Incidente' },
    { value: 'solicitud', label: 'Solicitud' },
    { value: 'consulta', label: 'Consulta' },
    { value: 'otro', label: 'Otro' },
  ],
  priorities: [
    { value: 'baja', label: 'Baja', color: 'bg-slate-100 text-slate-600' },
    { value: 'media', label: 'Media', color: 'bg-blue-100 text-blue-700' },
    { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-700' },
    { value: 'urgente', label: '🔴 Urgente', color: 'bg-red-100 text-red-700' },
  ],
  statuses: [
    { value: 'abierto', label: 'Abierto', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    { value: 'en_progreso', label: 'En Progreso', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
    { value: 'resuelto', label: 'Resuelto', color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
    { value: 'cerrado', label: 'Cerrado', color: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
  ],
  tipos: [
    { value: 'incidente', label: 'Incidente' },
    { value: 'solicitud', label: 'Solicitud' },
    { value: 'consulta', label: 'Consulta' },
    { value: 'cambio', label: 'Cambio' },
    { value: 'otro', label: 'Otro' },
  ],
  soluciones: [
    { value: 'resuelto_remotamente', label: 'Resuelto remotamente' },
    { value: 'visita_tecnica', label: 'Visita técnica' },
    { value: 'reemplazo', label: 'Reemplazo de equipo' },
    { value: 'configuracion', label: 'Configuración' },
    { value: 'capacitacion', label: 'Capacitación' },
    { value: 'sin_solucion', label: 'Sin solución' },
  ],
};

export function findOption(list, value) {
  return (list || []).find(o => o.value === value);
}

export function labelOf(config, field, value) {
  if (!value) return '—';
  const item = findOption(config?.[field], value);
  return item?.label || value;
}

export function priorityColor(config, value) {
  return findOption(config?.priorities, value)?.color || 'bg-slate-100 text-slate-600';
}

export function statusStyle(config, value) {
  const fallback = {
    color: 'bg-slate-100 text-slate-500 border-slate-200',
    dot: 'bg-slate-400',
    label: value,
  };
  return findOption(config?.statuses, value) || fallback;
}