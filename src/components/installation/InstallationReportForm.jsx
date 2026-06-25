import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Upload, Trash2, Camera } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const DEFAULT_COMPONENTES_FMS = [
  { descripcion: 'DISPLAY DS9', cantidad: '1 unidad', instalado: false },
  { descripcion: 'CABLE POWER DISPLAY', cantidad: '1 unidad', instalado: false },
  { descripcion: 'CABLE POWER CORE', cantidad: '1 unidad', instalado: false },
  { descripcion: 'CABLE ETHERNET M12/M12', cantidad: '1 unidad', instalado: false },
  { descripcion: 'CABLE ETHERNET M12/RJ45', cantidad: '1 unidad', instalado: false },
  { descripcion: 'ANTENNA G3 L1 GPS+GLONASS', cantidad: '1 unidad', instalado: false },
  { descripcion: 'BRACKET DE MONTAJE ESTANDAR GPS', cantidad: '1 unidad', instalado: false },
  { descripcion: 'BRACKET DE MONTAJE ESTANDAR CORE', cantidad: '1 unidad', instalado: false },
  { descripcion: 'SAR-HM 7705 NOKIA', cantidad: '1 unidad', instalado: false },
  { descripcion: 'ENCLOUSER NOKIA', cantidad: '1 unidad', instalado: false },
];

const DEFAULT_COMPONENTES_CAS = [
  { descripcion: 'DISPLAY QD200', cantidad: '1 unidad', instalado: false },
  { descripcion: 'UNIDAD QC1000', cantidad: '1 unidad', instalado: false },
  { descripcion: 'CABLE DISPLAY QD222', cantidad: '1 unidad', instalado: false },
  { descripcion: 'HARNES DE CONECCION QM1110', cantidad: '1 unidad', instalado: false },
  { descripcion: 'CABLE ANTENA SMART ANGULO 5 MTS QM1105', cantidad: '1 unidad', instalado: false },
  { descripcion: 'CABLE DE ANTENA SMART RECTO 5 MTS QM1106', cantidad: '1 unidad', instalado: false },
];

