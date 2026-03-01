import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Activity, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';

const actionIcons = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  sync: RefreshCw,
  default: Activity,
};

const actionColors = {
  create: 'bg-emerald-100 text-emerald-600',
  update: 'bg-indigo-100 text-indigo-600',
  delete: 'bg-rose-100 text-rose-600',
  sync: 'bg-violet-100 text-violet-600',
  default: 'bg-slate-100 text-slate-600',
};

export default function ActivityItem({ activity, index = 0 }) {
  const Icon = actionIcons[activity.action] || actionIcons.default;
  const colorClass = actionColors[activity.action] || actionColors.default;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50/80 transition-colors group"
    >
      <div className={cn("p-2.5 rounded-xl shrink-0", colorClass)}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-slate-900 line-clamp-1">
              {typeof activity.details === 'string' ? activity.details : activity.action}
            </p>
            {activity.module && (
              <p className="text-xs text-slate-500 mt-0.5">
                Módulo: {activity.module}
              </p>
            )}
          </div>
          <time className="text-xs text-slate-400 whitespace-nowrap">
            {format(new Date(activity.created_date), "d MMM, HH:mm", { locale: es })}
          </time>
        </div>
      </div>
    </motion.div>
  );
}