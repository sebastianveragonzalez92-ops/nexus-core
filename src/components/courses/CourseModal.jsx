import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

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
  });

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
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
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
                <Label>URL del Contenido</Label>
                <Input
                  value={formData.content_url}
                  onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
                  placeholder="https://..."
                />
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