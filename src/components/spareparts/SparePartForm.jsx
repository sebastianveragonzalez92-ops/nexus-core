import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

const CATEGORIES = [
  { value: 'electrico', label: 'Eléctrico' },
  { value: 'mecanico', label: 'Mecánico' },
  { value: 'hidraulico', label: 'Hidráulico' },
  { value: 'neumatico', label: 'Neumático' },
  { value: 'consumible', label: 'Consumible' },
  { value: 'otro', label: 'Otro' },
];

const UNITS = [
  { value: 'unidad', label: 'Unidad' },
  { value: 'par', label: 'Par' },
  { value: 'juego', label: 'Juego' },
  { value: 'litro', label: 'Litro' },
  { value: 'kg', label: 'Kg' },
  { value: 'metro', label: 'Metro' },
];

export default function SparePartForm({ part, onSave, onCancel, isLoading }) {
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    category: 'mecanico',
    unit: 'unidad',
    stock_actual: 0,
    stock_minimo: 1,
    stock_maximo: '',
    ubicacion: '',
    proveedor: '',
    precio_unitario: '',
    compatible_con: '',
    activo: true,
    ...part,
  });

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-slate-900">
            {part?.id ? 'Editar Repuesto' : 'Nuevo Repuesto'}
          </h2>
          <button onClick={onCancel} className="p-2 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Código *</Label>
              <Input placeholder="REP-001" value={form.code} onChange={e => set('code', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input placeholder="Filtro de aceite" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Textarea placeholder="Descripción del repuesto..." value={form.description} onChange={e => set('description', e.target.value)} className="h-20" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select value={form.category} onValueChange={v => set('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Unidad</Label>
              <Select value={form.unit} onValueChange={v => set('unit', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Stock actual</Label>
              <Input type="number" min="0" value={form.stock_actual} onChange={e => set('stock_actual', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Stock mínimo</Label>
              <Input type="number" min="0" value={form.stock_minimo} onChange={e => set('stock_minimo', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Stock máximo</Label>
              <Input type="number" min="0" value={form.stock_maximo} onChange={e => set('stock_maximo', Number(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Ubicación</Label>
              <Input placeholder="Bodega A, Estante 3" value={form.ubicacion} onChange={e => set('ubicacion', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Proveedor</Label>
              <Input placeholder="Proveedor SA" value={form.proveedor} onChange={e => set('proveedor', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Precio unitario (CLP)</Label>
              <Input type="number" min="0" placeholder="15000" value={form.precio_unitario} onChange={e => set('precio_unitario', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Compatible con</Label>
              <Input placeholder="Camión 730E, Excavadora PC8000" value={form.compatible_con} onChange={e => set('compatible_con', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button
            disabled={!form.code || !form.name || isLoading}
            onClick={() => onSave(form)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  );
}