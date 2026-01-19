import React from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertCircle, HelpCircle, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  {
    icon: HelpCircle,
    label: 'Consultar FAQ',
    prompt: '¿Cuáles son las preguntas más frecuentes sobre mantenimiento?',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: FileText,
    label: 'Ver SOPs',
    prompt: '¿Qué procedimientos operativos están disponibles?',
    color: 'from-emerald-500 to-green-500'
  },
  {
    icon: AlertCircle,
    label: 'Diagnosticar Falla',
    prompt: 'Tengo un equipo con una falla, necesito ayuda para diagnosticar',
    color: 'from-rose-500 to-red-500'
  },
  {
    icon: Wrench,
    label: 'Guía Mantenimiento',
    prompt: '¿Cómo realizo el mantenimiento preventivo de un equipo?',
    color: 'from-amber-500 to-orange-500'
  },
];

export default function QuickActions({ onActionClick }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onActionClick(action.prompt)}
            className="group relative p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all text-left overflow-hidden"
          >
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity",
              action.color
            )} />
            
            <div className="relative">
              <div className={cn(
                "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg",
                action.color
              )}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="font-semibold text-slate-900 mb-1">
                {action.label}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2">
                {action.prompt}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}