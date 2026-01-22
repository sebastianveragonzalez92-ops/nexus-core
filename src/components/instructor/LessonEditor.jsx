import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Upload, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

export default function LessonEditor({ lesson, courseId, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    course_id: courseId,
    module_name: lesson?.module_name || '',
    title: lesson?.title || '',
    description: lesson?.description || '',
    order: lesson?.order || 0,
    content_type: lesson?.content_type || 'text',
    content_text: lesson?.content_text || '',
    video_url: lesson?.video_url || '',
    video_duration_minutes: lesson?.video_duration_minutes || 0,
    document_url: lesson?.document_url || '',
    is_published: lesson?.is_published !== false,
    resources: lesson?.resources || []
  });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file, field) => {
    try {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, [field]: file_url }));
      toast.success('Archivo subido');
    } catch (error) {
      toast.error('Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  const addResource = () => {
    setFormData(prev => ({
      ...prev,
      resources: [...prev.resources, { name: '', url: '', type: 'document' }]
    }));
  };

  const updateResource = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.map((r, i) => i === index ? { ...r, [field]: value } : r)
    }));
  };

  const removeResource = (index) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.module_name) {
      toast.error('Título y módulo son requeridos');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Módulo</Label>
              <Input
                value={formData.module_name}
                onChange={(e) => setFormData(prev => ({ ...prev, module_name: e.target.value }))}
                placeholder="Ej: Introducción"
              />
            </div>
            <div>
              <Label>Orden</Label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div>
            <Label>Título de la Lección</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título descriptivo"
            />
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Breve descripción de la lección"
              rows={2}
            />
          </div>

          <div>
            <Label>Tipo de Contenido</Label>
            <Select
              value={formData.content_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, content_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto / Artículo</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="pdf">Documento PDF</SelectItem>
                <SelectItem value="mixed">Mixto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Editor */}
      {(formData.content_type === 'text' || formData.content_type === 'mixed') && (
        <Card>
          <CardHeader>
            <CardTitle>Contenido de Texto</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactQuill
              theme="snow"
              value={formData.content_text}
              onChange={(value) => setFormData(prev => ({ ...prev, content_text: value }))}
              modules={modules}
              className="bg-white"
              style={{ height: '300px', marginBottom: '50px' }}
            />
          </CardContent>
        </Card>
      )}

      {/* Video Section */}
      {(formData.content_type === 'video' || formData.content_type === 'mixed') && (
        <Card>
          <CardHeader>
            <CardTitle>Video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>URL del Video (YouTube, Vimeo, etc.)</Label>
              <Input
                value={formData.video_url}
                onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div>
              <Label>Duración (minutos)</Label>
              <Input
                type="number"
                value={formData.video_duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, video_duration_minutes: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Section */}
      {(formData.content_type === 'pdf' || formData.content_type === 'mixed') && (
        <Card>
          <CardHeader>
            <CardTitle>Documento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Subir PDF u otro documento</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={(e) => handleFileUpload(e.target.files[0], 'document_url')}
                disabled={uploading}
              />
              {formData.document_url && (
                <a href={formData.document_url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline block">
                  Ver documento actual
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recursos Adicionales</span>
            <Button onClick={addResource} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Añadir Recurso
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.resources.map((resource, index) => (
            <div key={index} className="flex gap-2 items-end p-3 bg-slate-50 rounded-lg">
              <div className="flex-1">
                <Label className="text-xs">Nombre</Label>
                <Input
                  value={resource.name}
                  onChange={(e) => updateResource(index, 'name', e.target.value)}
                  placeholder="Nombre del recurso"
                  size="sm"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">URL</Label>
                <Input
                  value={resource.url}
                  onChange={(e) => updateResource(index, 'url', e.target.value)}
                  placeholder="https://..."
                  size="sm"
                />
              </div>
              <Button
                onClick={() => removeResource(index)}
                variant="ghost"
                size="icon"
                className="text-red-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {formData.resources.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">
              No hay recursos adicionales. Haz clic en "Añadir Recurso" para agregar uno.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button onClick={onCancel} variant="outline">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={uploading} className="bg-gradient-to-r from-indigo-500 to-violet-500">
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subiendo...
            </>
          ) : (
            lesson ? 'Actualizar Lección' : 'Crear Lección'
          )}
        </Button>
      </div>
    </div>
  );
}