import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Play, CheckCircle, Clock, Award, 
  FileText, Users, BookOpen, Download, Upload, MessageSquare, Brain, Eye, EyeOff
} from 'lucide-react';
import QuizViewer from '../components/courses/QuizViewer';
import DiscussionForum from '../components/courses/DiscussionForum';
import ExternalResources from '../components/courses/ExternalResources';
import LessonList from '../components/courses/LessonList';
import XAPIViewer from '../components/courses/XAPIViewer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { notifyEnrollmentConfirmation, notifyCourseCompletion, notifyCertificateIssued } from '../components/notifications/notificationHelpers';
import { awardPoints, incrementStat, checkAndAwardBadges, POINTS } from '../components/gamification/gamificationHelpers';

export default function CourseDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [allLessonsCompleted, setAllLessonsCompleted] = useState(false);
  const [currentTab, setCurrentTab] = useState('content');
  
  // Get course ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Fetch course
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const course = courses.find(c => c.id === courseId);

  // Fetch quizzes
  const { data: allQuizzes = [] } = useQuery({
    queryKey: ['quizzes', courseId],
    queryFn: () => base44.entities.Quiz.filter({ course_id: courseId }, 'order'),
    enabled: !!courseId,
  });

  const quizzes = allQuizzes.filter(q => q.type !== 'final_exam');
  const finalExams = allQuizzes.filter(q => q.type === 'final_exam');

  // Fetch enrollment
  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', user?.email, courseId],
    queryFn: () => base44.entities.Enrollment.filter({ 
      course_id: courseId,
      user_email: user?.email 
    }),
    enabled: !!user && !!courseId,
  });

  const enrollment = enrollments[0];

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      const enrollmentData = {
        course_id: courseId,
        user_email: user.email,
        status: 'in_progress',
        started_date: new Date().toISOString(),
      };
      const enrollment = await base44.entities.Enrollment.create(enrollmentData);
      
      // Send notification
      await notifyEnrollmentConfirmation(user.email, course);
      
      return enrollment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success('¡Inscripción exitosa!');
    },
  });

  // Update course status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus) => {
      return await base44.entities.Course.update(courseId, {
        status: newStatus
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Estado del curso actualizado');
    },
  });

  // Complete course mutation
  const completeMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Enrollment.update(enrollment.id, {
        status: 'completed',
        progress_percent: 100,
        completed_date: new Date().toISOString(),
        score: 100,
      });

      // Send completion notification
      await notifyCourseCompletion(user.email, course, 100);

      // Generate certificate for all completed courses
      const certNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const expiryDate = course.certification_validity_days 
        ? new Date(Date.now() + course.certification_validity_days * 24 * 60 * 60 * 1000).toISOString()
        : null;
      
      const cert = await base44.entities.Certificate.create({
        course_id: courseId,
        user_email: user.email,
        certificate_number: certNumber,
        issued_date: new Date().toISOString(),
        expiry_date: expiryDate,
        status: 'active',
        score: 100,
      });
      
      // Send certificate notification
      await notifyCertificateIssued(user.email, course, cert.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      await queryClient.invalidateQueries({ queryKey: ['certificates'] });
      
      // Award points and update stats
      await awardPoints(user.email, POINTS.COURSE_COMPLETE, '¡Curso completado!');
      await incrementStat(user.email, 'courses_completed');
      await checkAndAwardBadges(user.email);
      
      toast.success(course.requires_certification ? '¡Curso completado! Certificado generado.' : '¡Curso completado!');
    },
  });

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Curso no encontrado</p>
        </div>
      </div>
    );
  }

  const typeColors = {
    video: 'bg-red-50 text-red-700 border-red-200',
    scorm: 'bg-blue-50 text-blue-700 border-blue-200',
    xapi: 'bg-purple-50 text-purple-700 border-purple-200',
    microlearning: 'bg-green-50 text-green-700 border-green-200',
    evaluation: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  const categoryColors = {
    operacion: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    mantenimiento: 'bg-violet-50 text-violet-700 border-violet-200',
    seguridad: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    calidad: 'bg-amber-50 text-amber-700 border-amber-200',
    tecnico: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-6xl mx-auto p-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('Courses'))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a capacitaciones
        </Button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 p-8 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Badge className={typeColors[course.type]}>
                  {course.type}
                </Badge>
                <Badge className={categoryColors[course.category]}>
                  {course.category}
                </Badge>
                {course.requires_certification && (
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                    <Award className="w-3 h-3 mr-1" />
                    Certificación
                  </Badge>
                )}
                <Badge className={course.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}>
                  {course.status === 'published' ? 'Publicado' : 'En Desarrollo'}
                </Badge>
              </div>

              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-3xl font-bold text-slate-900 flex-1">
                  {course.title}
                </h1>
                {user?.role === 'admin' && (
                  <Button
                    variant={course.status === 'published' ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => updateStatusMutation.mutate(
                      course.status === 'published' ? 'draft' : 'published'
                    )}
                    disabled={updateStatusMutation.isPending}
                  >
                    {course.status === 'published' ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Despublicar
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Publicar
                      </>
                    )}
                  </Button>
                )}
              </div>
              <p className="text-slate-600 mb-6">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {course.duration_minutes} minutos
                </div>
                {course.passing_score && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Puntaje mínimo: {course.passing_score}%
                  </div>
                )}
              </div>
            </div>

            <div className="lg:w-80">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tu Progreso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {enrollment ? (
                    <>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Progreso</span>
                          <span className="font-semibold">{enrollment.progress_percent}%</span>
                        </div>
                        <Progress value={enrollment.progress_percent} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Estado:</span>
                          <Badge>
                            {enrollment.status === 'completed' ? 'Completado' : 
                             enrollment.status === 'in_progress' ? 'En Progreso' : 'Inscrito'}
                          </Badge>
                        </div>
                        {enrollment.score && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Puntaje:</span>
                            <span className="font-semibold">{enrollment.score}%</span>
                          </div>
                        )}
                      </div>

                      {enrollment.status === 'completed' && (
                        <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <p className="text-sm font-medium text-green-900">
                              ¡Curso completado!
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Button 
                      className="w-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      onClick={() => enrollMutation.mutate()}
                    >
                      Inscribirse Ahora
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
            <TabsList className="bg-white border border-slate-200 p-1">
              <TabsTrigger value="content">Contenido</TabsTrigger>
              <TabsTrigger value="quizzes">
                <Brain className="w-4 h-4 mr-2" />
                Quizzes ({quizzes.length})
              </TabsTrigger>
              <TabsTrigger value="final_exam">
                <Award className="w-4 h-4 mr-2" />
                Evaluación Final
              </TabsTrigger>
              <TabsTrigger value="discussion">
                <MessageSquare className="w-4 h-4 mr-2" />
                Foro
              </TabsTrigger>
              <TabsTrigger value="resources">Recursos</TabsTrigger>
              <TabsTrigger value="details">Detalles</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              {enrollment ? (
                <>
                  {/* Content Header */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 rounded-2xl p-8 text-white"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold">Contenido del Curso</h2>
                            <p className="text-indigo-100 text-sm">
                              {course.type === 'xapi' ? 'Contenido interactivo xAPI/cmi5' : 'Lecciones y módulos'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-200" />
                            <span className="text-indigo-100">{course.duration_minutes} minutos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-indigo-200" />
                            <span className="text-indigo-100">{enrollment.progress_percent}% completado</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                        <div className="text-center">
                          <div className="text-3xl font-bold mb-1">{enrollment.progress_percent}%</div>
                          <div className="text-xs text-indigo-100 uppercase tracking-wider">Progreso Total</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Progress value={enrollment.progress_percent} className="h-2 bg-white/20" />
                    </div>
                  </motion.div>

                  {/* Content Body */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {course.type === 'xapi' ? (
                      <Card className="border-2 border-slate-200 shadow-lg">
                        <CardContent className="p-6">
                          <XAPIViewer
                            contentUrl={course.content_url}
                            courseId={courseId}
                            enrollment={enrollment}
                            onProgressUpdate={(progress) => {
                              base44.entities.Enrollment.update(enrollment.id, {
                                progress_percent: progress,
                                status: progress === 100 ? 'completed' : 'in_progress'
                              }).then(() => {
                                queryClient.invalidateQueries({ queryKey: ['enrollments'] });
                                if (progress === 100) {
                                  setAllLessonsCompleted(true);
                                  if (enrollment.status !== 'completed') {
                                    completeMutation.mutate();
                                  }
                                }
                              });
                            }}
                          />
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-6">
                        <LessonList 
                          courseId={courseId} 
                          user={user}
                          onAllLessonsCompleted={() => {
                            setAllLessonsCompleted(true);
                          }}
                        onProgressUpdate={(progress) => {
                            // Si progreso alcanza 100% y no hay examen final, completar el curso y generar certificado
                            if (progress === 100 && finalExams.length === 0 && enrollment.status !== 'completed') {
                              setTimeout(() => {
                                completeMutation.mutate();
                              }, 1000);
                            }
                          }}
                        />
                      </div>
                    )}
                  </motion.div>
                </>
              ) : (
                <Card className="border-2 border-indigo-100">
                  <CardContent className="py-16 text-center">
                    <div className="mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-10 h-10 text-indigo-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      Comienza tu Aprendizaje
                    </h3>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                      Inscríbete en este curso para acceder a todo el contenido educativo, 
                      lecciones interactivas y materiales de aprendizaje.
                    </p>
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg hover:shadow-xl transition-all"
                      onClick={() => enrollMutation.mutate()}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Inscribirse Ahora
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información Detallada</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Descripción</h3>
                    <p className="text-slate-600">{course.description || 'Sin descripción'}</p>
                  </div>
                  
                  {course.target_roles && course.target_roles.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Roles Objetivo</h3>
                      <div className="flex flex-wrap gap-2">
                        {course.target_roles.map((role, i) => (
                          <Badge key={i} variant="outline">{role}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-slate-500">Duración</p>
                      <p className="font-semibold">{course.duration_minutes} min</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Puntaje Aprobación</p>
                      <p className="font-semibold">{course.passing_score}%</p>
                    </div>
                    {course.certification_validity_days && (
                      <div>
                        <p className="text-sm text-slate-500">Validez Certificación</p>
                        <p className="font-semibold">{course.certification_validity_days} días</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quizzes" className="space-y-4">
              {!enrollment ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">Inscríbete para acceder a los quizzes</p>
                    <Button 
                      className="bg-gradient-to-r from-indigo-500 to-violet-500"
                      onClick={() => enrollMutation.mutate()}
                    >
                      Inscribirse Ahora
                    </Button>
                  </CardContent>
                </Card>
              ) : quizzes.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-slate-500">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>No hay quizzes disponibles para este curso</p>
                  </CardContent>
                </Card>
              ) : (
                quizzes.map((quiz, index) => (
                  <Card key={quiz.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Quiz {index + 1}: {quiz.title}</CardTitle>
                        <Badge>
                          {quiz.questions?.length || 0} preguntas
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <QuizViewer 
                        quiz={quiz} 
                        user={user} 
                        onComplete={() => {}} 
                      />
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="final_exam" className="space-y-4">
              {!enrollment ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">Inscríbete para acceder a la evaluación final</p>
                    <Button 
                      className="bg-gradient-to-r from-indigo-500 to-violet-500"
                      onClick={() => enrollMutation.mutate()}
                    >
                      Inscribirse Ahora
                    </Button>
                  </CardContent>
                </Card>
              ) : !allLessonsCompleted && enrollment.progress_percent < 100 ? (
              <Card>
              <CardContent className="py-12 text-center">
              <Award className="w-12 h-12 text-amber-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">Completa todas las lecciones y quizzes primero</p>
              <p className="text-sm text-slate-500">La evaluación final estará disponible una vez completes todo el contenido</p>
              </CardContent>
              </Card>
              ) : finalExams.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-slate-500">
                    <Award className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>No hay evaluación final configurada para este curso</p>
                  </CardContent>
                </Card>
              ) : (
                finalExams.map((exam, index) => (
                  <Card key={exam.id} className="border-2 border-indigo-200">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <Award className="w-6 h-6 text-indigo-600" />
                            {exam.title}
                          </CardTitle>
                          {exam.description && (
                            <p className="text-sm text-slate-600 mt-1">{exam.description}</p>
                          )}
                        </div>
                        <Badge className="bg-indigo-600">
                          {exam.questions?.length || 0} preguntas
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <QuizViewer 
                        quiz={exam} 
                        user={user} 
                        onComplete={() => {
                          if (enrollment.status !== 'completed') {
                            setTimeout(() => {
                              completeMutation.mutate();
                            }, 1500);
                          }
                        }} 
                      />
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="discussion" className="space-y-4">
              {user ? (
                <DiscussionForum courseId={courseId} user={user} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-slate-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Debes inscribirte para participar en el foro</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <ExternalResources resources={course.external_resources} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}