export default function InstallationReportForm({ report, defaultType, user, onSubmit, onCancel, isLoading }) {
  const isEdit = !!report;

  const [form, setForm] = useState({
    tipo: report?.tipo || defaultType || 'preinstalacion',
    estado: report?.estado || 'borrador',
    fecha: report?.fecha || new Date().toISOString().slice(0, 10),
    realizado_por: report?.realizado_por || user?.full_name || '',
    validado_por: report?.validado_por || '',
    cliente: report?.cliente || '',
    empresa: report?.empresa || '',
    division: report?.division || '',
    objetivo: report?.objetivo || '',
    equipo_marca: report?.equipo_marca || '',
    equipo_modelo: report?.equipo_modelo || '',
    equipo_numero: report?.equipo_numero || '',
    foto_frontal_url: report?.foto_frontal_url || '',
    series_core: report?.series_core || '',
    series_core_hp: report?.series_core_hp || '',
    series_display: report?.series_display || '',
    series_gps: report?.series_gps || '',
    series_qd200: report?.series_qd200 || '',
    series_qc1000: report?.series_qc1000 || '',
    series_lte_sar: report?.series_lte_sar || '',
    instalacion_palas: report?.instalacion_palas || {
      segunda_smart_antenna: false,
      segundo_junction_harness: false,
      ethernet_switch_qx1120: false,
      ethernet_harness_qm1113: false,
      adaptador_qm1114: false,
    },
    componentes_fms: report?.componentes_fms?.length ? report.componentes_fms : DEFAULT_COMPONENTES_FMS.map(c => ({ ...c })),
    componentes_cas: report?.componentes_cas?.length ? report.componentes_cas : DEFAULT_COMPONENTES_CAS.map(c => ({ ...c })),
    fotos: report?.fotos || [],
    conexion_electrica: report?.conexion_electrica || '',
    observaciones: report?.observaciones || '',
    aprobacion_cliente_nombre: report?.aprobacion_cliente_nombre || '',
    aprobacion_cliente_cargo: report?.aprobacion_cliente_cargo || '',
    aprobacion_cliente_compania: report?.aprobacion_cliente_compania || '',
    aprobacion_proveedor_nombre: report?.aprobacion_proveedor_nombre || '',
    aprobacion_proveedor_cargo: report?.aprobacion_proveedor_cargo || '',
    aprobacion_proveedor_compania: report?.aprobacion_proveedor_compania || '',
  });

  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [uploadingFrontal, setUploadingFrontal] = useState(false);
  const [newFotoLabel, setNewFotoLabel] = useState('');
  const fotoInputRef = useRef(null);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const handleFrontalUpload = async (file) => {
    setUploadingFrontal(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('foto_frontal_url', file_url);
    setUploadingFrontal(false);
  };

  const handleFotoUpload = async (file) => {
    setUploadingFoto(true);
    const label = newFotoLabel.trim() || `Foto ${form.fotos.length + 1}`;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('fotos', [...form.fotos, { label, url: file_url, descripcion: '' }]);
    setNewFotoLabel('');
    setUploadingFoto(false);
  };

  const removeFoto = (idx) => set('fotos', form.fotos.filter((_, i) => i !== idx));

  const toggleComponente = (type, idx) => {
    const key = type === 'fms' ? 'componentes_fms' : 'componentes_cas';
    const updated = [...form[key]];
    updated[idx] = { ...updated[idx], instalado: !updated[idx].instalado };
    set(key, updated);
  };

  const isPost = form.tipo === 'postinstalacion';

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isEdit ? 'Editar Informe' : (isPost ? 'Nuevo Informe de Post-instalación' : 'Nuevo Informe de Pre-instalación')}
          </h1>
          <p className="text-sm text-slate-500">Sistema CAS + FMS + LTE</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Info General */}
        <Section title="Información General">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Tipo de Informe">
              <Select value={form.tipo} onValueChange={v => set('tipo', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="preinstalacion">Pre-instalación</SelectItem>
                  <SelectItem value="postinstalacion">Post-instalación</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Estado">
              <Select value={form.estado} onValueChange={v => set('estado', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="aprobado">Aprobado</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Fecha *">
              <Input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} required />
            </Field>
            <Field label="Realizado por">
              <Input value={form.realizado_por} onChange={e => set('realizado_por', e.target.value)} placeholder="Nombre del técnico" />
            </Field>
            <Field label="Validado por">
              <Input value={form.validado_por} onChange={e => set('validado_por', e.target.value)} placeholder="Nombre del validador" />
            </Field>
            <Field label="Cliente">
              <Input value={form.cliente} onChange={e => set('cliente', e.target.value)} placeholder="Nombre del cliente" />
            </Field>
            <Field label="Empresa / Faena">
              <Input value={form.empresa} onChange={e => set('empresa', e.target.value)} placeholder="ej: Codelco División Ministro Hales" />
            </Field>
            <Field label="División">
              <Input value={form.division} onChange={e => set('division', e.target.value)} placeholder="División" />
            </Field>
          </div>
          <Field label="Objetivo">
            <Textarea value={form.objetivo} onChange={e => set('objetivo', e.target.value)} rows={2} placeholder="Objetivo general del informe..." />
          </Field>
        </Section>

        {/* Datos del Equipo */}
        <Section title="Datos del Equipo">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Marca">
              <Input value={form.equipo_marca} onChange={e => set('equipo_marca', e.target.value)} placeholder="ej: Caterpillar" />
            </Field>
            <Field label="Modelo">
              <Input value={form.equipo_modelo} onChange={e => set('equipo_modelo', e.target.value)} placeholder="ej: 798AC" />
            </Field>
            <Field label="Número de Equipo *">
              <Input value={form.equipo_numero} onChange={e => set('equipo_numero', e.target.value)} placeholder="ej: C340" required />
            </Field>
          </div>
          <div className="mt-4">
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Foto Frontal del Equipo</Label>
            {form.foto_frontal_url ? (
              <div className="relative inline-block">
                <img src={form.foto_frontal_url} alt="Frontal" className="h-40 rounded-lg border object-cover" />
                <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 bg-white/80 h-6 w-6" onClick={() => set('foto_frontal_url', '')}>
                  <Trash2 className="w-3 h-3 text-red-500" />
                </Button>
              </div>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-slate-200 rounded-lg p-4 hover:border-teal-300 transition-colors w-fit">
                <Camera className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-500">{uploadingFrontal ? 'Subiendo...' : 'Subir foto frontal'}</span>
                <input type="file" accept="image/*" className="hidden" disabled={uploadingFrontal}
                  onChange={e => e.target.files?.[0] && handleFrontalUpload(e.target.files[0])} />
              </label>
            )}
          </div>
        </Section>

        {/* Números de Serie (solo Post) */}
        {isPost && (
          <Section title="Números de Serie — Componentes Instalados">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Core LP"><Input value={form.series_core} onChange={e => set('series_core', e.target.value)} placeholder="N° Serie" /></Field>
              <Field label="Core HP (Palas/Perforadoras)"><Input value={form.series_core_hp} onChange={e => set('series_core_hp', e.target.value)} placeholder="N° Serie (si aplica)" /></Field>
              <Field label='SMARTSCREEN 9" / 12"'><Input value={form.series_display} onChange={e => set('series_display', e.target.value)} placeholder="N° Serie" /></Field>
              <Field label="GPS"><Input value={form.series_gps} onChange={e => set('series_gps', e.target.value)} placeholder="N° Serie" /></Field>
              <Field label="QD1400/QD200"><Input value={form.series_qd200} onChange={e => set('series_qd200', e.target.value)} placeholder="N° Serie" /></Field>
              <Field label="QC1000"><Input value={form.series_qc1000} onChange={e => set('series_qc1000', e.target.value)} placeholder="N° Serie" /></Field>
              <Field label="LTE SAR"><Input value={form.series_lte_sar} onChange={e => set('series_lte_sar', e.target.value)} placeholder="N° Serie" /></Field>
            </div>
          </Section>
        )}

        {/* Instalación adicional para Palas */}
        <Section title="Instalación Adicional para Palas (si aplica)">
          <p className="text-xs text-slate-500 mb-3">Marque los ítems instalados en equipos tipo Pala.</p>
          <div className="space-y-2">
            {[
              { key: 'segunda_smart_antenna', label: 'Instalar la segunda Smart Antenna (beacon) en el boom/body de la pala.' },
              { key: 'segundo_junction_harness', label: 'Conectar el segundo Junction Harness (QM1110).' },
              { key: 'ethernet_switch_qx1120', label: 'Instalar el Ethernet Switch (QX1120) para combinar ambas antenas en la misma red.' },
              { key: 'ethernet_harness_qm1113', label: 'Conectar el cable Ethernet Harness (QM1113) entre ambos Junction Harness y el switch.' },
              { key: 'adaptador_qm1114', label: 'Usar el adaptador QM1114 (M8 a M12) para conectar la segunda antena al switch.' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-start gap-2 text-sm cursor-pointer hover:bg-slate-50 rounded px-2 py-1.5">
                <input
                  type="checkbox"
                  checked={!!form.instalacion_palas?.[key]}
                  onChange={() => set('instalacion_palas', { ...form.instalacion_palas, [key]: !form.instalacion_palas?.[key] })}
                  className="rounded mt-0.5"
                />
                <span className={form.instalacion_palas?.[key] ? 'text-green-700 font-medium' : 'text-slate-600'}>{label}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* Componentes */}
        <Section title="Componentes del Sistema">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-teal-700 mb-3 bg-teal-50 px-3 py-1.5 rounded-lg">Sistema FMS</h4>
              <div className="space-y-2">
                {form.componentes_fms.map((c, i) => (
                  <label key={i} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 rounded px-2 py-1">
                    <input type="checkbox" checked={c.instalado} onChange={() => toggleComponente('fms', i)} className="rounded" />
                    <span className={`flex-1 ${c.instalado ? 'text-green-700 font-medium' : 'text-slate-600'}`}>{c.descripcion}</span>
                    <span className="text-xs text-slate-400">{c.cantidad}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-700 mb-3 bg-blue-50 px-3 py-1.5 rounded-lg">Sistema CAS</h4>
              <div className="space-y-2">
                {form.componentes_cas.map((c, i) => (
                  <label key={i} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 rounded px-2 py-1">
                    <input type="checkbox" checked={c.instalado} onChange={() => toggleComponente('cas', i)} className="rounded" />
                    <span className={`flex-1 ${c.instalado ? 'text-green-700 font-medium' : 'text-slate-600'}`}>{c.descripcion}</span>
                    <span className="text-xs text-slate-400">{c.cantidad}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Registro Fotográfico */}
        <Section title="Registro Fotográfico">
          <div className="mb-4 flex gap-2 items-center">
            <Input
              value={newFotoLabel}
              onChange={e => setNewFotoLabel(e.target.value)}
              placeholder="Etiqueta (ej: QC1000 y GPS, Antena LTE, Cabina...)"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={uploadingFoto}
              onClick={() => fotoInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              {uploadingFoto ? 'Subiendo...' : 'Subir Foto'}
            </Button>
            <input
              ref={fotoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingFoto}
              onChange={e => { if (e.target.files?.[0]) handleFotoUpload(e.target.files[0]); e.target.value = ''; }}
            />
          </div>
          {form.fotos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {form.fotos.map((foto, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border border-slate-200">
                  <img src={foto.url} alt={foto.label} className="w-full h-32 object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                    <p className="text-white text-xs font-medium truncate">{foto.label}</p>
                  </div>
                  <button type="button" onClick={() => removeFoto(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Conexión y Observaciones */}
        <Section title="Conexión Eléctrica y Observaciones">
          <Field label="Detalles de Conexión Eléctrica">
            <Textarea value={form.conexion_electrica} onChange={e => set('conexion_electrica', e.target.value)} rows={3}
              placeholder="Describe la conexión eléctrica del sistema (punto batería, chapa, reversa...)" />
          </Field>
          <Field label="Observaciones Generales">
            <Textarea value={form.observaciones} onChange={e => set('observaciones', e.target.value)} rows={3}
              placeholder="Observaciones adicionales..." />
          </Field>
        </Section>

        {/* Aprobación */}
        <Section title="Aprobación">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2">Cliente</h4>
              <div className="space-y-3">
                <Field label="Nombre"><Input value={form.aprobacion_cliente_nombre} onChange={e => set('aprobacion_cliente_nombre', e.target.value)} placeholder="Nombre" /></Field>
                <Field label="Cargo"><Input value={form.aprobacion_cliente_cargo} onChange={e => set('aprobacion_cliente_cargo', e.target.value)} placeholder="Cargo" /></Field>
                <Field label="Compañía"><Input value={form.aprobacion_cliente_compania} onChange={e => set('aprobacion_cliente_compania', e.target.value)} placeholder="Compañía" /></Field>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2">Proveedor (Hexagon)</h4>
              <div className="space-y-3">
                <Field label="Nombre"><Input value={form.aprobacion_proveedor_nombre} onChange={e => set('aprobacion_proveedor_nombre', e.target.value)} placeholder="Nombre" /></Field>
                <Field label="Cargo"><Input value={form.aprobacion_proveedor_cargo} onChange={e => set('aprobacion_proveedor_cargo', e.target.value)} placeholder="Cargo" /></Field>
                <Field label="Compañía"><Input value={form.aprobacion_proveedor_compania} onChange={e => set('aprobacion_proveedor_compania', e.target.value)} placeholder="Compañía" /></Field>
              </div>
            </div>
          </div>
        </Section>

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading} className="gap-2 bg-teal-600 hover:bg-teal-700">
            {isLoading ? 'Guardando...' : (isEdit ? 'Actualizar Informe' : 'Guardar Informe')}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <Label className="text-sm text-slate-600 mb-1 block">{label}</Label>
      {children}
    </div>
  );
}