import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Loader2, CheckCircle2, Upload, Settings2 } from 'lucide-react';
import { DEFAULT_TICKET_CONFIG } from '@/lib/ticketConfigDefaults';
import { useCompany } from '@/hooks/useCompany';
import TicketConfigSection from '@/components/tickets/TicketConfigSection';

const INDUSTRIES = ['Minería', 'Construcción', 'Manufactura', 'Salud', 'Energía', 'Transporte', 'Agricultura', 'Retail', 'Tecnología', 'Otra'];

function slugify(str) {
  return str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function RegistrarEmpresa() {
  const navigate = useNavigate();
  const { user, reload } = useCompany();
  const [form, setForm] = useState({
    name: '',
    slug: '',
    industry: '',
    description: '',
    contact_email: user?.email || '',
    primary_color: '#4f46e5',
  });
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [ticketConfig, setTicketConfig] = useState(DEFAULT_TICKET_CONFIG);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleLogo = async (file) => {
    setUploadingLogo(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setLogoUrl(file_url);
    setUploadingLogo(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const slug = form.slug || slugify(form.name);
    if (!form.name || !slug) {
      setError('El nombre de la empresa es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      const company = await base44.entities.Company.create({
        name: form.name,
        slug,
        industry: form.industry,
        description: form.description,
        contact_email: form.contact_email,
        primary_color: form.primary_color,
        logo_url: logoUrl,
        created_by_email: user?.email,
        status: 'activa',
        plan: 'free',
      });
      await base44.entities.TicketConfig.create({
        company_id: company.id,
        ...ticketConfig,
        updated_by_email: user?.email,
      });
      await base44.auth.updateMe({ company_id: company.id });
      await reload();
      setDone(true);
      setTimeout(() => navigate('/Tickets'), 1200);
    } catch (err) {
      setError(err?.message || 'No se pudo registrar la empresa. Es posible que el identificador ya exista.');
    }
    setSaving(false);
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900">¡Empresa registrada!</h2>
        <p className="text-slate-500 mt-1">Redirigiendo a tus tickets...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Registrar Empresa</h1>
          <p className="text-sm text-slate-500">Crea el espacio de trabajo de tickets para tu organización</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        {/* Logo */}
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <div className="relative">
              <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-xl border object-contain p-1" />
              <button type="button" onClick={() => setLogoUrl('')} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs">×</button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 cursor-pointer hover:border-indigo-300">
              {uploadingLogo ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : <Upload className="w-5 h-5 text-slate-400" />}
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleLogo(e.target.files[0])} />
            </label>
          )}
          <div>
            <p className="text-sm font-medium text-slate-700">Logo de la empresa</p>
            <p className="text-xs text-slate-400">Opcional — se mostrará en el panel</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-slate-600 mb-1 block">Nombre de la empresa *</Label>
            <Input value={form.name} onChange={e => {
              set('name', e.target.value);
              set('slug', slugify(e.target.value));
            }} placeholder="ej: Acme Mining" required />
          </div>
          <div>
            <Label className="text-sm text-slate-600 mb-1 block">Identificador</Label>
            <Input value={form.slug} onChange={e => set('slug', slugify(e.target.value))} placeholder="acme-mining" />
          </div>
          <div>
            <Label className="text-sm text-slate-600 mb-1 block">Industria</Label>
            <Select value={form.industry} onValueChange={v => set('industry', v)}>
              <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm text-slate-600 mb-1 block">Email de contacto</Label>
            <Input value={form.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder="contacto@empresa.com" />
          </div>
        </div>

        <div>
          <Label className="text-sm text-slate-600 mb-1 block">Descripción</Label>
          <Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Breve descripción de la empresa..." />
        </div>

        <div>
          <Label className="text-sm text-slate-600 mb-1 block">Color de marca</Label>
          <div className="flex items-center gap-3">
            <input type="color" value={form.primary_color} onChange={e => set('primary_color', e.target.value)} className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer" />
            <Input value={form.primary_color} onChange={e => set('primary_color', e.target.value)} className="w-32" />
          </div>
        </div>

        {/* Ticket Config */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-700">Personaliza tus Tickets</h3>
          </div>
          <TicketConfigSection config={ticketConfig} onChange={setTicketConfig} />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <Button type="submit" disabled={saving || uploadingLogo} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</> : 'Registrar empresa'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/Tickets')}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}