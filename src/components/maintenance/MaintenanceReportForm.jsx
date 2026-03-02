import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, Save } from 'lucide-react';
import { toast } from 'sonner';
import GPSLocation from './GPSLocation';
import ComponentChecklist from './ComponentChecklist';
import LabeledPhotoCapture from './LabeledPhotoCapture';

const defaultForm = {
  type: 'preventivo',
  report_date: new Date().toISOString().split('T')[0],
  empresa: '',
  division: '',
  tipo_equipo: '',
  numero_interno_equipo: '',
  fecha_proxima_mantencion: '',
  hora_inicio: '',
  hora_fin: '',
  responsable: '',
  cas_series: { antena_qc1000: '', pantalla_qd1400: '' },
  fms_series: { core_lp: '', pantalla: '', gps1: '' },
  componentes_pre: {},
  componentes_post: {},
  photo_entries: [],
  signature_url: 'auto',
  location: null,
  observations: '',
  status: 'borrador'
};

export default function MaintenanceReportForm({ assets = [], onClose, reportType = 'preventivo' }) {
  const [form, setForm] = useState({ ...defaultForm, type: reportType });
  const queryClient = useQueryClient();

  const set = (key, val) => {
    setForm(f => {
      const updated = { ...f, [key]: val };
      if (key === 'report_date' && val) {
        const d = new Date(val);
        d.setMonth(d.getMonth() + 3);
        updated.fecha_proxima_mantencion = d.toISOString().split('T')[0];
      }
      return updated;
    });
  };
  const setNested = (key, sub, val) => setForm(f => ({ ...f, [key]: { ...f[key], [sub]: val } }));

  const { mutate: saveReport, isPending } = useMutation({
    mutationFn: async (status) => {
      const user = await base44.auth.me();
      const autoSignature = `${user?.full_name || user?.email || 'Responsable'} — ${new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}`;
      const title = `${form.tipo_equipo || form.type} - ${form.numero_interno_equipo || ''} - ${form.report_date}`.trim();
      return base44.entities.MaintenanceReport.create({ ...form, title, signature_url: autoSignature, status });
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceReports'] });
      toast.success(status === 'enviado' ? 'Informe enviado correctamente' : 'Borrador guardado');
      onClose?.();
    },
    onError: (err) => toast.error(err.message)
  });

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">

      {/* 1. Información general */}
      <Card>
        <CardHeader><CardTitle className="text-base text-blue-600">Información General</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo de mantención *</Label>
              <Select value={form.type} onValueChange={v => set('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventivo">Preventivo</SelectItem>
                  <SelectItem value="correctivo">Correctivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Empresa</Label>
              <Input placeholder="Ej: Codelco" value={form.empresa} onChange={e => set('empresa', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>División</Label>
              <Input placeholder="Ej: Ministro Hales" value={form.division} onChange={e => set('division', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de equipo</Label>
              <Input placeholder="Ej: BULLDOZER" value={form.tipo_equipo} onChange={e => set('tipo_equipo', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>N° interno equipo</Label>
              <Input placeholder="Ej: B408" value={form.numero_interno_equipo} onChange={e => set('numero_interno_equipo', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Fecha mantención *</Label>
              <Input type="date" value={form.report_date} onChange={e => set('report_date', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Fecha próxima mantención <span className="text-slate-400 text-xs">(auto: +3 meses)</span></Label>
              <Input type="date" value={form.fecha_proxima_mantencion} onChange={e => set('fecha_proxima_mantencion', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Hora inicio actividad</Label>
              <Input type="time" value={form.hora_inicio} onChange={e => set('hora_inicio', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Hora finalización actividad</Label>
              <Input type="time" value={form.hora_fin} onChange={e => set('hora_fin', e.target.value)} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Responsable de la actividad</Label>
              <Input placeholder="Nombre completo" value={form.responsable} onChange={e => set('responsable', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. CAS Números de series */}
      <Card>
        <CardHeader><CardTitle className="text-base text-blue-600">CAS Números de Series</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Antena QC1000</Label>
            <Input placeholder="N° de serie" value={form.cas_series.antena_qc1000} onChange={e => setNested('cas_series', 'antena_qc1000', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Pantalla QD1400/QD200</Label>
            <Input placeholder="N° de serie" value={form.cas_series.pantalla_qd1400} onChange={e => setNested('cas_series', 'pantalla_qd1400', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* 3. FMS Números de series */}
      <Card>
        <CardHeader><CardTitle className="text-base text-blue-600">FMS Números de Series</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Core LP</Label>
            <Input placeholder="N° de serie" value={form.fms_series.core_lp} onChange={e => setNested('fms_series', 'core_lp', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Pantalla</Label>
            <Input placeholder="N° de serie" value={form.fms_series.pantalla} onChange={e => setNested('fms_series', 'pantalla', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>GPS 1</Label>
            <Input placeholder="N° de serie" value={form.fms_series.gps1} onChange={e => setNested('fms_series', 'gps1', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* 4. Componentes pre-mantención */}
      <Card>
        <CardHeader><CardTitle className="text-base text-blue-600">Componentes Operativos Pre-mantención</CardTitle></CardHeader>
        <CardContent>
          <ComponentChecklist values={form.componentes_pre} onChange={v => set('componentes_pre', v)} />
        </CardContent>
      </Card>

      {/* 5. Componentes post-mantención */}
      <Card>
        <CardHeader><CardTitle className="text-base text-blue-600">Componentes Operativos Post-mantención</CardTitle></CardHeader>
        <CardContent>
          <ComponentChecklist values={form.componentes_post} onChange={v => set('componentes_post', v)} />
        </CardContent>
      </Card>

      {/* 6. Fotografía de componentes */}
      <Card>
        <CardHeader><CardTitle className="text-base text-blue-600">Fotografía de Componentes</CardTitle></CardHeader>
        <CardContent>
          <LabeledPhotoCapture entries={form.photo_entries} onEntriesChange={v => set('photo_entries', v)} />
        </CardContent>
      </Card>

      {/* 7. GPS */}
      <Card>
        <CardHeader><CardTitle className="text-base text-blue-600">Ubicación GPS</CardTitle></CardHeader>
        <CardContent>
          <GPSLocation location={form.location} onLocationChange={v => set('location', v)} />
        </CardContent>
      </Card>

      {/* 8. Observaciones */}
      <Card>
        <CardHeader><CardTitle className="text-base text-blue-600">Observaciones</CardTitle></CardHeader>
        <CardContent>
          <Textarea placeholder="Observaciones adicionales..." rows={3} value={form.observations} onChange={e => set('observations', e.target.value)} />
        </CardContent>
      </Card>

      {/* 9. Firma */}
      <Card>
        <CardHeader><CardTitle className="text-base text-blue-600">Firma Digital del Responsable</CardTitle></CardHeader>
        <CardContent>
          <SignaturePad onSave={v => set('signature_url', v)} />
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="outline" onClick={() => saveReport('borrador')} disabled={isPending || !form.report_date}>
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Guardar borrador
        </Button>
        <Button onClick={() => saveReport('enviado')} disabled={isPending || !form.report_date} className="bg-indigo-600 hover:bg-indigo-700">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          Enviar informe
        </Button>
      </div>
    </div>
  );
}