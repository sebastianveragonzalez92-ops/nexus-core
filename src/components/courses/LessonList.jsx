import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Video, FileText, File, Lock, ChevronDown, ChevronRight, Sparkles, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { awardPoints, incrementStat, checkAndAwardBadges, POINTS } from '../gamification/gamificationHelpers';

export default function LessonList({ courseId, user, onAllLessonsCompleted }) {
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [selectedScenarioOptions, setSelectedScenarioOptions] = useState({});
  const [showScenarioFeedback, setShowScenarioFeedback] = useState({});
  const queryClient = useQueryClient();

  // Fetch lessons
  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ 
      course_id: courseId,
      is_published: true 
    }, 'order'),
    enabled: !!courseId
  });

  // Fetch lesson progress
  const { data: progressRecords = [] } = useQuery({
    queryKey: ['lesson-progress', courseId, user?.email],
    queryFn: () => base44.entities.LessonProgress.filter({
      course_id: courseId,
      user_email: user?.email
    }),
    enabled: !!courseId && !!user
  });

  // Complete lesson mutation
  const completeLessonMutation = useMutation({
    mutationFn: async (lessonId) => {
      const existing = progressRecords.find(p => p.lesson_id === lessonId);
      
      if (existing) {
        return base44.entities.LessonProgress.update(existing.id, {
          completed: true,
          completed_date: new Date().toISOString()
        });
      }
      
      return base44.entities.LessonProgress.create({
        lesson_id: lessonId,
        course_id: courseId,
        user_email: user.email,
        completed: true,
        completed_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lesson-progress']);
      toast.success('Lección completada');
    }
  });

  // Group lessons by module
  const moduleGroups = lessons.reduce((acc, lesson) => {
    const moduleName = lesson.module_name || 'Contenido General';
    if (!acc[moduleName]) {
      acc[moduleName] = [];
    }
    acc[moduleName].push(lesson);
    return acc;
  }, {});

  const isLessonCompleted = (lessonId) => {
    return progressRecords.some(p => p.lesson_id === lessonId && p.completed);
  };

  const getModuleProgress = (moduleLessons) => {
    const completed = moduleLessons.filter(l => isLessonCompleted(l.id)).length;
    return (completed / moduleLessons.length) * 100;
  };

  const totalProgress = lessons.length > 0 
    ? (progressRecords.filter(p => p.completed).length / lessons.length) * 100 
    : 0;

  const allLessonsComplete = lessons.length > 0 && progressRecords.filter(p => p.completed).length === lessons.length;

  React.useEffect(() => {
    if (allLessonsComplete && onAllLessonsCompleted) {
      onAllLessonsCompleted();
    }
  }, [allLessonsComplete]);

  const getContentIcon = (type) => {
    switch(type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'pdf': return <File className="w-4 h-4" />;
      case 'scenario': return <Sparkles className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleScenarioOptionSelect = (lessonId, scenarioIndex, optionIndex) => {
    const key = `${lessonId}-${scenarioIndex}`;
    setSelectedScenarioOptions(prev => ({ ...prev, [key]: optionIndex }));
    setShowScenarioFeedback(prev => ({ ...prev, [key]: true }));
  };

  const renderLessonContent = (lesson) => {
    return (
      <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
        {/* Text Content */}
        {lesson.content_text && (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{lesson.content_text}</ReactMarkdown>
          </div>
        )}

        {/* Video */}
        {lesson.video_url && (
          <div>
            {lesson.video_url.includes('youtube.com') || lesson.video_url.includes('youtu.be') ? (
              <iframe
                src={lesson.video_url.replace('watch?v=', 'embed/')}
                className="w-full aspect-video rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video controls className="w-full rounded-lg">
                <source src={lesson.video_url} />
              </video>
            )}
          </div>
        )}

        {/* Document */}
        {lesson.document_url && (
          <div>
            <a 
              href={lesson.document_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-indigo-600 hover:underline"
            >
              <File className="w-4 h-4" />
              Ver documento
            </a>
          </div>
        )}

        {/* Scenarios */}
        {lesson.scenarios && lesson.scenarios.length > 0 && (
          <div className="space-y-4">
            {lesson.scenarios.map((scenario, sIndex) => {
              const key = `${lesson.id}-${sIndex}`;
              const selectedOption = selectedScenarioOptions[key];
              const showFeedback = showScenarioFeedback[key];

              return (
                <Card key={sIndex} className="bg-white border-2 border-indigo-200">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      {scenario.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {scenario.image_url && (
                      <img 
                        src={scenario.image_url} 
                        alt={scenario.title}
                        className="w-full rounded-lg"
                      />
                    )}
                    
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-slate-700 whitespace-pre-wrap">{scenario.situation}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="font-semibold text-sm text-slate-700">
                        ¿Qué harías en esta situación?
                      </p>
                      {scenario.options.map((option, oIndex) => {
                        const isSelected = selectedOption === oIndex;
                        const isCorrect = option.is_correct;
                        
                        return (
                          <div key={oIndex}>
                            <button
                              onClick={() => handleScenarioOptionSelect(lesson.id, sIndex, oIndex)}
                              disabled={showFeedback}
                              className={cn(
                                "w-full text-left p-3 rounded-lg border-2 transition-all",
                                showFeedback && isSelected && isCorrect && "border-green-500 bg-green-50",
                                showFeedback && isSelected && !isCorrect && "border-red-500 bg-red-50",
                                !showFeedback && "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50",
                                showFeedback && !isSelected && "opacity-50"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                                  isSelected && showFeedback && isCorrect && "border-green-500 bg-green-500",
                                  isSelected && showFeedback && !isCorrect && "border-red-500 bg-red-500",
                                  !isSelected && "border-slate-300"
                                )}>
                                  {isSelected && showFeedback && (
                                    isCorrect ? 
                                      <CheckCircle className="w-4 h-4 text-white" /> : 
                                      <XCircle className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-slate-900">{option.text}</p>
                                  {isSelected && showFeedback && option.feedback && (
                                    <p className={cn(
                                      "text-sm mt-2 p-2 rounded",
                                      isCorrect ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
                                    )}>
                                      {option.feedback}
                                    </p>
                                  )}
                                  {option.points > 0 && (
                                    <Badge variant="outline" className="mt-2">
                                      {option.points} puntos
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {showFeedback && (
                      <Button
                        onClick={() => {
                          setSelectedScenarioOptions(prev => ({ ...prev, [key]: undefined }));
                          setShowScenarioFeedback(prev => ({ ...prev, [key]: false }));
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Intentar Nuevamente
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Resources */}
        {lesson.resources && lesson.resources.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-sm mb-2">Recursos Adicionales</h4>
            <div className="space-y-2">
              {lesson.resources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
                >
                  {resource.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Complete Button */}
        {!isLessonCompleted(lesson.id) && (
          <Button
            onClick={() => completeLessonMutation.mutate(lesson.id)}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-500"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Marcar como Completada
          </Button>
        )}
      </div>
    );
  };

  if (lessons.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No hay lecciones disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Progreso del Curso</span>
            <span className="text-2xl font-bold text-indigo-600">{Math.round(totalProgress)}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={totalProgress} className="h-3" />
          <p className="text-sm text-slate-600 mt-2">
            {progressRecords.filter(p => p.completed).length} de {lessons.length} lecciones completadas
          </p>
        </CardContent>
      </Card>

      {/* Modules */}
      {Object.entries(moduleGroups).map(([moduleName, moduleLessons]) => (
        <Card key={moduleName}>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center justify-between mb-2">
                <span>{moduleName}</span>
                <Badge variant="outline">
                  {moduleLessons.filter(l => isLessonCompleted(l.id)).length}/{moduleLessons.length}
                </Badge>
              </CardTitle>
              <Progress value={getModuleProgress(moduleLessons)} className="h-2" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {moduleLessons.map((lesson, index) => {
              const isCompleted = isLessonCompleted(lesson.id);
              const isExpanded = expandedLesson === lesson.id;
              
              return (
                <div key={lesson.id} className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors",
                      isCompleted && "bg-green-50/50"
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                      {getContentIcon(lesson.content_type)}
                      <div className="text-left">
                        <p className="font-medium text-slate-900">{lesson.title}</p>
                        {lesson.description && (
                          <p className="text-sm text-slate-500">{lesson.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {lesson.video_duration_minutes > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {lesson.video_duration_minutes} min
                        </Badge>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>
                  
                  {isExpanded && renderLessonContent(lesson)}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Completion Message */}
      {allLessonsComplete && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-bold text-green-900 mb-2">¡Todas las lecciones completadas!</h3>
            <p className="text-green-700">
              Ahora puedes realizar la evaluación final del curso
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}