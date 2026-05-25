import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft } from 'lucide-react';

const CATEGORIES = [
  { value: 'bug', label: 'Bug / Error' },
  { value: 'feature', label: 'Solicitud de función' },
  { value: 'billing', label: 'Facturación' },
  { value: 'account', label: 'Cuenta' },
  { value: 'other', label: 'Otro' },
];

const PRIORITIES = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

const STATUSES = [
  { value: 'abierto', label: 'Abierto' },
  { value: 'en_progreso', label: 'En Progreso' },
  { value: 'resuelto', label: 'Resuelto' },
  { value: 'cerrado', label: 'Cerrado' },
];

export default function TicketForm({ ticket, user, onSubmit, onCancel, isLoading }) {
  const [form, setForm] = useState({
    subject: ticket?.subject || '',
    description: ticket?.description || '',
    category: ticket?.category || '',
    priority: ticket?.priority || 'media',
    status: ticket?.status || 'abierto',
    assigned_to: ticket?.assigned_to || '',
    resolution_notes: ticket?.resolution_notes || '',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-slate-900">
          {ticket ? 'Editar Ticket' : 'Registrar Ticket'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda - General */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-700">General</h2>
            </div>
            <div className="p-5 space-y-4">

              <div className="grid grid-cols-3 items-center gap-3">
                <Label className="text-right text-sm text-slate-600">Atendido por</Label>
                <div className="col-span-2">
                  <Input
                    value={user?.full_name || user?.email || ''}
                    readOnly
                    className="bg-slate-50 text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-3">
                <Label className="text-right text-sm text-slate-600">Asunto *</Label>
                <div className="col-span-2">
                  <Input
                    value={form.subject}
                    onChange={e => set('subject', e.target.value)}
                    placeholder="Asunto del ticket"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-3">
                <Label className="text-right text-sm text-slate-600">Reportado por</Label>
                <div className="col-span-2">
                  <Input
                    value={ticket?.user_email || user?.email || ''}
                    readOnly
                    className="bg-slate-50 text-slate-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-start gap-3">
                <Label className="text-right text-sm text-slate-600 mt-2">Descripción</Label>
                <div className="col-span-2">
                  <Textarea
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Describe el problema en detalle..."
                    rows={5}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-3">
                <Label className="text-right text-sm text-slate-600">Asignado a</Label>
                <div className="col-span-2">
                  <Input
                    value={form.assigned_to}
                    onChange={e => set('assigned_to', e.target.value)}
                    placeholder="Email del agente asignado"
                  />
                </div>
              </div>

              {ticket && (
                <div className="grid grid-cols-3 items-start gap-3">
                  <Label className="text-right text-sm text-slate-600 mt-2">Resolución</Label>
                  <div className="col-span-2">
                    <Textarea
                      value={form.resolution_notes}
                      onChange={e => set('resolution_notes', e.target.value)}
                      placeholder="Notas de resolución..."
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha - Ampliar Detalles */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-700">Ampliar Detalles</h2>
            </div>
            <div className="p-5 space-y-4">

              <div className="grid grid-cols-3 items-center gap-3">
                <Label className="text-right text-sm text-slate-600">Categoría</Label>
                <div className="col-span-2">
                  <Select value={form.category} onValueChange={v => set('category', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="-- Seleccione --" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-3">
                <Label className="text-right text-sm text-slate-600">Estado</Label>
                <div className="col-span-2">
                  <Select value={form.status} onValueChange={v => set('status', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="-- Seleccione --" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-3">
                <Label className="text-right text-sm text-slate-600">Prioridad</Label>
                <div className="col-span-2">
                  <Select value={form.priority} onValueChange={v => set('priority', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="-- Seleccione --" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-6">
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading ? 'Guardando...' : (ticket ? 'Actualizar' : 'Guardar')}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}