import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ChevronRight, Brain, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { awardPoints, POINTS } from '../gamification/gamificationHelpers';

export default function MicroStepReader({ content, user, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);

  // Parse content into micro-steps
  const steps = content.steps || [];
  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleStepComplete = async () => {
    if (!completedSteps.has(currentStep)) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      await awardPoints(user.email, POINTS.MICRO_STEP, 'Micro-paso completado');
    }
    setShowCompletionScreen(true);
  };

  const handleContinueToNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setShowCompletionScreen(false);
    } else {
      onComplete?.();
    }
  };

  const handleAnswerQuestion = async (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);

    if (step.question && step.question.correct === answerIndex) {
      await awardPoints(user.email, POINTS.MINI_QUESTION, 'Mini-pregunta correcta');
    }
  };

  if (!steps || steps.length === 0) {
    return null;
  }

  // Completion screen between steps
  if (showCompletionScreen) {
    return (
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-12 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Micro-paso completado!</h3>
            <p className="text-slate-600">Has completado el paso {currentStep + 1} de {steps.length}</p>
          </div>
          <Progress value={progress} className="h-3" />
          <Button 
            onClick={handleContinueToNext}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-emerald-500"
          >
            {currentStep < steps.length - 1 ? 'Continuar al siguiente paso' : 'Finalizar lección'}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium">Micro-paso {currentStep + 1} de {steps.length}</span>
        </div>
        <Badge variant="outline">{Math.round(progress)}% completado</Badge>
      </div>
      <Progress value={progress} className="h-2" />

      {/* Step Content */}
      <Card className="border-2 border-indigo-200">
        <CardContent className="p-6 space-y-4">
          {/* Step dots */}
          <div className="flex items-center gap-2 pb-4 border-b">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === currentStep && "w-8 bg-indigo-600",
                  i < currentStep && "bg-green-500",
                  i > currentStep && "bg-slate-300"
                )}
              />
            ))}
          </div>

          {/* Step title */}
          {step.title && (
            <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
          )}

          {/* Step content */}
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: step.content }} />
          </div>

          {/* Inline question */}
          {step.question && (
            <Card className="bg-violet-50 border-violet-200">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <Brain className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                  <p className="font-medium text-slate-900">{step.question.text}</p>
                </div>
                <div className="space-y-2">
                  {step.question.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswerQuestion(i)}
                      disabled={showFeedback}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border-2 transition-all",
                        showFeedback && i === step.question.correct && "border-green-500 bg-green-50",
                        showFeedback && selectedAnswer === i && i !== step.question.correct && "border-red-500 bg-red-50",
                        !showFeedback && "border-slate-200 hover:border-violet-300 hover:bg-white"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {showFeedback && i === step.question.correct ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-sm">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
                {showFeedback && step.question.explanation && (
                  <p className="text-sm text-slate-600 bg-white p-3 rounded-lg">
                    💡 {step.question.explanation}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Anterior
            </Button>
            <Button
              onClick={handleStepComplete}
              disabled={step.question && !showFeedback}
              className="bg-gradient-to-r from-indigo-500 to-violet-500"
            >
              {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}