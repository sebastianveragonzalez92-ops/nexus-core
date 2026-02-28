import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasPermission } from '@/components/lib/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import WorkOrderApprovalFlow from './WorkOrderApprovalFlow';
import WorkOrderPartsPanel from './WorkOrderPartsPanel';

export default function WorkOrderManagement({ workOrders, assets, user }) {
  const isAdmin = hasPermission(user, 'maintenance.work_orders.create');
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingWO, setEditingWO] = useState(null);
  const [formData, setFormData] = useState({
    asset_id: '',
    type: 'preventivo',
    priority: 'media',
    description: '',
    assigned_to: '',
    estimated_hours: '',
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingWO) {
        return await base44.entities.WorkOrder.update(editingWO.id, data);
      } else {
        return await base44.entities.WorkOrder.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
      toast.success(editingWO ? 'OT actualizada' : 'OT creada');
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || 'Error al guardar');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WorkOrder.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
      toast.success('OT eliminada');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.asset_id || !formData.description) {
      toast.error('Activo y descripción son obligatorios');
      return;
    }

    const data = {
      ...formData,
      estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
      status: editingWO?.status || 'pendiente',
    };

    saveMutation.mutate(data);
  };

  const handleEdit = (wo) => {
    setEditingWO(wo);
    setFormData({
      asset_id: wo.asset_id,
      type: wo.type,
      priority: wo.priority,
      description: wo.description,
      assigned_to: wo.assigned_to || '',
      estimated_hours: wo.estimated_hours || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingWO(null);
    setFormData({
      asset_id: '',
      type: 'preventivo',
      priority: 'media',
      description: '',
      assigned_to: '',
      estimated_hours: '',
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      baja: 'bg-blue-100 text-blue-800',
      media: 'bg-amber-100 text-amber-800',
      alta: 'bg-orange-100 text-orange-800',
      urgente: 'bg-red-100 text-red-800',
    };
    return colors[priority] || colors.media;
  };

  const getStatusColor = (status) => {
    const colors = {
      pendiente: 'bg-slate-100 text-slate-800',
      asignada: 'bg-blue-100 text-blue-800',
      en_progreso: 'bg-indigo-100 text-indigo-800',
      en_aprobacion: 'bg-purple-100 text-purple-800',
      completada: 'bg-green-100 text-green-800',
      cancelada: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.pendiente;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Órdenes de Trabajo</h2>
          <p className="text-slate-600">Total: {workOrders.length}</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva OT
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>{editingWO ? 'Editar' : 'Nueva'} Orden de Trabajo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Activo *</Label>
                    <Select value={formData.asset_id} onValueChange={(value) => setFormData({ ...formData, asset_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona activo" />
                      </SelectTrigger>
                      <SelectContent>
                        {assets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.name} ({asset.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preventivo">Preventivo</SelectItem>
                        <SelectItem value="correctivo">Correctivo</SelectItem>
                        <SelectItem value="predictivo">Predictivo</SelectItem>
                        <SelectItem value="mejora">Mejora</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Prioridad</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baja">Baja</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Horas Estimadas</Label>
                    <Input type="number" step="0.5" value={formData.estimated_hours} onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })} placeholder="2.5" />
                  </div>
                </div>
                <div>
                  <Label>Descripción *</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe el trabajo a realizar..." rows={3} />
                </div>
                <div>
                  <Label>Asignar a</Label>
                  <Input value={formData.assigned_to} onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })} placeholder="Email del técnico" />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Work Orders List */}
      <div className="space-y-3">
        {workOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">Sin órdenes de trabajo</p>
            </CardContent>
          </Card>
        ) : (
          workOrders.map((wo) => {
            const asset = assets.find((a) => a.id === wo.asset_id);
            return (
              <motion.div key={wo.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="border-l-4" style={{ borderLeftColor: wo.priority === 'urgente' ? '#ef4444' : '#6366f1' }}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-semibold text-slate-900">#{wo.number || wo.id.slice(0, 8)}</span>
                          <Badge className={getPriorityColor(wo.priority)}>{wo.priority}</Badge>
                          <WorkOrderApprovalFlow
                            wo={wo}
                            user={user}
                            onRefresh={() => queryClient.invalidateQueries({ queryKey: ['workOrders'] })}
                          />
                        </div>
                        <p className="text-slate-700 mb-1">{wo.description}</p>
                        <div className="text-sm text-slate-500 space-y-0.5">
                          <p>Activo: <span className="font-medium">{asset?.name}</span></p>
                          {wo.estimated_hours && <p>Horas est.: {wo.estimated_hours}h</p>}
                          {wo.assigned_to && <p>Asignado: {wo.assigned_to}</p>}
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(wo)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(wo.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <WorkOrderPartsPanel workOrderId={wo.id} user={user} />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}