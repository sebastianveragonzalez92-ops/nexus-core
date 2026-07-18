import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronDown, Tag, Flag, CircleDot, Type, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

function slugify(str) {
  return str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const SECTIONS = [
  { key: 'categories', label: 'Categorías', icon: Tag, hint: 'Tipos de tickets que se pueden crear' },
  { key: 'priorities', label: 'Prioridades', icon: Flag, hint: 'Niveles de urgencia', hasColor: true },
  { key: 'statuses', label: 'Estados', icon: CircleDot, hint: 'Estados del ciclo de vida del ticket', hasColor: true, hasDot: true },
  { key: 'tipos', label: 'Tipos', icon: Type, hint: 'Clasificación del ticket' },
  { key: 'soluciones', label: 'Soluciones', icon: CheckCircle, hint: 'Tipos de resolución' },
];

const DEFAULT_COLORS = [
  'bg-slate-100 text-slate-600',
  'bg-blue-100 text-blue-700',
  'bg-orange-100 text-orange-700',
  'bg-red-100 text-red-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-yellow-100 text-yellow-700',
  'bg-pink-100 text-pink-700',
];

const DEFAULT_DOTS = ['bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-slate-400', 'bg-orange-500', 'bg-red-500'];

function OptionRow({ option, onChange, onRemove, hasColor, hasDot }) {
  return (
    <div className="flex items-center gap-2">
      <Input
        value={option.label}
        onChange={e => onChange({ ...option, label: e.target.value, value: slugify(e.target.value) })}
        placeholder="Ej: Soporte Técnico"
        className="flex-1 h-8 text-sm"
      />
      {hasColor && (
        <select
          value={option.color || DEFAULT_COLORS[0]}
          onChange={e => onChange({ ...option, color: e.target.value })}
          className="h-8 text-xs border border-slate-200 rounded-md bg-white px-1"
        >
          {DEFAULT_COLORS.map((c, i) => <option key={i} value={c}>{c.includes('red') ? '🔴' : c.includes('orange') ? '🟠' : c.includes('green') ? '🟢' : c.includes('blue') ? '🔵' : c.includes('purple') ? '🟣' : c.includes('yellow') ? '🟡' : '⚪'} Color {i + 1}</option>)}
        </select>
      )}
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={onRemove}>
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

function ConfigSection({ section, items, onAdd, onChange, onRemove }) {
  const [open, setOpen] = useState(true);
  const Icon = section.icon;
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-indigo-500" />
          <span className="font-medium text-sm text-slate-700">{section.label}</span>
          <span className="text-xs text-slate-400">({items?.length || 0})</span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="p-4 space-y-2">
          <p className="text-xs text-slate-400 mb-2">{section.hint}</p>
          {items?.map((opt, idx) => (
            <OptionRow
              key={idx}
              option={opt}
              hasColor={section.hasColor}
              hasDot={section.hasDot}
              onChange={(updated) => onChange(idx, updated)}
              onRemove={() => onRemove(idx)}
            />
          ))}
          <Button type="button" variant="outline" size="sm" className="w-full border-dashed mt-2" onClick={onAdd}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Agregar
          </Button>
        </div>
      )}
    </div>
  );
}

export default function TicketConfigSection({ config, onChange }) {
  const update = (key, items) => onChange({ ...config, [key]: items });

  const add = (key) => {
    const section = SECTIONS.find(s => s.key === key);
    const newOpt = { value: `nuevo-${Date.now()}`, label: 'Nueva opción' };
    if (section.hasColor) newOpt.color = DEFAULT_COLORS[(config[key]?.length || 0) % DEFAULT_COLORS.length];
    if (section.hasDot) newOpt.dot = DEFAULT_DOTS[(config[key]?.length || 0) % DEFAULT_DOTS.length];
    update(key, [...(config[key] || []), newOpt]);
  };

  const change = (key, idx, updated) => {
    const items = [...(config[key] || [])];
    items[idx] = updated;
    update(key, items);
  };

  const remove = (key, idx) => {
    const items = (config[key] || []).filter((_, i) => i !== idx);
    update(key, items);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Flag className="w-4 h-4 text-indigo-600" />
        <Label className="text-sm font-semibold text-slate-700">Configuración de Tickets</Label>
      </div>
      <p className="text-xs text-slate-500 -mt-2">
        Personaliza las categorías, prioridades, estados y tipos que tu empresa usará para sus tickets. Puedes editar esto más tarde.
      </p>
      {SECTIONS.map(section => (
        <ConfigSection
          key={section.key}
          section={section}
          items={config[section.key]}
          onAdd={() => add(section.key)}
          onChange={(idx, updated) => change(section.key, idx, updated)}
          onRemove={(idx) => remove(section.key, idx)}
        />
      ))}
    </div>
  );
}