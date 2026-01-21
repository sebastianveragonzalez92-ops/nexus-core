import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Edit, Save, X, Upload, Plus, Trash2, Brain } from 'lucide-react';
import { toast } from 'sonner';

export default function CourseContentManager({ courses }) {
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [creatingQuiz, setCreatingQuiz] = useState(null);
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    questions: [{ question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }],
    passing_score: 70,
    time_limit_minutes: 0,
  });
  const queryClient = useQueryClient();

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Course.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setEditingCourse(null);
      toast.success('Curso actualizado');
    },
  });

  const createQuizMutation = useMutation({
    mutationFn: (data) => base44.entities.Quiz.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-quizzes'] });
      setCreatingQuiz(null);
      toast.success('Quiz creado exitosamente');
    },
  });

  const handleEdit = (course) => {
    setEditingCourse(course.id);
    setFormData({
      title: course.title,
      description: course.description,
      content_url: course.content_url,
      duration_minutes: course.duration_minutes,
    });
  };

  const handleSave = () => {
    updateCourseMutation.mutate({ id: editingCourse, data: formData });
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

  const handleCreateQuiz = (courseId) => {
    setCreatingQuiz(courseId);
    setQuizData({
      title: '',
      description: '',
      questions: [{ question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }],
      passing_score: 70,
      time_limit_minutes: 0,
    });
  };

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, { question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }],
    });
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...quizData.questions];
    updated[index][field] = value;
    setQuizData({ ...quizData, questions: updated });
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...quizData.questions];
    updated[qIndex].options[oIndex] = value;
    setQuizData({ ...quizData, questions: updated });
  };

  const removeQuestion = (index) => {
    const updated = quizData.questions.filter((_, i) => i !== index);
    setQuizData({ ...quizData, questions: updated });
  };

  const handleSaveQuiz = () => {
    createQuizMutation.mutate({
      ...quizData,
      course_id: creatingQuiz,
      order: 0,
    });
  };

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <Card key={course.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{course.title}</CardTitle>
                <Badge className="mt-2">{course.category}</Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCreateQuiz(course.id)}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Crear Quiz
                </Button>
                {editingCourse === course.id ? (
                  <>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingCourse(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => handleEdit(course)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {editingCourse === course.id ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Título</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Descripción</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">URL del Contenido</label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.content_url}
                      onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
                      placeholder="https://..."
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById(`file-${course.id}`).click()}
                      disabled={uploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Subiendo...' : 'Subir'}
                    </Button>
                    <input
                      id={`file-${course.id}`}
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="video/*,application/pdf,.zip"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Duración (minutos)</label>
                  <Input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-600">
                <p>{course.description}</p>
                <div className="mt-4 flex items-center gap-4">
                  <span>Duración: {course.duration_minutes} min</span>
                  {course.content_url && <span className="text-green-600">✓ Contenido disponible</span>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Quiz Creation Modal */}
      {creatingQuiz && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle>Crear Nuevo Quiz</CardTitle>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Título del Quiz</label>
                  <Input
                    value={quizData.title}
                    onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                    placeholder="Ej: Evaluación Final"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Descripción</label>
                  <Textarea
                    value={quizData.description}
                    onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Puntaje Mínimo (%)</label>
                    <Input
                      type="number"
                      value={quizData.passing_score}
                      onChange={(e) => setQuizData({ ...quizData, passing_score: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Tiempo Límite (minutos, 0 = sin límite)</label>
                    <Input
                      type="number"
                      value={quizData.time_limit_minutes}
                      onChange={(e) => setQuizData({ ...quizData, time_limit_minutes: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">Preguntas</h3>
                    <Button size="sm" onClick={addQuestion}>
                      <Plus className="w-4 h-4 mr-2" />
                      Añadir Pregunta
                    </Button>
                  </div>
                  <div className="space-y-6">
                    {quizData.questions.map((q, qIndex) => (
                      <div key={qIndex} className="p-4 bg-slate-50 rounded-xl space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <Input
                            placeholder={`Pregunta ${qIndex + 1}`}
                            value={q.question}
                            onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQuestion(qIndex)}
                            className="text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {q.options.map((opt, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <input
                                type="radio"
                                checked={q.correct_answer === oIndex}
                                onChange={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                                className="shrink-0"
                              />
                              <Input
                                placeholder={`Opción ${oIndex + 1}`}
                                value={opt}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                        <Input
                          placeholder="Explicación (opcional)"
                          value={q.explanation}
                          onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="flex gap-3 p-6 border-t">
              <Button variant="outline" onClick={() => setCreatingQuiz(null)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSaveQuiz} className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-500">
                <Save className="w-4 h-4 mr-2" />
                Guardar Quiz
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}