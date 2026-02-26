import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, X, Loader2, Plus } from 'lucide-react';

export default function PhotoCapture({ photos = [], onPhotosChange }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const newUrls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newUrls.push(file_url);
    }
    onPhotosChange([...photos, ...newUrls]);
    setUploading(false);
    e.target.value = '';
  };

  const removePhoto = (idx) => {
    onPhotosChange(photos.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {photos.map((url, idx) => (
          <div key={idx} className="relative aspect-square group">
            <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover rounded-xl border border-slate-200" />
            <button
              onClick={() => removePhoto(idx)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all disabled:opacity-50"
        >
          {uploading
            ? <Loader2 className="w-7 h-7 animate-spin" />
            : <><Camera className="w-7 h-7" /><span className="text-xs font-medium">Agregar</span></>
          }
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}