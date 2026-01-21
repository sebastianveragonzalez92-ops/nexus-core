import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Trophy, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function QuizViewer({ quiz, user, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (quiz.time_limit_minutes) {
      setTimeLeft(quiz.time_limit_minutes * 60);
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswer = (questionIndex, answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    const correctAnswers = quiz.questions.filter((q, i) => q.correct_answer === answers[i]).length;
    const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100);
    const passed = finalScore >= quiz.passing_score;
    const timeTaken = Math.round((Date.now() - startTime) / 60000);

    setScore(finalScore);
    setShowResults(true);

    try {
      await base44.entities.QuizAttempt.create({
        quiz_id: quiz.id,
        user_email: user.email,
        answers,
        score: finalScore,
        passed,
        time_taken_minutes: timeTaken,
        completed_date: new Date().toISOString(),
      });

      if (passed) {
        toast.success('¡Felicitaciones! Has aprobado el quiz');
        onComplete?.(finalScore);
      } else {
        toast.error('No has alcanzado el puntaje mínimo. Puedes intentarlo nuevamente.');
      }
    } catch (error) {
      toast.error('Error al guardar los resultados');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    const passed = score >= quiz.passing_score;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <Card className={`border-2 ${passed ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
          <CardContent className="pt-6 text-center">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${passed ? 'bg-green-100' : 'bg-amber-100'}`}>
              {passed ? (
                <Trophy className="w-10 h-10 text-green-600" />
              ) : (
                <AlertCircle className="w-10 h-10 text-amber-600" />
              )}
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {passed ? '¡Quiz Completado!' : 'Sigue Intentando'}
            </h3>
            <p className="text-3xl font-bold text-slate-900 mb-4">{score}%</p>
            <p className="text-slate-600 mb-6">
              {passed 
                ? `Has superado el puntaje mínimo de ${quiz.passing_score}%`
                : `Necesitas ${quiz.passing_score}% para aprobar`
              }
            </p>
            <div className="space-y-3">
              {quiz.questions.map((q, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  {answers[i] === q.correct_answer ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm mb-1">{q.question}</p>
                    {answers[i] !== q.correct_answer && (
                      <p className="text-xs text-slate-600">
                        Respuesta correcta: {q.options[q.correct_answer]}
                      </p>
                    )}
                    {q.explanation && (
                      <p className="text-xs text-slate-500 mt-1 italic">{q.explanation}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900">{quiz.title}</h3>
          <p className="text-sm text-slate-600 mt-1">{quiz.description}</p>
        </div>
        {timeLeft !== null && (
          <Badge variant={timeLeft < 60 ? 'destructive' : 'secondary'} className="text-lg px-4 py-2">
            <Clock className="w-4 h-4 mr-2" />
            {formatTime(timeLeft)}
          </Badge>
        )}
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">Pregunta {currentQuestion + 1} de {quiz.questions.length}</span>
          <span className="font-semibold">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{question.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(currentQuestion, i)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    answers[currentQuestion] === i
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion] === i ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                    }`}>
                      {answers[currentQuestion] === i && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          Anterior
        </Button>
        {currentQuestion === quiz.questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={answers.length !== quiz.questions.length}
            className="bg-gradient-to-r from-indigo-500 to-violet-500"
          >
            Enviar Quiz
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
            disabled={answers[currentQuestion] === undefined}
          >
            Siguiente
          </Button>
        )}
      </div>
    </div>
  );
}