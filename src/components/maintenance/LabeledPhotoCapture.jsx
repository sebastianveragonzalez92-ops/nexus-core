import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, X, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PHOTO_LABELS = [
  'Fotografía frontal del equipo',
  'CAS - Antena QC1000',
  'CAS - Pantalla QD1400',
  'CAS - Mastil',
  'FMS - Pantalla',
  'FMS - GPS',
  'FMS - CORE',
  'FMS - Cable Display',
  'FMS - Cable Core Power',
  'FMS - Bracket Smartscreen',
  'FMS - Bracket Core',
  'FMS - Bracket Antena GPS',
  'Fotografía lateral del equipo',
  'Fotografía trasera del equipo',
  'Detalle daño / hallazgo',
];

export default function LabeledPhotoCapture({ entries = [], onEntriesChange }) {
  const [uploading, setUploading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const fileInputRef = useRef(null);
  const pendingLabel = useRef('');

  const handleAddPhoto = () => {
    if (!selectedLabel) return;
    pendingLabel.current = selectedLabel;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onEntriesChange([...entries, { label: pendingLabel.current, url: file_url }]);
    setSelectedLabel('');
    setUploading(false);
    e.target.value = '';
  };

  const remove = (idx) => onEntriesChange(entries.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      {/* Add photo row */}
      <div className="flex gap-2">
        <Select value={selectedLabel} onValueChange={setSelectedLabel}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Seleccionar componente a fotografiar..." />
          </SelectTrigger>
          <SelectContent>
            {PHOTO_LABELS.map(label => (
              <SelectItem key={label} value={label}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          type="button"
          onClick={handleAddPhoto}
          disabled={uploading || !selectedLabel}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          Tomar foto
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

      {/* Entries table */}
      {entries.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
          {entries.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3">
              <span className="text-sm font-semibold text-slate-700 flex-1">{entry.label}</span>
              <img src={entry.url} alt={entry.label} className="w-24 h-16 object-cover rounded-lg border border-slate-200 shrink-0" />
              <button type="button" onClick={() => remove(idx)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}