import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Copy, CheckCircle2, BarChart3, Database, Code, ChevronRight } from 'lucide-react';

const DATASETS = [
  { key: 'equipment', label: 'Equipos', desc: 'Estado, tipo, empresa, fechas de mantención' },
  { key: 'maintenance_records', label: 'Registros de Mantención', desc: 'Historial completo con costos y horas' },
  { key: 'kpi_values', label: 'Valores KPI', desc: 'Series temporales de todos los indicadores' },
  { key: 'work_orders', label: 'Órdenes de Trabajo', desc: 'OTs con estado, prioridad y costos reales' },
];

export default function PowerBIIntegration({ user }) {
  const [embedUrl, setEmbedUrl] = useState('');
  const [savedEmbedUrl, setSavedEmbedUrl] = useState('');
  const [copied, setCopied] = useState('');
  const [activeStep, setActiveStep] = useState(1);

  const functionBase = `${window.location.origin}/api/functions/powerBIExport`;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const canConfigure = ['admin', 'supervisor'].includes(user?.role);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl">
        <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center shrink-0">
          <BarChart3 className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Integración con Power BI</h2>
          <p className="text-sm text-slate-500 mt-0.5">Conecta Nexus como fuente de datos y embebe reportes de Power BI en tu dashboard</p>
        </div>
        <Badge className="ml-auto bg-yellow-100 text-yellow-700 border-yellow-200">Plan Minería</Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Columna 1: Exportar datos hacia Power BI */}
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-lg text-slate-900">1. Conectar Nexus como fuente de datos</h3>
          </div>

          <div className="space-y-3">
            {[
              { step: 1, text: 'Abre Power BI Desktop → Obtener datos → Web' },
              { step: 2, text: 'Pega la URL del endpoint de tu dataset' },
              { step: 3, text: 'Selecciona autenticación Bearer Token con tu API key' },
              { step: 4, text: 'Power BI importa los datos automáticamente' },
            ].map(s => (
              <div key={s.step} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${activeStep === s.step ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
                onClick={() => setActiveStep(s.step)}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${activeStep === s.step ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{s.step}</div>
                <span className="text-sm text-slate-700">{s.text}</span>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Endpoints disponibles</p>
            <div className="space-y-2">
              {DATASETS.map(ds => (
                <div key={ds.key} className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{ds.label}</p>
                    <p className="text-xs text-slate-500 truncate">{ds.desc}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`${functionBase}?dataset=${ds.key}`, ds.key)}
                    className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 shrink-0 font-medium"
                  >
                    {copied === ds.key ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied === ds.key ? 'Copiado' : 'Copiar URL'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1 flex items-center gap-1.5"><Code className="w-4 h-4" /> URL del endpoint completo</p>
            <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-lg px-3 py-2 mt-2">
              <code className="text-xs text-slate-700 flex-1 truncate">{functionBase}</code>
              <button onClick={() => copyToClipboard(functionBase, 'base')}>
                {copied === 'base' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400 hover:text-slate-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* Columna 2: Embeber reporte */}
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-lg text-slate-900">2. Embeber reporte de Power BI</h3>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">¿Cómo obtener la URL de embed?</p>
            <ol className="list-decimal ml-4 space-y-1 text-xs">
              <li>Publica tu reporte en Power BI Service (powerbi.com)</li>
              <li>Abre el reporte → Archivo → Insertar informe → Sitio web o portal</li>
              <li>Copia el <strong>src</strong> del iframe generado</li>
              <li>Pégalo abajo</li>
            </ol>
          </div>

          {canConfigure && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">URL de embed de Power BI</label>
              <input
                type="url"
                value={embedUrl}
                onChange={e => setEmbedUrl(e.target.value)}
                placeholder="https://app.powerbi.com/reportEmbed?reportId=..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <Button
                onClick={() => setSavedEmbedUrl(embedUrl)}
                disabled={!embedUrl}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Guardar y mostrar reporte
              </Button>
            </div>
          )}

          {savedEmbedUrl ? (
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <iframe
                src={savedEmbedUrl}
                title="Power BI Report"
                className="w-full"
                style={{ height: '400px' }}
                allowFullScreen
              />
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 gap-2">
              <BarChart3 className="w-10 h-10" />
              <p className="text-sm">Tu reporte de Power BI aparecerá aquí</p>
              {!canConfigure && <p className="text-xs">Contacta a un administrador para configurarlo</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}