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
  'Mantenimiento': 'Settings',
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

  const cardClasses = cn(
    "group relative p-6 rounded-3xl border transition-all duration-300",
    "bg-white hover:shadow-xl hover:shadow-slate-200/50",
    isActive ? "border-slate-200 cursor-pointer" : "border-slate-100 opacity-60"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cardClasses}
      onClick={handleCardClick}
      onMouseDown={() => console.log('mouseDown en módulo:', module.name)}
    >
      {/* Status indicator */}
      <div className={cn(
        "absolute top-4 right-4 w-2 h-2 rounded-full transition-colors",
        isActive ? "bg-emerald-400" : "bg-slate-300"
      )} />

      {/* Icon */}
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300",
        isActive 
          ? "bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-200" 
          : "bg-slate-100"
      )}>
        <IconComponent className={cn(
          "w-7 h-7 transition-colors",
          isActive ? "text-white" : "text-slate-400"
        )} />
      </div>

      {/* Content */}
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-1.5">
          {module.name}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
          {module.description || 'Sin descripción'}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Badge 
          variant="outline" 
          className={cn("text-xs font-medium border", categoryColors[module.category])}
        >
          {module.category}
        </Badge>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {isActive && targetPage && (
            <ArrowRight className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
          {isAdmin && (
            <Switch
              checked={isActive}
              onCheckedChange={handleSwitchChange}
              className="data-[state=checked]:bg-indigo-500"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}