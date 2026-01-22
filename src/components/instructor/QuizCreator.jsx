import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Save, Brain, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function QuizCreator({ courses }) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    passing_score: 70,
    time_limit_minutes: 0,
    questions: [
      { question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }
    ]
  });

  const queryClient = useQueryClient();

  const { data: allQuizzes = [] } = useQuery({
    queryKey: ['all-quizzes'],
    queryFn: () => base44.entities.Quiz.list('-created_date')
  });

  const createQuizMutation = useMutation({
    mutationFn: (data) => {
      if (editingQuiz) {
        return base44.entities.Quiz.update(editingQuiz.id, data);
      }
      return base44.entities.Quiz.create({ ...data, course_id: selectedCourse });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-quizzes']);
      setShowDialog(false);
      resetForm();
      toast.success(editingQuiz ? 'Evaluación actualizada' : 'Evaluación creada');
    }
  });

  const deleteQuizMutation = useMutation({
    mutationFn: (id) => base44.entities.Quiz.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-quizzes']);
      toast.success('Evaluación eliminada');
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      passing_score: 70,
      time_limit_minutes: 0,
      questions: [
        { question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }
      ]
    });
    setSelectedCourse('');
    setEditingQuiz(null);
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setSelectedCourse(quiz.course_id);
    setFormData({
      title: quiz.title,
      description: quiz.description,
      passing_score: quiz.passing_score,
      time_limit_minutes: quiz.time_limit_minutes,
      questions: quiz.questions
    });
    setShowDialog(true);
  };

  const handleDelete = (quiz) => {
    if (confirm(`¿Eliminar la evaluación "${quiz.title}"?`)) {
      deleteQuizMutation.mutate(quiz.id);
    }
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }]
    });
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...formData.questions];
    updated[index][field] = value;
    setFormData({ ...formData, questions: updated });
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...formData.questions];
    updated[qIndex].options[oIndex] = value;
    setFormData({ ...formData, questions: updated });
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      setFormData({
        ...formData,
        questions: formData.questions.filter((_, i) => i !== index)
      });
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !selectedCourse) {
      toast.error('Completa título y selecciona un curso');
      return;
    }
    if (formData.questions.some(q => !q.question || q.options.some(o => !o))) {
      toast.error('Completa todas las preguntas y opciones');
      return;
    }
    createQuizMutation.mutate(formData);
  };

  const getCourseTitle = (courseId) => {
    return courses.find(c => c.id === courseId)?.title || 'Curso desconocido';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Evaluaciones</h3>
          <p className="text-slate-600 text-sm">Crea y gestiona evaluaciones para tus cursos</p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
          className="bg-gradient-to-r from-indigo-500 to-violet-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Evaluación
        </Button>
      </div>

      {/* Quizzes List */}
      <div className="grid gap-4">
        {allQuizzes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No hay evaluaciones</h3>
              <p className="text-slate-500 mb-4">Crea la primera evaluación para un curso</p>
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Evaluación
              </Button>
            </CardContent>
          </Card>
        ) : (
          allQuizzes.map(quiz => (
            <Card key={quiz.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{quiz.title}</CardTitle>
                    <p className="text-sm text-slate-500">{getCourseTitle(quiz.course_id)}</p>
                    {quiz.description && (
                      <p className="text-sm text-slate-600 mt-2">{quiz.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(quiz)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(quiz)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <span>{quiz.questions?.length || 0} preguntas</span>
                  <span>Puntaje mínimo: {quiz.passing_score}%</span>
                  {quiz.time_limit_minutes > 0 && (
                    <span>Tiempo: {quiz.time_limit_minutes} min</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        if (!open) {
          setShowDialog(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuiz ? 'Editar Evaluación' : 'Nueva Evaluación'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label>Curso *</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={!!editingQuiz}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Título de la Evaluación *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Evaluación Final"
                />
              </div>

              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descripción de la evaluación"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Label>Tiempo Límite (minutos, 0 = sin límite)</Label>
                  <Input
                    type="number"
                    value={formData.time_limit_minutes}
                    onChange={(e) => setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Preguntas</h3>
                <Button size="sm" onClick={addQuestion} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Pregunta
                </Button>
              </div>

              <div className="space-y-4">
                {formData.questions.map((q, qIndex) => (
                  <Card key={qIndex} className="bg-slate-50">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <Label className="text-xs">Pregunta {qIndex + 1} *</Label>
                          <Textarea
                            value={q.question}
                            onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                            placeholder="Escribe la pregunta aquí"
                            rows={2}
                            className="bg-white"
                          />
                        </div>
                        {formData.questions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQuestion(qIndex)}
                            className="text-red-600 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Opciones (selecciona la correcta)</Label>
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={q.correct_answer === oIndex}
                              onChange={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                              className="shrink-0"
                            />
                            <Input
                              placeholder={`Opción ${oIndex + 1} *`}
                              value={opt}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              className="bg-white"
                            />
                          </div>
                        ))}
                      </div>

                      <div>
                        <Label className="text-xs">Explicación (opcional)</Label>
                        <Input
                          placeholder="Explica por qué es correcta esta respuesta"
                          value={q.explanation}
                          onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                          className="bg-white text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDialog(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createQuizMutation.isPending}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-500"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingQuiz ? 'Actualizar' : 'Crear'} Evaluación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}