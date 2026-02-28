import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import TaskForm from '../components/maintenance/TaskForm';
import { ClipboardList } from 'lucide-react';

export default function CreateTask() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  const allowed = ['admin', 'supervisor_mantenimiento'].includes(user?.role);

  if (!allowed) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-20 text-center">
        <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-slate-700">Acceso restringido</h2>
        <p className="text-sm text-slate-500 mt-1">Solo supervisores y administradores pueden crear tareas desde esta sección.</p>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-20 text-center">
        <ClipboardList className="w-12 h-12 text-green-400 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-slate-700">¡Tarea creada exitosamente!</h2>
        <button
          onClick={() => setSaved(false)}
          className="mt-4 text-sm text-indigo-600 hover:underline"
        >
          Crear otra tarea
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-indigo-500" />
          Crear Tarea
        </h1>
        <p className="text-sm text-slate-500 mt-1">Asigna y configura una nueva tarea de mantenimiento.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <TaskForm
          onSave={() => setSaved(true)}
          onCancel={() => window.history.back()}
        />
      </div>
    </div>
  );
}