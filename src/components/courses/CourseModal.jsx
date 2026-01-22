import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Upload, FileCheck, Plus, Trash2, Link as LinkIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import AIContentGenerator from './AIContentGenerator';

export default function CourseModal({ course, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    type: course?.type || 'video',
    category: course?.category || 'operacion',
    duration_minutes: course?.duration_minutes || 60,
    status: course?.status || 'draft',
    passing_score: course?.passing_score || 70,
    requires_certification: course?.requires_certification || false,
    certification_validity_days: course?.certification_validity_days || 365,
    content_url: course?.content_url || '',
    offline_available: course?.offline_available || false,
    external_resources: course?.external_resources || [],
  });
  const [uploading, setUploading] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const handleApplyAICourse = (aiCourseData) => {
    setFormData({
      ...formData,
      title: aiCourseData.title,
      description: aiCourseData.description,
      category: aiCourseData.category,
      duration_minutes: aiCourseData.duration_minutes,
      external_resources: aiCourseData.external_resources
    });
    setShowAIGenerator(false);
  };

  const addResource = () => {
    setFormData({
      ...formData,
      external_resources: [
        ...formData.external_resources,
        { title: '', url: '', type: 'link' }
      ]
    });
  };

  const updateResource = (index, field, value) => {
    const updated = [...formData.external_resources];
    updated[index][field] = value;
    setFormData({ ...formData, external_resources: updated });
  };

  const removeResource = (index) => {
    const updated = formData.external_resources.filter((_, i) => i !== index);
    setFormData({ ...formData, external_resources: updated });
  };

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (course) {
        return base44.entities.Course.update(course.id, data);
      }
      return base44.entities.Course.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, content_url: file_url });
      toast.success('Archivo subido exitosamente');
    } catch (error) {
      toast.error('Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">
              {course ? 'Editar Capacitación' : 'Nueva Capacitación'}
            </h2>
            <div className="flex items-center gap-2">
              {!course && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAIGenerator(!showAIGenerator)}
                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {showAIGenerator ? 'Ocultar IA' : 'Generar con IA'}
                </Button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {showAIGenerator && (
              <div className="mb-6">
                <AIContentGenerator onApplyCourse={handleApplyAICourse} />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label>Título *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Operación Segura de Grúas Horquilla"
                  required
                />
              </div>

              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el contenido del curso..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Contenido</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="scorm">SCORM</SelectItem>
                      <SelectItem value="xapi">xAPI</SelectItem>
                      <SelectItem value="microlearning">Microlearning</SelectItem>
                      <SelectItem value="evaluation">Evaluación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Categoría *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operacion">Operación</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="seguridad">Seguridad</SelectItem>
                      <SelectItem value="calidad">Calidad</SelectItem>
                      <SelectItem value="tecnico">Técnico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duración (minutos)</Label>
                  <Input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>Puntaje Mínimo (%)</Label>
                  <Input
                    type="number"
                    value={formData.passing_score}
                    onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <Label>Contenido del Curso</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={formData.content_url}
                      onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
                      placeholder="URL del contenido o sube un archivo..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload').click()}
                      disabled={uploading}
                      className="shrink-0"
                    >
                      {uploading ? (
                        <>
                          <Upload className="w-4 h-4 mr-2 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Subir
                        </>
                      )}
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="video/*,application/pdf,.zip,.scorm"
                    />
                  </div>
                  {formData.content_url && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600">
                      <FileCheck className="w-4 h-4" />
                      <span>Archivo configurado</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl">
                <div>
                  <Label className="font-semibold">Requiere Certificación</Label>
                  <p className="text-xs text-slate-500">Genera certificado al completar</p>
                </div>
                <Switch
                  checked={formData.requires_certification}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, requires_certification: checked })
                  }
                />
              </div>

              {formData.requires_certification && (
                <div>
                  <Label>Validez Certificación (días)</Label>
                  <Input
                    type="number"
                    value={formData.certification_validity_days}
                    onChange={(e) =>
                      setFormData({ ...formData, certification_validity_days: parseInt(e.target.value) })
                    }
                  />
                </div>
              )}

              <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl">
                <div>
                  <Label className="font-semibold">Disponible Offline</Label>
                  <p className="text-xs text-slate-500">Descargable para uso sin conexión</p>
                </div>
                <Switch
                  checked={formData.offline_available}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, offline_available: checked })
                  }
                />
              </div>

              <div>
                <Label>Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* External Resources */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label className="font-semibold">Recursos Externos</Label>
                    <p className="text-xs text-slate-500">Enlaces a artículos, videos o documentos</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addResource}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir Recurso
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.external_resources.map((resource, index) => (
                    <div key={index} className="flex gap-2 p-3 bg-slate-50 rounded-xl">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Título del recurso"
                          value={resource.title}
                          onChange={(e) => updateResource(index, 'title', e.target.value)}
                          className="bg-white"
                        />
                        <div className="flex gap-2">
                          <Input
                            placeholder="URL"
                            value={resource.url}
                            onChange={(e) => updateResource(index, 'url', e.target.value)}
                            className="flex-1 bg-white"
                          />
                          <Select
                            value={resource.type}
                            onValueChange={(value) => updateResource(index, 'type', value)}
                          >
                            <SelectTrigger className="w-32 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="article">Artículo</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="document">Documento</SelectItem>
                              <SelectItem value="link">Enlace</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeResource(index)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-500"
              >
                {saveMutation.isPending ? (
                  'Guardando...'
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}