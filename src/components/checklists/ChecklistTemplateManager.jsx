import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Copy, Sparkles, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ChecklistTemplateManager({ templates, user }) {
  const [newTemplate, setNewTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'epp',
    items: [{ id: 'item_1', name: '', type: 'checkbox', required: true, order: 0 }],
  });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const template = await base44.entities.ChecklistTemplate.create({
        ...data,
        status: 'active',
        created_by: user.email,
        applicable_roles: ['tecnico', 'supervisor'],
      });
      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklistTemplates'] });
      setFormData({
        name: '',
        description: '',
        category: 'epp',
        items: [{ id: 'item_1', name: '', type: 'checkbox', required: true, order: 0 }],
      });
      toast.success('Template creado exitosamente');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.ChecklistTemplate.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklistTemplates'] });
      toast.success('Template eliminado');
    },
  });

  const handleAddItem = () => {
    const newId = `item_${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: newId, name: '', type: 'checkbox', required: true, order: prev.items.length }],
    }));
  };

  const handleRemoveItem = (id) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }));
  };

  const handleSuggestItems = async () => {
    if (!formData.category) {
      toast.error('Selecciona una categoría primero');
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await base44.functions.invoke('suggestChecklistItems', {
        category: formData.category,
        type: formData.name,
        shift: 'general',
      });

      const suggestedItems = response.data.items.map((item, idx) => ({
        ...item,
        id: `item_${Date.now()}_${idx}`,
        order: idx,
      }));

      setFormData(prev => ({
        ...prev,
        items: [...prev.items, ...suggestedItems],
      }));

      toast.success(`${suggestedItems.length} items sugeridos por IA`);
    } catch (error) {
      toast.error('Error al generar sugerencias');
      console.error(error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleUpdateItem = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || formData.items.length === 0) {
      toast.error('Completa todos los campos requeridos');
      return;
    }
    createMutation.mutate(formData);
    setNewTemplate(null);
  };

  const handleEditClick = (template) => {
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      items: template.items || [],
    });
    setEditingTemplate(template.id);
  };

  const handleCloseDialog = () => {
    setNewTemplate(false);
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      category: 'epp',
      items: [{ id: 'item_1', name: '', type: 'checkbox', required: true, order: 0 }],
    });
  };

  return (
    <div className="space-y-6">
      {/* Dialog para crear/editar */}
      <Dialog open={newTemplate || editingTemplate} onOpenChange={handleCloseDialog}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Template
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Editar Template' : 'Crear Nuevo Template'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Nombre del Template *
              </label>
              <Input
                placeholder="ej: EPP Inicio de Turno"
                value={formData.name}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Descripción
              </label>
              <textarea
                placeholder="Describe para qué sirve este checklist"
                value={formData.description}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, description: e.target.value }))
                }
                className="w-full p-3 border border-slate-200 rounded-lg"
                rows="3"
              />
            </div>

            {/* Roles Aplicables */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">
                Asignar a Roles Específicos
              </label>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-lg">
                {['admin', 'supervisor', 'tecnico', 'inspector', 'especialista', 'capacitador', 'operador'].map(role => (
                  <label key={role} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.applicable_roles?.includes(role) || false}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          applicable_roles: checked
                            ? [...(prev.applicable_roles || []), role]
                            : (prev.applicable_roles || []).filter(r => r !== role)
                        }));
                      }}
                    />
                    <span className="text-sm capitalize">{role}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {formData.applicable_roles?.length === 0 || !formData.applicable_roles
                  ? 'Si no seleccionas roles, estará disponible para todos'
                  : `Disponible para: ${formData.applicable_roles.join(', ')}`}
              </p>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-slate-900">
                  Items del Checklist
                </label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSuggestItems}
                    disabled={loadingSuggestions || !formData.category}
                    className="text-violet-600 border-violet-200 hover:bg-violet-50"
                  >
                    {loadingSuggestions ? (
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Sugerir con IA
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddItem}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Item
                  </Button>
                </div>
              </div>

              <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
                {formData.items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-4 rounded-lg border border-slate-200 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Input
                        placeholder="Nombre del item"
                        value={item.name}
                        onChange={(e) =>
                          handleUpdateItem(item.id, 'name', e.target.value)
                        }
                        className="flex-1"
                      />
                      {formData.items.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <select
                        value={item.type}
                        onChange={(e) =>
                          handleUpdateItem(item.id, 'type', e.target.value)
                        }
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      >
                        <option value="checkbox">Checkbox</option>
                        <option value="text">Texto</option>
                        <option value="number">Número</option>
                        <option value="select">Selección</option>
                      </select>

                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={item.required}
                          onCheckedChange={(checked) =>
                            handleUpdateItem(item.id, 'required', checked)
                          }
                        />
                        Requerido
                      </label>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Guardando...' : editingTemplate ? 'Guardar Cambios' : 'Crear Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lista de Templates */}
      <div className="grid gap-4">
        {templates.map((template, idx) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{template.name}</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    {template.description}
                  </p>
                </div>
                <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                  {template.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    {template.items?.length || 0} items · Categoría: {template.category}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClick(template)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(template.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-slate-500">No hay templates creados aún</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}