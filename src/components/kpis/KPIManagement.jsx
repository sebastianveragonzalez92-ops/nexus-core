import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export default function KPIManagement({ kpis, user, onSuccess }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingKPI, setEditingKPI] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target: 100,
    unit: '%',
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.KPI.create({
        ...data,
        created_by: user.email,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      setFormData({ name: '', description: '', target: 100, unit: '%' });
      setShowDialog(false);
      toast.success('KPI creado correctamente');
      onSuccess?.();
    },
    onError: () => toast.error('Error al crear KPI'),
  });

  const updateMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.KPI.update(editingKPI.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      setFormData({ name: '', description: '', target: 100, unit: '%' });
      setEditingKPI(null);
      setShowDialog(false);
      toast.success('KPI actualizado correctamente');
      onSuccess?.();
    },
    onError: () => toast.error('Error al actualizar KPI'),
  });

  const deleteMutation = useMutation({
    mutationFn: (kpiId) => base44.entities.KPI.delete(kpiId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      toast.success('KPI eliminado');
      onSuccess?.();
    },
  });

  const handleOpenDialog = (kpi = null) => {
    if (kpi) {
      setEditingKPI(kpi);
      setFormData({
        name: kpi.name,
        description: kpi.description || '',
        target: kpi.target,
        unit: kpi.unit || '%',
      });
    } else {
      setEditingKPI(null);
      setFormData({ name: '', description: '', target: 100, unit: '%' });
    }
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error('El nombre es requerido');
      return;
    }

    if (editingKPI) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-r from-blue-600 to-cyan-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Nuevo KPI
        </Button>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4">
        {kpis.length > 0 ? (
          kpis.map((kpi, index) => (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-lg">{kpi.name}</h3>
                      {kpi.description && (
                        <p className="text-sm text-slate-600 mt-1">{kpi.description}</p>
                      )}
                      <div className="flex gap-4 mt-3">
                        <div>
                          <p className="text-xs text-slate-500">Objetivo</p>
                          <p className="font-semibold text-slate-900">
                            {kpi.target} {kpi.unit}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDialog(kpi)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(kpi.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <p className="text-center text-slate-500 py-8">
                No hay KPIs creados. Crea el primero para empezar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingKPI ? 'Editar KPI' : 'Crear Nuevo KPI'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Nombre</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Eficiencia de Mantenimiento"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Descripción</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describir el KPI"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Objetivo</label>
                <Input
                  type="number"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: parseFloat(e.target.value) })}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Unidad</label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="%"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              {editingKPI ? 'Actualizar' : 'Crear'} KPI
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}