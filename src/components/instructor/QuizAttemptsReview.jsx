import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Award, CheckCircle2, XCircle, Clock, User, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function QuizAttemptsReview() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedAttempt, setExpandedAttempt] = useState(null);

  const { data: attempts = [] } = useQuery({
    queryKey: ['quiz-attempts'],
    queryFn: () => base44.entities.QuizAttempt.list('-created_date'),
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ['all-quizzes'],
    queryFn: () => base44.entities.Quiz.list(),
  });

  const getQuiz = (quizId) => quizzes.find(q => q.id === quizId);

  const filteredAttempts = attempts.filter(a => {
    const matchesSearch = a.user_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'passed' && a.passed) ||
      (filterStatus === 'failed' && !a.passed);
    return matchesSearch && matchesStatus;
  });

  const toggleExpand = (attemptId) => {
    setExpandedAttempt(expandedAttempt === attemptId ? null : attemptId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Intentos de Quiz</CardTitle>
        <div className="flex gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="passed">Aprobados</SelectItem>
              <SelectItem value="failed">Reprobados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredAttempts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Award className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No hay intentos de quiz para mostrar</p>
            </div>
          ) : (
            filteredAttempts.map((attempt) => {
              const quiz = getQuiz(attempt.quiz_id);
              const isExpanded = expandedAttempt === attempt.id;
              
              return (
                <div key={attempt.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-4 bg-white hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        attempt.passed ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {attempt.passed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-slate-900">{attempt.user_email}</p>
                            <p className="text-sm text-slate-600">{quiz?.title || 'Quiz desconocido'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={attempt.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {attempt.score}%
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpand(attempt.id)}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          {attempt.time_taken_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {attempt.time_taken_minutes} min
                            </span>
                          )}
                          {attempt.completed_date && (
                            <span>
                              {formatDistanceToNow(new Date(attempt.completed_date), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && quiz && (
                    <div className="p-4 bg-slate-50 border-t border-slate-200">
                      <h4 className="font-semibold text-sm text-slate-900 mb-3">Respuestas Detalladas</h4>
                      <div className="space-y-3">
                        {quiz.questions.map((question, i) => {
                          const userAnswer = attempt.answers[i];
                          const isCorrect = userAnswer === question.correct_answer;
                          
                          return (
                            <div key={i} className="p-3 bg-white rounded-lg border border-slate-200">
                              <div className="flex items-start gap-2 mb-2">
                                {isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-900 mb-1">
                                    {i + 1}. {question.question}
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    <strong>Respuesta del estudiante:</strong> {question.options[userAnswer] || 'No respondió'}
                                  </p>
                                  {!isCorrect && (
                                    <p className="text-xs text-green-600 mt-1">
                                      <strong>Respuesta correcta:</strong> {question.options[question.correct_answer]}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}