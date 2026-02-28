import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function TaskForm({ task, reportId, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assigned_to: task?.assigned_to || '',
    due_date: task?.due_date || '',
    priority: task?.priority || 'media',
    status: task?.status || 'pendiente',
    progress: task?.progress ?? 0,
    notes: task?.notes || '',
    report_id: task?.report_id || reportId || '',
  });
  const [saving, setSaving] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['maintenanceReportsAll'],
    queryFn: () => base44.entities.MaintenanceReport.list('-created_date', 50),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (task?.id) {
      await base44.entities.MaintenanceTask.update(task.id, form);
    } else {
      await base44.entities.MaintenanceTask.create(form);
    }
    setSaving(false);
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Título *</Label>
        <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="mt-1" />
      </div>
      <div>
        <Label>Descripción</Label>
        <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 h-20 resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Asignar a</Label>
          <Select value={form.assigned_to} onValueChange={v => setForm({ ...form, assigned_to: v })}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Seleccionar usuario" />
            </SelectTrigger>
            <SelectContent>
              {users.map(u => (
                <SelectItem key={u.id} value={u.email}>{u.full_name || u.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Fecha de vencimiento *</Label>
          <Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} required className="mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Prioridad</Label>
          <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="baja">Baja</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Estado</Label>
          <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="en_progreso">En progreso</SelectItem>
              <SelectItem value="completada">Completada</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Progreso: {form.progress}%</Label>
        <input type="range" min="0" max="100" value={form.progress}
          onChange={e => setForm({ ...form, progress: Number(e.target.value) })}
          className="w-full mt-1 accent-indigo-600" />
      </div>
      <div>
        <Label>Informe asociado (opcional)</Label>
        <Select value={form.report_id} onValueChange={v => setForm({ ...form, report_id: v })}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Sin informe asociado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Sin informe asociado</SelectItem>
            {reports.map(r => (
              <SelectItem key={r.id} value={r.id}>{r.title || `${r.tipo_equipo} ${r.numero_interno_equipo}`} — {r.report_date}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Notas</Label>
        <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="mt-1 h-16 resize-none" />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {task ? 'Guardar cambios' : 'Crear tarea'}
        </Button>
      </div>
    </form>
  );
}