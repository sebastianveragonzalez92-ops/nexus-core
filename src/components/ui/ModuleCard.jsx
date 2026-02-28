import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';
import { 
  Box, BarChart3, MessageSquare, Zap, Link2, 
  Settings, Users, FileText, Calendar, Bell,
  Database, Shield, Globe, Layers, Cpu, ArrowRight
} from 'lucide-react';

const iconMap = {
  Box, BarChart3, MessageSquare, Zap, Link2,
  Settings, Users, FileText, Calendar, Bell,
  Database, Shield, Globe, Layers, Cpu
};

const categoryColors = {
  core: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  analytics: 'bg-violet-50 text-violet-700 border-violet-200',
  communication: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  productivity: 'bg-amber-50 text-amber-700 border-amber-200',
  integration: 'bg-rose-50 text-rose-700 border-rose-200',
};

const pageMap = {
   'Capacitación': 'Courses',
   'Capacitaciones': 'Courses',
   'Training': 'Courses',
   'LMS': 'Courses',
   'LMS - Capacitación': 'Courses',
   'Tutor': 'Tutor',
   'Tutor IA': 'Tutor',
   'Actividad': 'Activity',
   'Activity': 'Activity',
   'Configuración': 'Settings',
   'Settings': 'Settings',
   'KPIs': 'InstructorDashboard',
   'KPIs y Reportes': 'InstructorDashboard',
   'Analytics': 'InstructorDashboard',
   'Dashboard analytics': 'InstructorDashboard',
   'Reportes': 'InstructorDashboard',
   'Notificaciones': 'Notifications',
   'Notifications': 'Notifications',
   'Gestión de usuarios': 'Settings',
   'Gestión de Activos': 'Settings',
   'Mantenimiento': 'Maintenance',
   'Maintenance': 'Maintenance',
   'Almacenamiento': 'Settings',
   'Integraciones API': 'Settings',
   'Automatizaciones': 'Settings',
};

export default function ModuleCard({ module, onToggle, index = 0, isAdmin = false }) {
  console.log('Renderizando ModuleCard:', module?.name, 'isAdmin:', isAdmin);
  
  if (!module) {
    console.error('ModuleCard: módulo es null o undefined');
    return null;
  }

  const IconComponent = iconMap[module.icon] || Box;
  const isActive = module.status === 'active';
  const targetPage = pageMap[module.name];

  const handleCardClick = (e) => {
    console.log('🔴 CLICK DETECTADO - Módulo:', module.name, 'isActive:', isActive, 'targetPage:', targetPage, 'isAdmin:', isAdmin);
    
    try {
      // Prevenir propagación de clicks en el área del switch
      if (isAdmin && (e.target.closest('[role="switch"]') || e.target.closest('button[role="switch"]'))) {
        console.log('❌ Click en switch - no redirigir');
        return;
      }
      
      if (!isActive) {
        console.log('❌ Módulo inactivo - no redirigir');
        return;
      }
      
      if (!targetPage) {
        console.warn('⚠️ Sin mapeo de página para:', module.name);
        return;
      }
      
      const url = createPageUrl(targetPage);
      console.log('✅ Redirigiendo a:', url);
      window.location.href = url;
    } catch (error) {
      console.error('💥 Error en handleCardClick:', error);
    }
  };

  const handleSwitchChange = () => {
    if (onToggle) {
      onToggle(module);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.4, type: 'spring' }}
      whileHover={isActive ? { y: -6, transition: { duration: 0.2 } } : {}}
      className="h-full"
    >
      <div 
        onClick={handleCardClick}
        className={cn(
        "group relative h-full p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col",
        isActive 
          ? "bg-white border-slate-200 hover:shadow-2xl hover:shadow-slate-300/40 hover:border-slate-300 cursor-pointer" 
          : "bg-slate-50/50 border-slate-100 opacity-50 hover:opacity-60"
      )}>
        {/* Status indicator */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "absolute top-4 right-4 w-3 h-3 rounded-full transition-all duration-300",
            isActive ? "bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-300" : "bg-slate-300"
          )} 
        />

        {/* Icon */}
        <motion.div 
          whileHover={isActive ? { scale: 1.1, rotate: 5 } : {}}
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300",
            isActive 
              ? "bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-300" 
              : "bg-slate-200"
          )}>
          <IconComponent className={cn(
            "w-8 h-8 transition-colors",
            isActive ? "text-white" : "text-slate-400"
          )} />
        </motion.div>

        {/* Content */}
        <div className="mb-4 flex-1">
          <h3 className={cn(
            "font-bold mb-2 transition-colors",
            isActive ? "text-lg text-slate-900" : "text-base text-slate-600"
          )}>
            {module.name}
          </h3>
          <p className={cn(
            "text-sm leading-relaxed line-clamp-3",
            isActive ? "text-slate-600" : "text-slate-500"
          )}>
            {module.description || 'Sin descripción'}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Badge 
            variant="outline" 
            className={cn("text-xs font-semibold border-2", categoryColors[module.category])}
          >
            {module.category}
          </Badge>
          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            {isActive && targetPage && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ArrowRight className="w-5 h-5 text-indigo-600" />
              </motion.div>
            )}
            {isAdmin && (
              <Switch
                checked={isActive}
                onCheckedChange={handleSwitchChange}
                className="data-[state=checked]:bg-indigo-600"
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}