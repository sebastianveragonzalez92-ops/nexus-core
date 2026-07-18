import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save, Loader2, Settings, Palette } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { DEFAULT_TICKET_CONFIG } from '@/lib/ticketConfigDefaults';

const SECTIONS = [
  { key: 'categories', title: 'Categorías', hasColor: false },
  { key: 'priorities', title: 'Prioridades', hasColor: true },
  { key: 'statuses', title: 'Estados', hasColor: true, hasDot: true },
  { key: 'tipos', title: 'Tipos de Ticket', hasColor: false },
  { key: 'soluciones', title: 'Tipos de Solución', hasColor: false },
];

export default function ConfiguracionTickets() {
  const { company, user, loading } = useCompany();
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (company) {
      base44.entities.TicketConfig.filter({ company_id: company.id }).then(configs => {
        const raw = configs[0];
        if (raw) {
          setConfig(raw);
        } else {
          setConfig({ company_id: company.id, ...DEFAULT_TICKET_CONFIG });
        }
      });
    } else if (!loading) {
      setConfig({ ...DEFAULT_TICKET_CONFIG });
    }
  }, [company, loading]);

  const slugify = (str) => str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '_');

  const addOption = (section) => {
    setConfig(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), { value: '', label: '', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' }],
    }));
  };

  const updateOption = (section, idx, field, val) => {
    setConfig(prev => {
      const updated = [...prev[section]];
      updated[idx] = { ...updated[idx], [field]: val };
      if (field === 'label' && !updated[idx].value) {
        updated[idx].value = slugify(val);
      }
      return { ...prev, [section]: updated };
    });
  };

  const removeOption = (section, idx) => {
    setConfig(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      if (config.id) {
        await base44.entities.TicketConfig.update(config.id, {
          categories: config.categories,
          priorities: config.priorities,
          statuses: config.statuses,
          tipos: config.tipos,
          soluciones: config.soluciones,
          updated_by_email: user?.email,
        });
      } else {
        await base44.entities.TicketConfig.create({
          company_id: company.id,
          categories: config.categories,
          priorities: config.priorities,
          statuses: config.statuses,
          tipos: config.tipos,
          soluciones: config.soluciones,
          updated_by_email: user?.email,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {}
    setSaving(false);
  };

  if (loading || !config) {
    return <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>;
  }

  if (!company) {
    return (
      <div className="p-6 text-center">
        <Settings className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-slate-700">Sin empresa asignada</h2>
        <p className="text-sm text-slate-500 mt-1">Debes pertenecer a una empresa para configurar sus tickets.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Settings className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Configuración de Tickets</h1>
            <p className="text-sm text-slate-500">{company.name} — personaliza las opciones de tus tickets</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? '¡Guardado!' : 'Guardar'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SECTIONS.map(section => (
          <div key={section.key} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">{section.title}</h2>
              <button type="button" onClick={() => addOption(section.key)}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>
            <div className="p-4 space-y-2">
              {(config[section.key] || []).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {section.hasColor && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Palette className="w-3.5 h-3.5 text-slate-300" />
                      <input
                        type="text"
                        value={opt.color || ''}
                        onChange={e => updateOption(section.key, idx, 'color', e.target.value)}
                        className="w-24 text-xs border border-slate-200 rounded px-1.5 py-1"
                        placeholder="bg-blue-100 text-blue-700"
                      />
                    </div>
                  )}
                  <Input
                    value={opt.label}
                    onChange={e => updateOption(section.key, idx, 'label', e.target.value)}
                    placeholder="Etiqueta visible"
                    className="flex-1 h-8 text-sm"
                  />
                  <Input
                    value={opt.value}
                    onChange={e => updateOption(section.key, idx, 'value', e.target.value)}
                    placeholder="valor"
                    className="w-24 h-8 text-xs"
                  />
                  <button type="button" onClick={() => removeOption(section.key, idx)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {(!config[section.key] || config[section.key].length === 0) && (
                <p className="text-xs text-slate-400 text-center py-4">Sin opciones. Haz clic en "Agregar".</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}