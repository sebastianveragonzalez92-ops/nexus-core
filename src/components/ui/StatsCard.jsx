import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, color = 'indigo', index = 0 }) {
  const colorStyles = {
    indigo: { gradient: 'from-indigo-600 to-indigo-700', shadow: 'shadow-indigo-300', light: 'bg-indigo-50' },
    emerald: { gradient: 'from-emerald-600 to-emerald-700', shadow: 'shadow-emerald-300', light: 'bg-emerald-50' },
    violet: { gradient: 'from-violet-600 to-violet-700', shadow: 'shadow-violet-300', light: 'bg-violet-50' },
    amber: { gradient: 'from-amber-600 to-amber-700', shadow: 'shadow-amber-300', light: 'bg-amber-50' },
    blue: { gradient: 'from-blue-600 to-blue-700', shadow: 'shadow-blue-300', light: 'bg-blue-50' },
    purple: { gradient: 'from-purple-600 to-purple-700', shadow: 'shadow-purple-300', light: 'bg-purple-50' },
  };

  const style = colorStyles[color] || colorStyles.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.4, type: 'spring', stiffness: 100 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative h-full overflow-hidden group cursor-pointer"
    >
      {/* Card background */}
      <div className={cn(
        "absolute inset-0 rounded-2xl transition-all duration-300",
        `bg-gradient-to-br ${style.gradient} ${style.shadow}`,
        "opacity-95 group-hover:opacity-100"
      )} />

      {/* Shine effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6 h-full flex flex-col justify-between text-white">
        <div className="flex items-start justify-between">
          <div className={cn(
            "p-3 rounded-xl transition-all duration-300",
            `${style.light} backdrop-blur-sm`
          )}>
            <Icon className="w-6 h-6 text-slate-900" />
          </div>
          {trend && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm",
                trend > 0 ? "bg-emerald-400/30 text-emerald-100" : "bg-rose-400/30 text-rose-100"
              )}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </motion.span>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-white/80 mb-2">{title}</p>
          <p className="text-4xl font-bold tracking-tight mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-white/70">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}