import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Upload, Loader2, Sparkles, CheckCircle, XCircle, Zap, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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
    resources: lesson?.resources || [],
    scenarios: lesson?.scenarios || [],
    micro_steps: lesson?.micro_steps || { steps: [] },
    checklist: lesson?.checklist || { title: '', checks: [] },
    assessment_id: lesson?.assessment_id || ''
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
                <SelectItem value="scenario">Escenario Interactivo</SelectItem>
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

      {/* Scenarios Section */}
      {(formData.content_type === 'scenario' || formData.content_type === 'mixed') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>Escenarios Interactivos</span>
              </div>
              <Button onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  scenarios: [...prev.scenarios, {
                    title: '',
                    situation: '',
                    image_url: '',
                    options: [
                      { text: '', feedback: '', is_correct: false, points: 0 },
                      { text: '', feedback: '', is_correct: false, points: 0 }
                    ]
                  }]
                }));
              }} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Añadir Escenario
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.scenarios.map((scenario, sIndex) => (
              <Card key={sIndex} className="bg-slate-50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm">Escenario {sIndex + 1}</h4>
                    <Button
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        scenarios: prev.scenarios.filter((_, i) => i !== sIndex)
                      }))}
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div>
                    <Label className="text-xs">Título del Escenario</Label>
                    <Input
                      value={scenario.title}
                      onChange={(e) => {
                        const updated = [...formData.scenarios];
                        updated[sIndex].title = e.target.value;
                        setFormData(prev => ({ ...prev, scenarios: updated }));
                      }}
                      placeholder="Ej: Situación de emergencia"
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Descripción de la Situación</Label>
                    <Textarea
                      value={scenario.situation}
                      onChange={(e) => {
                        const updated = [...formData.scenarios];
                        updated[sIndex].situation = e.target.value;
                        setFormData(prev => ({ ...prev, scenarios: updated }));
                      }}
                      placeholder="Describe la situación o problema que el estudiante debe resolver..."
                      rows={3}
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Imagen (opcional)</Label>
                    <Input
                      value={scenario.image_url}
                      onChange={(e) => {
                        const updated = [...formData.scenarios];
                        updated[sIndex].image_url = e.target.value;
                        setFormData(prev => ({ ...prev, scenarios: updated }));
                      }}
                      placeholder="URL de la imagen"
                      className="bg-white"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-semibold">Opciones de Respuesta</Label>
                      <Button
                        onClick={() => {
                          const updated = [...formData.scenarios];
                          updated[sIndex].options.push({
                            text: '',
                            feedback: '',
                            is_correct: false,
                            points: 0
                          });
                          setFormData(prev => ({ ...prev, scenarios: updated }));
                        }}
                        size="sm"
                        variant="ghost"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Opción
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {scenario.options.map((option, oIndex) => (
                        <Card key={oIndex} className="bg-white">
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-start gap-2">
                              <div className="flex-1 space-y-2">
                                <Input
                                  placeholder="Texto de la opción"
                                  value={option.text}
                                  onChange={(e) => {
                                    const updated = [...formData.scenarios];
                                    updated[sIndex].options[oIndex].text = e.target.value;
                                    setFormData(prev => ({ ...prev, scenarios: updated }));
                                  }}
                                  className="text-sm"
                                />
                                <Textarea
                                  placeholder="Feedback al seleccionar esta opción"
                                  value={option.feedback}
                                  onChange={(e) => {
                                    const updated = [...formData.scenarios];
                                    updated[sIndex].options[oIndex].feedback = e.target.value;
                                    setFormData(prev => ({ ...prev, scenarios: updated }));
                                  }}
                                  rows={2}
                                  className="text-sm"
                                />
                                <div className="flex gap-2">
                                  <label className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={option.is_correct}
                                      onChange={(e) => {
                                        const updated = [...formData.scenarios];
                                        updated[sIndex].options[oIndex].is_correct = e.target.checked;
                                        setFormData(prev => ({ ...prev, scenarios: updated }));
                                      }}
                                    />
                                    {option.is_correct ? (
                                      <span className="flex items-center gap-1 text-green-600">
                                        <CheckCircle className="w-3 h-3" />
                                        Correcta
                                      </span>
                                    ) : (
                                      <span className="text-slate-600">Marcar como correcta</span>
                                    )}
                                  </label>
                                  <Input
                                    type="number"
                                    placeholder="Puntos"
                                    value={option.points}
                                    onChange={(e) => {
                                      const updated = [...formData.scenarios];
                                      updated[sIndex].options[oIndex].points = parseInt(e.target.value) || 0;
                                      setFormData(prev => ({ ...prev, scenarios: updated }));
                                    }}
                                    className="w-20 text-sm"
                                  />
                                </div>
                              </div>
                              <Button
                                onClick={() => {
                                  const updated = [...formData.scenarios];
                                  updated[sIndex].options = updated[sIndex].options.filter((_, i) => i !== oIndex);
                                  setFormData(prev => ({ ...prev, scenarios: updated }));
                                }}
                                variant="ghost"
                                size="icon"
                                className="text-red-600"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {formData.scenarios.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                No hay escenarios. Haz clic en "Añadir Escenario" para crear uno.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Micro-steps Section */}
      {(formData.content_type === 'text' || formData.content_type === 'mixed') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>Micro-pasos con Preguntas</span>
              </div>
              <Button onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  micro_steps: {
                    steps: [...(prev.micro_steps?.steps || []), {
                      title: '',
                      content: '',
                      question: null
                    }]
                  }
                }));
              }} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Añadir Micro-paso
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.micro_steps?.steps?.map((step, index) => (
              <Card key={index} className="bg-slate-50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-sm">Paso {index + 1}</h4>
                    <Button
                      onClick={() => {
                        const updated = { ...formData.micro_steps };
                        updated.steps = updated.steps.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, micro_steps: updated }));
                      }}
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Título del paso"
                    value={step.title}
                    onChange={(e) => {
                      const updated = { ...formData.micro_steps };
                      updated.steps[index].title = e.target.value;
                      setFormData(prev => ({ ...prev, micro_steps: updated }));
                    }}
                    className="bg-white"
                  />
                  <Textarea
                    placeholder="Contenido del paso"
                    value={step.content}
                    onChange={(e) => {
                      const updated = { ...formData.micro_steps };
                      updated.steps[index].content = e.target.value;
                      setFormData(prev => ({ ...prev, micro_steps: updated }));
                    }}
                    rows={3}
                    className="bg-white"
                  />
                  
                  {/* Mini Question */}
                  <div className="pt-3 border-t">
                    <Label className="text-xs">Mini-pregunta (opcional)</Label>
                    {step.question ? (
                      <div className="space-y-2 mt-2">
                        <Input
                          placeholder="Pregunta"
                          value={step.question.text}
                          onChange={(e) => {
                            const updated = { ...formData.micro_steps };
                            updated.steps[index].question.text = e.target.value;
                            setFormData(prev => ({ ...prev, micro_steps: updated }));
                          }}
                          className="bg-white text-sm"
                        />
                        {step.question.options?.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`question-${index}`}
                              checked={step.question.correct === oIdx}
                              onChange={() => {
                                const updated = { ...formData.micro_steps };
                                updated.steps[index].question.correct = oIdx;
                                setFormData(prev => ({ ...prev, micro_steps: updated }));
                              }}
                              className="w-4 h-4 text-green-600"
                            />
                            <Input
                              placeholder={`Opción ${oIdx + 1}`}
                              value={opt}
                              onChange={(e) => {
                                const updated = { ...formData.micro_steps };
                                updated.steps[index].question.options[oIdx] = e.target.value;
                                setFormData(prev => ({ ...prev, micro_steps: updated }));
                              }}
                              className={cn(
                                "bg-white text-sm",
                                step.question.correct === oIdx && "border-green-500 bg-green-50"
                              )}
                            />
                            {step.question.correct === oIdx && (
                              <Badge className="bg-green-600 text-white text-xs">Correcta</Badge>
                            )}
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const updated = { ...formData.micro_steps };
                            updated.steps[index].question = null;
                            setFormData(prev => ({ ...prev, micro_steps: updated }));
                          }}
                        >
                          Quitar pregunta
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const updated = { ...formData.micro_steps };
                          updated.steps[index].question = {
                            text: '',
                            options: ['', ''],
                            correct: 0,
                            explanation: ''
                          };
                          setFormData(prev => ({ ...prev, micro_steps: updated }));
                        }}
                        className="mt-2"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Añadir pregunta
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Assessment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Evaluación Asociada</span>
            <Button size="sm" variant="outline" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 hover:from-emerald-600 hover:to-teal-600">
              <Plus className="w-4 h-4 mr-2" />
              Añadir Evaluación
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {formData.assessment_id ? (
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div>
                <p className="text-sm font-medium text-slate-900">Evaluación ID: {formData.assessment_id}</p>
                <p className="text-xs text-slate-600 mt-1">Evaluación vinculada a esta lección</p>
              </div>
              <Button
                onClick={() => setFormData(prev => ({ ...prev, assessment_id: '' }))}
                variant="ghost"
                size="sm"
                className="text-red-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">
              No hay evaluación asociada. Haz clic en "Añadir Evaluación" para crear una.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Interactive Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <span>Lista de Verificación Interactiva</span>
            </div>
            <Button onClick={() => {
              setFormData(prev => ({
                ...prev,
                checklist: {
                  ...prev.checklist,
                  checks: [...(prev.checklist?.checks || []), { text: '', description: '' }]
                }
              }));
            }} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Añadir Check
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Título de la checklist"
            value={formData.checklist?.title || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              checklist: { ...prev.checklist, title: e.target.value }
            }))}
          />
          {formData.checklist?.checks?.map((check, index) => (
            <div key={index} className="flex gap-2 p-3 bg-slate-50 rounded-lg">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Texto del check"
                  value={check.text}
                  onChange={(e) => {
                    const updated = { ...formData.checklist };
                    updated.checks[index].text = e.target.value;
                    setFormData(prev => ({ ...prev, checklist: updated }));
                  }}
                  className="bg-white"
                />
                <Input
                  placeholder="Descripción (opcional)"
                  value={check.description}
                  onChange={(e) => {
                    const updated = { ...formData.checklist };
                    updated.checks[index].description = e.target.value;
                    setFormData(prev => ({ ...prev, checklist: updated }));
                  }}
                  className="bg-white text-sm"
                />
              </div>
              <Button
                onClick={() => {
                  const updated = { ...formData.checklist };
                  updated.checks = updated.checks.filter((_, i) => i !== index);
                  setFormData(prev => ({ ...prev, checklist: updated }));
                }}
                variant="ghost"
                size="icon"
                className="text-red-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

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