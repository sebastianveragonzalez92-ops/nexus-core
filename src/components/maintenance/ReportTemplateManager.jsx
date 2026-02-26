import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Star, StarOff, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY = {
  name: '',
  company_name: '',
  company_logo_url: '',
  division: '',
  document_code: '',
  report_title: 'MineProtect CAS10 FMS - Mantención Equipos Pesados',
  header_color: '#2563eb',
  is_default: false
};

export default function ReportTemplateManager() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const { data: templates = [] } = useQuery({
    queryKey: ['reportTemplates'],
    queryFn: () => base44.entities.ReportTemplate.list('-created_date', 50)
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editing) return base44.entities.ReportTemplate.update(editing.id, data);
      return base44.entities.ReportTemplate.create(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reportTemplates'] });
      setOpen(false);
      toast.success('Plantilla guardada');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ReportTemplate.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reportTemplates'] });
      toast.success('Plantilla eliminada');
    }
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (template) => {
      // Unset all defaults first, then set this one
      await Promise.all(templates.map(t => base44.entities.ReportTemplate.update(t.id, { is_default: false })));
      return base44.entities.ReportTemplate.update(template.id, { is_default: true });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reportTemplates'] });
      toast.success('Plantilla predeterminada actualizada');
    }
  });

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({ ...t });
    setOpen(true);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, company_logo_url: file_url }));
    setUploadingLogo(false);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Plantillas de Informe</h2>
          <p className="text-sm text-slate-500">Personaliza el encabezado y datos del PDF generado</p>
        </div>
        <Button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" /> Nueva Plantilla
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-400 mb-3">Sin plantillas creadas</p>
          <Button onClick={openNew} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" /> Crear Plantilla
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {templates.map(t => (
            <Card key={t.id} className="border border-slate-200">
              <CardContent className="p-4 flex items-center gap-4">
                {t.company_logo_url ? (
                  <img src={t.company_logo_url} alt="Logo" className="w-14 h-10 object-contain border border-slate-100 rounded-lg bg-white p-1" />
                ) : (
                  <div className="w-14 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: t.header_color || '#2563eb' }}>
                    {t.company_name?.charAt(0) || 'E'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{t.name}</p>
                    {t.is_default && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Predeterminada</span>}
                  </div>
                  <p className="text-sm text-slate-500 truncate">{t.report_title}</p>
                  {t.company_name && <p className="text-xs text-slate-400">{t.company_name} {t.division && `· ${t.division}`} {t.document_code && `· ${t.document_code}`}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => setDefaultMutation.mutate(t)} title="Hacer predeterminada">
                    {t.is_default ? <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" /> : <StarOff className="w-4 h-4 text-slate-400" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="w-4 h-4 text-slate-500" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(t.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Plantilla' : 'Nueva Plantilla'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Preview */}
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <div className="flex items-center justify-between p-3" style={{ background: form.header_color || '#2563eb' }}>
                {form.company_logo_url ? (
                  <img src={form.company_logo_url} alt="Logo" className="h-10 object-contain bg-white rounded p-1 max-w-[100px]" />
                ) : (
                  <span className="text-white font-bold text-lg">{form.company_name || 'Empresa'}</span>
                )}
                <div className="text-right text-xs text-white opacity-90">
                  <div>{form.division || 'División'}</div>
                  <div>{form.document_code || 'Código'}</div>
                </div>
              </div>
              <div className="bg-white px-3 py-2 border-t border-slate-100">
                <p className="text-sm font-semibold text-blue-600">{form.report_title || 'Título del informe'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label>Nombre de la plantilla *</Label>
                <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej: Plantilla Codelco Norte" className="mt-1" />
              </div>
              <div>
                <Label>Título del informe *</Label>
                <Input value={form.report_title} onChange={e => set('report_title', e.target.value)} placeholder="MineProtect CAS10 FMS..." className="mt-1" />
              </div>
              <div>
                <Label>Nombre de empresa</Label>
                <Input value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="HEXAGON" className="mt-1" />
              </div>
              <div>
                <Label>Logo de empresa</Label>
                <div className="flex items-center gap-2 mt-1">
                  {form.company_logo_url && <img src={form.company_logo_url} alt="logo" className="h-10 w-20 object-contain border rounded bg-white p-1" />}
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <span>{uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} {uploadingLogo ? 'Subiendo...' : 'Subir Logo'}</span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  {form.company_logo_url && <Button variant="ghost" size="sm" onClick={() => set('company_logo_url', '')}>Quitar</Button>}
                </div>
              </div>
              <div>
                <Label>División</Label>
                <Input value={form.division} onChange={e => set('division', e.target.value)} placeholder="División Codelco Norte" className="mt-1" />
              </div>
              <div>
                <Label>Código de documento</Label>
                <Input value={form.document_code} onChange={e => set('document_code', e.target.value)} placeholder="GOS-CN-INF-09 Rev.0" className="mt-1" />
              </div>
              <div>
                <Label>Color del encabezado</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={form.header_color || '#2563eb'} onChange={e => set('header_color', e.target.value)} className="h-9 w-14 rounded border border-slate-200 cursor-pointer" />
                  <Input value={form.header_color} onChange={e => set('header_color', e.target.value)} className="w-32" placeholder="#2563eb" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={!form.name || !form.report_title || saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}