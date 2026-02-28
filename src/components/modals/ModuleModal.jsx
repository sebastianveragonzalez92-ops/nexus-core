import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Box, BarChart3, MessageSquare, Zap, Link2, Database, Shield, Globe, Layers, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const icons = [
  { name: 'Box', component: Box },
  { name: 'BarChart3', component: BarChart3 },
  { name: 'MessageSquare', component: MessageSquare },
  { name: 'Zap', component: Zap },
  { name: 'Link2', component: Link2 },
  { name: 'Database', component: Database },
  { name: 'Shield', component: Shield },
  { name: 'Globe', component: Globe },
  { name: 'Layers', component: Layers },
  { name: 'Cpu', component: Cpu },
];

const categories = [
  { value: 'core', label: 'Core' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'communication', label: 'Comunicación' },
  { value: 'productivity', label: 'Productividad' },
  { value: 'integration', label: 'Integración' },
];

export default function ModuleModal({ isOpen, onClose, onSave, module }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: 'Box',
    category: 'core',
    status: 'active',
  });

  useEffect(() => {
    if (module) {
      setForm({
        name: module.name || '',
        description: module.description || '',
        icon: module.icon || 'Box',
        category: module.category || 'core',
        status: module.status || 'active',
      });
    } else {
      setForm({
        name: '',
        description: '',
        icon: 'Box',
        category: 'core',
        status: 'active',
      });
    }
  }, [module, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 max-h-[80vh] flex flex-col"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mx-4 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-xl font-semibold text-slate-900">
                  {module ? 'Editar módulo' : 'Nuevo módulo'}
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                    Nombre del módulo
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej: Gestión de usuarios"
                    className="rounded-xl border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                    Descripción
                  </Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe la funcionalidad del módulo..."
                    className="rounded-xl border-slate-200 focus:border-indigo-300 focus:ring-indigo-200 resize-none h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Icono</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {icons.map(({ name, component: Icon }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setForm({ ...form, icon: name })}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all",
                          form.icon === name
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-slate-100 hover:border-slate-200"
                        )}
                      >
                        <Icon className={cn(
                          "w-5 h-5 mx-auto",
                          form.icon === name ? "text-indigo-600" : "text-slate-400"
                        )} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium text-slate-700">
                    Categoría
                  </Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="rounded-xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="flex-1 rounded-xl"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
                  >
                    {module ? 'Guardar cambios' : 'Crear módulo'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}