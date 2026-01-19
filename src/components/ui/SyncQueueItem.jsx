import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Clock, RefreshCw, CheckCircle2, XCircle, ArrowUpCircle, Trash2, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Pendiente' },
  syncing: { icon: RefreshCw, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Sincronizando', spin: true },
  completed: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Completado' },
  failed: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Fallido' },
};

const actionConfig = {
  create: { icon: ArrowUpCircle, label: 'Crear' },
  update: { icon: Edit, label: 'Actualizar' },
  delete: { icon: Trash2, label: 'Eliminar' },
};

export default function SyncQueueItem({ item, index = 0 }) {
  const status = statusConfig[item.status] || statusConfig.pending;
  const action = actionConfig[item.action] || actionConfig.create;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors"
    >
      <div className={cn("p-2.5 rounded-xl", status.bg)}>
        <StatusIcon className={cn("w-4 h-4", status.color, status.spin && "animate-spin")} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-slate-900">
            {item.entity_type}
          </span>
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            {action.label}
          </Badge>
        </div>
        <p className="text-xs text-slate-500">
          {item.error_message || `ID: ${item.entity_id || 'N/A'}`}
        </p>
      </div>

      <div className="text-right">
        <span className={cn("text-xs font-medium", status.color)}>
          {status.label}
        </span>
        {item.retry_count > 0 && (
          <p className="text-xs text-slate-400 mt-0.5">
            Reintentos: {item.retry_count}
          </p>
        )}
      </div>
    </motion.div>
  );
}