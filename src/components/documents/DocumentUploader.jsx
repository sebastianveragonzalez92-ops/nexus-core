import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Upload, FileText, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_LABELS = {
  manual_tecnico: 'Manual Técnico',
  plano: 'Plano',
  garantia: 'Garantía',
  certificado_seguridad: 'Certificado de Seguridad',
  hoja_datos: 'Hoja de Datos',
  protocolo_mantenimiento: 'Protocolo de Mantenimiento',
  otro: 'Otro',
};

export default function DocumentUploader({ equipment, open, onClose, onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'manual_tecnico',
    version: '',
    expiry_date: '',
    tags: '',
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (máx 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('El archivo no debe superar los 50MB');
        return;
      }
      setSelectedFile(file);
      // Auto-rellenar título si está vacío
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !equipment) return;

    setUploading(true);
    try {
      // 1. Subir archivo
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });

      // 2. Crear registro
      await base44.entities.EquipmentDocument.create({
        equipment_id: equipment.id,
        equipment_name: equipment.nombre || equipment.name,
        equipment_code: equipment.numero_interno || equipment.code,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        file_url,
        file_name: selectedFile.name,
        file_type: selectedFile.type,
        file_size: selectedFile.size,
        version: formData.version || null,
        expiry_date: formData.expiry_date || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });

      toast.success('Documento subido correctamente');
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Error al subir el documento');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setFormData({
      title: '',
      description: '',
      category: 'manual_tecnico',
      version: '',
      expiry_date: '',
      tags: '',
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subir Documento</DialogTitle>
          <DialogDescription>
            Equipo: <strong>{equipment?.nombre || equipment?.name || 'N/A'}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* File input */}
          <div>
            <Label>Archivo *</Label>
            <div className="mt-2">
              {!selectedFile ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-600">Haz clic para seleccionar un archivo</span>
                  <span className="text-xs text-slate-500 mt-1">PDF, Word, Excel, imágenes (máx 50MB)</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.dwg"
                  />
                </label>
              ) : (
                <div className="flex items-center gap-3 p-4 border border-slate-300 rounded-xl bg-slate-50">
                  <FileText className="w-8 h-8 text-cyan-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-900 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1 hover:bg-slate-200 rounded transition"
                  >
                    <X className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Manual de operación modelo XYZ"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Select value={formData.category} onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del documento..."
              rows={3}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="version">Versión</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                placeholder="Ej: v1.0, Rev 3"
              />
            </div>
            <div>
              <Label htmlFor="expiry">Fecha de Vencimiento</Label>
              <Input
                id="expiry"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
              />
              <p className="text-xs text-slate-500 mt-1">Para garantías y certificados</p>
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="Ej: motor, hidráulico, preventivo"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={uploading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedFile || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Documento
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}