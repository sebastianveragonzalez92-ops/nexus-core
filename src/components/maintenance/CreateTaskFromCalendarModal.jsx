import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckSquare, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function CreateTaskFromCalendarModal({ isOpen, onClose, defaultDate, user }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    due_date: defaultDate || '',
    priority: 'media',
    assigned_to: user?.email || '',
    status: 'pendiente',
  });

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setForm(f => ({ ...f, due_date: defaultDate || f.due_date, assigned_to: user?.email || '' }));
    }
  }, [isOpen, defaultDate, user]);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.entities.MaintenanceTask.create(form);

      if (sendNotification && form.assigned_to) {
        await base44.entities.Notification.create({
          user_email: form.assigned_to,
          type: 'general',
          title: 'Nueva Tarea Asignada',
          message: `Se te asignó la tarea "${form.title}" con vencimiento ${new Date(form.due_date).toLocaleDateString('es-CL')}. Prioridad: ${form.priority}.`,
          action_url: '/Maintenance',
          metadata: { task_title: form.title, due_date: form.due_date, priority: form.priority },
        });
      }

      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      toast.success('Tarea creada' + (sendNotification && form.assigned_to ? ' y notificación enviada' : ''));
      onClose();
      setForm({ title: '', description: '', due_date: '', priority: 'media', assigned_to: user?.email || '', status: 'pendiente' });
    } catch (err) {
      toast.error('Error al crear la tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Nueva Tarea</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">Título *</Label>
                <Input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej: Inspección de válvulas"
                  className="mt-1 rounded-xl"
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Descripción</Label>
                <Textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Detalles de la tarea..."
                  className="mt-1 rounded-xl resize-none h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Fecha vencimiento *</Label>
                  <Input
                    type="date"
                    value={form.due_date}
                    onChange={e => setForm({ ...form, due_date: e.target.value })}
                    className="mt-1 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Prioridad</Label>
                  <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                    <SelectTrigger className="mt-1 rounded-xl">
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
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Asignar a</Label>
                <Select value={form.assigned_to} onValueChange={v => setForm({ ...form, assigned_to: v })}>
                  <SelectTrigger className="mt-1 rounded-xl">
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.email}>
                        {u.full_name || u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notification toggle */}
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-600" />
                  <div>
                    <p className="text-sm font-medium text-indigo-900">Notificar al asignado</p>
                    <p className="text-xs text-indigo-500">Envía una notificación in-app</p>
                  </div>
                </div>
                <Switch
                  checked={sendNotification}
                  onCheckedChange={setSendNotification}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                >
                  {loading ? 'Creando...' : 'Crear Tarea'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}