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
import PhotoCapture from './PhotoCapture';
import SignaturePad from './SignaturePad';
import GPSLocation from './GPSLocation';

const defaultForm = {
  type: 'preventivo',
  title: '',
  report_date: new Date().toISOString().split('T')[0],
  asset_id: '',
  description: '',
  work_performed: '',
  findings: '',
  recommendations: '',
  photos: [],
  signature_url: null,
  location: null,
  status: 'borrador'
};

export default function MaintenanceReportForm({ assets = [], onClose, reportType = 'preventivo' }) {
  const [form, setForm] = useState({ ...defaultForm, type: reportType });
  const queryClient = useQueryClient();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const { mutate: saveReport, isPending } = useMutation({
    mutationFn: async (status) => {
      let signatureUrl = form.signature_url;
      // If signature is base64, upload it
      if (signatureUrl && signatureUrl.startsWith('data:')) {
        const blob = await (await fetch(signatureUrl)).blob();
        const file = new File([blob], 'firma.png', { type: 'image/png' });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        signatureUrl = file_url;
      }
      return base44.entities.MaintenanceReport.create({ ...form, signature_url: signatureUrl, status });
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
      {/* Info básica */}
      <Card>
        <CardHeader><CardTitle className="text-base">Información General</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo *</Label>
              <Select value={form.type} onValueChange={v => set('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventivo">Preventivo</SelectItem>
                  <SelectItem value="correctivo">Correctivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fecha *</Label>
              <Input type="date" value={form.report_date} onChange={e => set('report_date', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Título del Informe *</Label>
            <Input placeholder="Ej: Mantención preventiva bomba centrífuga" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Activo</Label>
            <Select value={form.asset_id} onValueChange={v => set('asset_id', v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar activo..." /></SelectTrigger>
              <SelectContent>
                {assets.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name} ({a.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Textarea placeholder="Describe el trabajo a realizar o realizado..." rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Trabajo realizado */}
      <Card>
        <CardHeader><CardTitle className="text-base">Detalle del Trabajo</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Trabajo Realizado</Label>
            <Textarea placeholder="Describe en detalle el trabajo realizado..." rows={4} value={form.work_performed} onChange={e => set('work_performed', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Hallazgos y Observaciones</Label>
            <Textarea placeholder="Hallazgos importantes durante la inspección..." rows={3} value={form.findings} onChange={e => set('findings', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Recomendaciones</Label>
            <Textarea placeholder="Recomendaciones para el próximo mantenimiento..." rows={3} value={form.recommendations} onChange={e => set('recommendations', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Fotos */}
      <Card>
        <CardHeader><CardTitle className="text-base">Evidencia Fotográfica</CardTitle></CardHeader>
        <CardContent>
          <PhotoCapture photos={form.photos} onPhotosChange={v => set('photos', v)} />
        </CardContent>
      </Card>

      {/* GPS */}
      <Card>
        <CardHeader><CardTitle className="text-base">Ubicación GPS</CardTitle></CardHeader>
        <CardContent>
          <GPSLocation location={form.location} onLocationChange={v => set('location', v)} />
        </CardContent>
      </Card>

      {/* Firma */}
      <Card>
        <CardHeader><CardTitle className="text-base">Firma Digital</CardTitle></CardHeader>
        <CardContent>
          <SignaturePad onSave={v => set('signature_url', v)} />
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="outline" onClick={() => saveReport('borrador')} disabled={isPending || !form.title}>
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Guardar borrador
        </Button>
        <Button onClick={() => saveReport('enviado')} disabled={isPending || !form.title} className="bg-indigo-600 hover:bg-indigo-700">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          Enviar informe
        </Button>
      </div>
    </div>
  );
}