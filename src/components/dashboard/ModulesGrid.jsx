import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ModuleCard from '@/components/ui/ModuleCard';

export default function ModulesGrid({ modules, onToggleModule, onAddModule, isAdmin = false }) {
  const displayModules = isAdmin ? modules : modules.filter(m => m.status === 'active');
  
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mt-10"
    >
      <div className="mb-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Módulos y Funcionalidades</h2>
            <p className="text-sm text-slate-600">
              {isAdmin ? '🎛️ Administra todos los módulos disponibles' : '🚀 Accede a las herramientas del sistema'}
            </p>
          </div>
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={onAddModule}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl shadow-lg shadow-indigo-300 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo módulo
              </Button>
            </motion.div>
          )}
        </div>
        {/* Decorative line */}
        <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
        {isAdmin ? (
          <>
            {modules.filter(m => m.status === 'active').map((module, index) => (
              <ModuleCard
                key={module.id}
                module={module}
                onToggle={onToggleModule}
                index={index}
                isAdmin={isAdmin}
              />
            ))}
            {modules.filter(m => m.status !== 'active').map((module, index) => (
              <ModuleCard
                key={module.id}
                module={module}
                onToggle={onToggleModule}
                index={modules.filter(m => m.status === 'active').length + index}
                isAdmin={isAdmin}
              />
            ))}
          </>
        ) : (
          displayModules.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              onToggle={null}
              index={index}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>

      {displayModules.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Plus className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 mb-1">Sin módulos</h3>
          <p className="text-sm text-slate-500">Crea tu primer módulo para comenzar</p>
        </motion.div>
      )}
    </motion.section>
  );
}