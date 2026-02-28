import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function EquipmentForm({ equipment, onSave, onCancel }) {
  const [form, setForm] = useState({
    nombre: equipment?.nombre || '',
    tipo_equipo: equipment?.tipo_equipo || '',
    numero_interno: equipment?.numero_interno || '',
    numero_serie: equipment?.numero_serie || '',
    fabricante: equipment?.fabricante || '',
    modelo: equipment?.modelo || '',
    empresa: equipment?.empresa || '',
    division: equipment?.division || '',
    fecha_instalacion: equipment?.fecha_instalacion || '',
    fecha_proxima_mantencion: equipment?.fecha_proxima_mantencion || '',
    status: equipment?.status || 'operativo',
    notas: equipment?.notas || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (equipment?.id) {
      await base44.entities.Equipment.update(equipment.id, form);
    } else {
      await base44.entities.Equipment.create(form);
    }
    setSaving(false);
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Nombre *</Label>
          <Input value={form.nombre} onChange={e => set('nombre', e.target.value)} required className="mt-1" />
        </div>
        <div>
          <Label>Tipo de equipo *</Label>
          <Input value={form.tipo_equipo} onChange={e => set('tipo_equipo', e.target.value)} required className="mt-1" placeholder="Ej: Camión, CAS10…" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>N° interno *</Label>
          <Input value={form.numero_interno} onChange={e => set('numero_interno', e.target.value)} required className="mt-1" />
        </div>
        <div>
          <Label>N° de serie</Label>
          <Input value={form.numero_serie} onChange={e => set('numero_serie', e.target.value)} className="mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Fabricante</Label>
          <Input value={form.fabricante} onChange={e => set('fabricante', e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Modelo</Label>
          <Input value={form.modelo} onChange={e => set('modelo', e.target.value)} className="mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Empresa</Label>
          <Input value={form.empresa} onChange={e => set('empresa', e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>División</Label>
          <Input value={form.division} onChange={e => set('division', e.target.value)} className="mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Fecha instalación</Label>
          <Input type="date" value={form.fecha_instalacion} onChange={e => set('fecha_instalacion', e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Próxima mantención</Label>
          <Input type="date" value={form.fecha_proxima_mantencion} onChange={e => set('fecha_proxima_mantencion', e.target.value)} className="mt-1" />
        </div>
      </div>
      <div>
        <Label>Estado</Label>
        <Select value={form.status} onValueChange={v => set('status', v)}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="operativo">Operativo</SelectItem>
            <SelectItem value="mantenimiento">En mantención</SelectItem>
            <SelectItem value="fuera_servicio">Fuera de servicio</SelectItem>
            <SelectItem value="standby">Standby</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Notas</Label>
        <Textarea value={form.notas} onChange={e => set('notas', e.target.value)} className="mt-1 h-16 resize-none" />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {equipment ? 'Guardar cambios' : 'Agregar equipo'}
        </Button>
      </div>
    </form>
  );
}