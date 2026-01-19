import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, color = 'indigo', index = 0 }) {
  const colorStyles = {
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-200',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-200',
    violet: 'from-violet-500 to-violet-600 shadow-violet-200',
    amber: 'from-amber-500 to-amber-600 shadow-amber-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="relative p-6 bg-white rounded-3xl border border-slate-200 overflow-hidden group hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
    >
      {/* Background gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent rounded-full transform translate-x-8 -translate-y-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "p-3 rounded-2xl bg-gradient-to-br shadow-lg",
            colorStyles[color]
          )}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend && (
            <span className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium text-slate-500 mb-1">{title}</h4>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}