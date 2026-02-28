import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, CheckSquare, Calendar, Pencil, Trash2, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import TaskForm from './TaskForm';
import TaskCalendar from './TaskCalendar';

const priorityColors = {
  baja: 'bg-blue-100 text-blue-700',
  media: 'bg-yellow-100 text-yellow-700',
  alta: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
};

const statusConfig = {
  pendiente: { label: 'Pendiente', color: 'bg-slate-100 text-slate-600', icon: Clock },
  en_progreso: { label: 'En progreso', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  completada: { label: 'Completada', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-600', icon: XCircle },
};

function TaskCard({ task, onEdit, onDelete }) {
  const sc = statusConfig[task.status] || statusConfig.pendiente;
  const Icon = sc.icon;
  const isOverdue = task.due_date && new Date(task.due_date + 'T00:00:00') < new Date() && task.status !== 'completada';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-semibold text-slate-900 truncate">{task.title}</span>
              <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
              <Badge className={sc.color}><Icon className="w-3 h-3 mr-1" />{sc.label}</Badge>
            </div>
            {task.description && <p className="text-sm text-slate-500 mb-2 line-clamp-2">{task.description}</p>}
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              {task.assigned_to && <span>👤 {task.assigned_to}</span>}
              {task.due_date && (
                <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                  📅 {task.due_date}{isOverdue ? ' · Vencida' : ''}
                </span>
              )}
            </div>
            {/* Progress bar */}
            {task.progress > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Progreso</span><span>{task.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => onEdit(task)}><Pencil className="w-4 h-4 text-slate-400" /></Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TaskManager({ user }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [calendarTask, setCalendarTask] = useState(null);
  const queryClient = useQueryClient();
  const canManage = ['admin', 'supervisor'].includes(user?.role);

  const { data: tasks = [] } = useQuery({
    queryKey: ['maintenanceTasks'],
    queryFn: () => base44.entities.MaintenanceTask.list('-due_date', 100),
  });

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    await base44.entities.MaintenanceTask.delete(id);
    queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
  };

  const stats = {
    total: tasks.length,
    pendiente: tasks.filter(t => t.status === 'pendiente').length,
    en_progreso: tasks.filter(t => t.status === 'en_progreso').length,
    completada: tasks.filter(t => t.status === 'completada').length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Gestión de Tareas</h2>
          <p className="text-sm text-slate-500">{stats.total} tareas · {stats.pendiente} pendientes · {stats.en_progreso} en progreso</p>
        </div>
        {canManage && (
          <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" /> Nueva Tarea
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-slate-50 border-slate-200 text-slate-700' },
          { label: 'Pendientes', value: stats.pendiente, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'En progreso', value: stats.en_progreso, color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Completadas', value: stats.completada, color: 'bg-green-50 border-green-200 text-green-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.color}`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs: lista y calendario */}
      <Tabs defaultValue="lista">
        <TabsList>
          <TabsTrigger value="lista" className="gap-2"><CheckSquare className="w-4 h-4" />Lista</TabsTrigger>
          <TabsTrigger value="calendario" className="gap-2"><Calendar className="w-4 h-4" />Calendario</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-3 mt-4">
          {tasks.length === 0 ? (
            <div className="text-center py-14 border-2 border-dashed border-slate-200 rounded-2xl">
              <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Sin tareas aún</p>
              <Button onClick={() => setShowForm(true)} variant="outline" className="mt-4 gap-2">
                <Plus className="w-4 h-4" /> Crear tarea
              </Button>
            </div>
          ) : (
            tasks.map(t => (
              <TaskCard
                key={t.id}
                task={t}
                onEdit={(task) => { setEditing(task); setShowForm(true); }}
                onDelete={handleDelete}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="calendario" className="mt-4">
          <TaskCalendar
            tasks={tasks}
            onTaskClick={(t) => { setEditing(t); setShowForm(true); }}
          />
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar tarea' : 'Nueva tarea'}</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={editing}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}