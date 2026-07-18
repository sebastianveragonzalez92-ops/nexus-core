import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft } from 'lucide-react';

export default function TicketForm({ ticket, user, config, onSubmit, onCancel, isLoading }) {
  const [form, setForm] = useState({
    subject: ticket?.subject || '',
    description: ticket?.description || '',
    category: ticket?.category || '',
    priority: ticket?.priority || (config.priorities[0]?.value || 'media'),
    status: ticket?.status || (config.statuses[0]?.value || 'abierto'),
    ubicacion: ticket?.ubicacion || '',
    tipo: ticket?.tipo || '',
    solucion: ticket?.solucion || '',
    fecha_inicio: ticket?.fecha_inicio || new Date().toISOString().slice(0, 16),
    fecha_fin: ticket?.fecha_fin || '',
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
                  <Input value={user?.full_name || user?.email || ''} readOnly className="bg-slate-50 text-slate-700" />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-3">
                <Label className="text-right text-sm text-slate-600">Asunto *</Label>
                <div className="col-span-2">
                  <Input value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Asunto del ticket" required />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-3">
                <Label className="text-right text-sm text-slate-600">Reportado por</Label>
                <div className="col-span-2">
                  <Input value={ticket?.user_email || user?.email || ''} readOnly className="bg-slate-50 text-slate-500 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-3 items-start gap-3">
                <Label className="text-right text-sm text-slate-600 mt-2">Descripción</Label>
                <div className="col-span-2">
                  <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe el problema en detalle..." rows={5} required />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-3">
                <Label className="text-right text-sm text-slate-600">Asignado a</Label>
                <div className="col-span-2">
                  <Input value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} placeholder="Email del agente asignado" />
                </div>
              </div>

              {ticket && (
                <div className="grid grid-cols-3 items-start gap-3">
                  <Label className="text-right text-sm text-slate-600 mt-2">Resolución</Label>
                  <div className="col-span-2">
                    <Textarea value={form.resolution_notes} onChange={e => set('resolution_notes', e.target.value)} placeholder="Notas de resolución..." rows={3} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha - Detalles */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-700">Ampliar Detalles</h2>
            </div>
            <div className="p-5 space-y-4">

              <OptionSelect label="Categoría" value={form.category} onChange={v => set('category', v)} options={config.categories} />
              <OptionSelect label="Estado" value={form.status} onChange={v => set('status', v)} options={config.statuses} />
              <OptionSelect label="Prioridad" value={form.priority} onChange={v => set('priority', v)} options={config.priorities} />

              <div className="grid grid-cols-3 items-center gap-3">
                <Label className="text-right text-sm text-slate-600">Ubicación</Label>
                <div className="col-span-2">
                  <Input value={form.ubicacion} onChange={e => set('ubicacion', e.target.value)} placeholder="Ubicación relacionada" />
                </div>
              </div>

              <OptionSelect label="Tipo" value={form.tipo} onChange={v => set('tipo', v)} options={config.tipos} />
              <OptionSelect label="Solución" value={form.solucion} onChange={v => set('solucion', v)} options={config.soluciones} />

              <div className="grid grid-cols-3 items-center gap-3">
                <Label className="text-right text-sm text-slate-600">Inicio</Label>
                <div className="col-span-2">
                  <Input type="datetime-local" value={form.fecha_inicio} onChange={e => set('fecha_inicio', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-3">
                <Label className="text-right text-sm text-slate-600">Fin</Label>
                <div className="col-span-2">
                  <Input type="datetime-local" value={form.fecha_fin} onChange={e => set('fecha_fin', e.target.value)} />
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading ? 'Guardando...' : (ticket ? 'Actualizar' : 'Guardar')}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}

function OptionSelect({ label, value, onChange, options }) {
  return (
    <div className="grid grid-cols-3 items-center gap-3">
      <Label className="text-right text-sm text-slate-600">{label}</Label>
      <div className="col-span-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder="-- Seleccione --" /></SelectTrigger>
          <SelectContent>
            {(options || []).map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}