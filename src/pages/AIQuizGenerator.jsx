import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AIContentGenerator from '../components/courses/AIContentGenerator';

export default function AIQuizGenerator() {
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const saveQuizMutation = useMutation({
    mutationFn: (quizData) => base44.entities.Quiz.create(quizData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz guardado exitosamente');
      setGeneratedQuiz(null);
      setQuizTitle('');
      setSelectedCourse('');
    },
  });

  const handleApplyQuiz = (quiz) => {
    setGeneratedQuiz(quiz);
    if (!quizTitle) {
      setQuizTitle(quiz.title);
    }
  };

  const handleSaveQuiz = () => {
    if (!selectedCourse) {
      toast.error('Selecciona un curso');
      return;
    }

    if (!generatedQuiz) {
      toast.error('Primero genera un quiz');
      return;
    }

    saveQuizMutation.mutate({
      course_id: selectedCourse,
      title: quizTitle || generatedQuiz.title,
      description: generatedQuiz.description,
      questions: generatedQuiz.questions,
      passing_score: 70,
      time_limit_minutes: generatedQuiz.questions.length * 2
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link to={createPageUrl('Courses')} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-2">
              <ArrowLeft className="w-4 h-4" />
              Volver a Cursos
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              Generador de Quiz con IA
            </h1>
            <p className="text-slate-600 mt-1">Crea evaluaciones automáticamente usando inteligencia artificial</p>
          </div>
        </div>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración del Quiz</CardTitle>
            <CardDescription>Selecciona el curso y personaliza el título</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Curso Asociado *</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un curso..." />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {generatedQuiz && (
              <div>
                <Label>Título del Quiz</Label>
                <Input
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="Personaliza el título..."
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Generator */}
        <AIContentGenerator onApplyQuiz={handleApplyQuiz} />

        {/* Generated Quiz Preview */}
        {generatedQuiz && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-2 border-emerald-200 bg-emerald-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  Vista Previa del Quiz
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-700 font-semibold">{generatedQuiz.title}</Label>
                  <p className="text-sm text-slate-600 mt-1">{generatedQuiz.description}</p>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {generatedQuiz.questions?.map((q, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200">
                      <p className="font-semibold text-slate-900 mb-2">
                        {idx + 1}. {q.question}
                      </p>
                      <div className="space-y-2 ml-4">
                        {q.options?.map((option, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-2 rounded-lg text-sm ${
                              optIdx === q.correct_answer
                                ? 'bg-emerald-100 text-emerald-800 font-medium'
                                : 'bg-slate-50 text-slate-700'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}. {option}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-slate-600">
                            <span className="font-semibold text-blue-600">Explicación:</span> {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleSaveQuiz}
                  disabled={saveQuizMutation.isPending || !selectedCourse}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  size="lg"
                >
                  {saveQuizMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Quiz
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}