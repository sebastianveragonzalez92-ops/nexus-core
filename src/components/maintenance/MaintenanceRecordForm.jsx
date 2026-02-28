import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Loader2 } from 'lucide-react';

export default function MaintenanceRecordForm({ record, equipmentId, onSave, onCancel }) {
  const [form, setForm] = useState({
    equipment_id: record?.equipment_id || equipmentId || '',
    equipment_numero_interno: record?.equipment_numero_interno || '',
    report_id: record?.report_id || '',
    type: record?.type || 'preventivo',
    fecha: record?.fecha || new Date().toISOString().split('T')[0],
    hora_inicio: record?.hora_inicio || '',
    hora_fin: record?.hora_fin || '',
    tecnico: record?.tecnico || '',
    descripcion: record?.descripcion || '',
    repuestos: record?.repuestos || [],
    horas_trabajadas: record?.horas_trabajadas || '',
    costo: record?.costo || '',
    resultado: record?.resultado || 'exitoso',
    observaciones: record?.observaciones || '',
    proxima_mantencion: record?.proxima_mantencion || '',
  });
  const [saving, setSaving] = useState(false);

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 200),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  const addRepuesto = () => setForm(prev => ({
    ...prev,
    repuestos: [...prev.repuestos, { nombre: '', cantidad: 1, codigo: '' }],
  }));

  const updateRepuesto = (i, field, val) => setForm(prev => {
    const updated = [...prev.repuestos];
    updated[i] = { ...updated[i], [field]: val };
    return { ...prev, repuestos: updated };
  });

  const removeRepuesto = (i) => setForm(prev => ({
    ...prev,
    repuestos: prev.repuestos.filter((_, idx) => idx !== i),
  }));

  const handleEquipmentChange = (id) => {
    const eq = equipment.find(e => e.id === id);
    setForm(prev => ({
      ...prev,
      equipment_id: id,
      equipment_numero_interno: eq?.numero_interno || '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      horas_trabajadas: form.horas_trabajadas ? Number(form.horas_trabajadas) : undefined,
      costo: form.costo ? Number(form.costo) : undefined,
    };
    if (record?.id) {
      await base44.entities.MaintenanceRecord.update(record.id, data);
    } else {
      await base44.entities.MaintenanceRecord.create(data);
    }
    setSaving(false);
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      {/* Equipment & type */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Equipo</Label>
          <Select value={form.equipment_id} onValueChange={handleEquipmentChange}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar equipo" /></SelectTrigger>
            <SelectContent>
              {equipment.map(e => (
                <SelectItem key={e.id} value={e.id}>{e.nombre} — {e.numero_interno}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Tipo *</Label>
          <Select value={form.type} onValueChange={v => set('type', v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="preventivo">Preventivo</SelectItem>
              <SelectItem value="correctivo">Correctivo</SelectItem>
              <SelectItem value="predictivo">Predictivo</SelectItem>
              <SelectItem value="mejora">Mejora</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date & time */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Fecha *</Label>
          <Input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} required className="mt-1" />
        </div>
        <div>
          <Label>Hora inicio</Label>
          <Input type="time" value={form.hora_inicio} onChange={e => set('hora_inicio', e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Hora fin</Label>
          <Input type="time" value={form.hora_fin} onChange={e => set('hora_fin', e.target.value)} className="mt-1" />
        </div>
      </div>

      {/* Technician */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Técnico responsable</Label>
          <Select value={form.tecnico} onValueChange={v => set('tecnico', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar técnico" /></SelectTrigger>
            <SelectContent>
              {users.map(u => (
                <SelectItem key={u.id} value={u.full_name || u.email}>{u.full_name || u.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Resultado</Label>
          <Select value={form.resultado} onValueChange={v => set('resultado', v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="exitoso">Exitoso</SelectItem>
              <SelectItem value="parcial">Parcial</SelectItem>
              <SelectItem value="fallido">Fallido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div>
        <Label>Descripción del trabajo *</Label>
        <Textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} required className="mt-1 h-20 resize-none" />
      </div>

      {/* Repuestos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Repuestos utilizados</Label>
          <Button type="button" variant="outline" size="sm" onClick={addRepuesto} className="gap-1 h-7 text-xs">
            <Plus className="w-3 h-3" /> Agregar
          </Button>
        </div>
        {form.repuestos.length === 0 && (
          <p className="text-xs text-slate-400 italic">Sin repuestos registrados.</p>
        )}
        {form.repuestos.map((r, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <Input placeholder="Nombre" value={r.nombre} onChange={e => updateRepuesto(i, 'nombre', e.target.value)} className="flex-1 h-8 text-sm" />
            <Input placeholder="Código" value={r.codigo} onChange={e => updateRepuesto(i, 'codigo', e.target.value)} className="w-28 h-8 text-sm" />
            <Input type="number" placeholder="Cant." value={r.cantidad} onChange={e => updateRepuesto(i, 'cantidad', Number(e.target.value))} className="w-16 h-8 text-sm" min="1" />
            <Button type="button" variant="ghost" size="icon" onClick={() => removeRepuesto(i)} className="h-8 w-8 shrink-0">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </Button>
          </div>
        ))}
      </div>

      {/* Hours, cost, next maintenance */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Horas trabajadas</Label>
          <Input type="number" step="0.5" min="0" value={form.horas_trabajadas} onChange={e => set('horas_trabajadas', e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Costo</Label>
          <Input type="number" step="0.01" min="0" value={form.costo} onChange={e => set('costo', e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Próxima mantención</Label>
          <Input type="date" value={form.proxima_mantencion} onChange={e => set('proxima_mantencion', e.target.value)} className="mt-1" />
        </div>
      </div>

      {/* Observations */}
      <div>
        <Label>Observaciones</Label>
        <Textarea value={form.observaciones} onChange={e => set('observaciones', e.target.value)} className="mt-1 h-16 resize-none" />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {record ? 'Guardar cambios' : 'Registrar intervención'}
        </Button>
      </div>
    </form>
  );
}