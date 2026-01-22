import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Play, CheckCircle, Clock, Award, 
  FileText, Users, BookOpen, Download, Upload, MessageSquare, Brain
} from 'lucide-react';
import QuizViewer from '../components/courses/QuizViewer';
import DiscussionForum from '../components/courses/DiscussionForum';
import ExternalResources from '../components/courses/ExternalResources';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { notifyEnrollmentConfirmation, notifyCourseCompletion, notifyCertificateIssued } from '../components/notifications/notificationHelpers';

export default function CourseDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  
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
  const { data: quizzes = [] } = useQuery({
    queryKey: ['quizzes', courseId],
    queryFn: () => base44.entities.Quiz.filter({ course_id: courseId }, 'order'),
    enabled: !!courseId,
  });

  // Fetch enrollment
  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', user?.email],
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

      if (course.requires_certification) {
        const cert = await base44.entities.Certificate.create({
          course_id: courseId,
          user_email: user.email,
          certificate_number: `CERT-${Date.now()}`,
          issued_date: new Date().toISOString(),
          score: 100,
        });
        
        // Send certificate notification
        await notifyCertificateIssued(user.email, course, cert.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success('¡Curso completado!');
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
              <div className="flex gap-2 mb-4">
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
              </div>

              <h1 className="text-3xl font-bold text-slate-900 mb-3">
                {course.title}
              </h1>
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

                      {enrollment.status === 'completed' ? (
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completado
                        </Button>
                      ) : (
                        <Button 
                          className="w-full"
                          onClick={() => completeMutation.mutate()}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Marcar como Completado
                        </Button>
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
          <Tabs defaultValue="content" className="space-y-4">
            <TabsList className="bg-white border border-slate-200 p-1">
              <TabsTrigger value="content">Contenido</TabsTrigger>
              <TabsTrigger value="quizzes">
                <Brain className="w-4 h-4 mr-2" />
                Quizzes ({quizzes.length})
              </TabsTrigger>
              <TabsTrigger value="discussion">
                <MessageSquare className="w-4 h-4 mr-2" />
                Foro
              </TabsTrigger>
              <TabsTrigger value="resources">Recursos</TabsTrigger>
              <TabsTrigger value="details">Detalles</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contenido del Curso</CardTitle>
                </CardHeader>
                <CardContent>
                  {course.content_url ? (
                    <div className="w-full">
                      {course.type === 'video' || course.content_url.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video 
                          controls 
                          controlsList="nodownload"
                          className="w-full aspect-video rounded-xl bg-slate-900"
                          src={course.content_url}
                        >
                          Tu navegador no soporta video.
                        </video>
                      ) : course.content_url.match(/\.(pdf)$/i) ? (
                        <iframe
                          src={`https://docs.google.com/viewer?url=${encodeURIComponent(course.content_url)}&embedded=true`}
                          className="w-full h-[700px] rounded-xl border border-slate-200"
                          title="Contenido del curso"
                        />
                      ) : course.content_url.includes('youtube.com') || course.content_url.includes('youtu.be') ? (
                        <iframe
                          src={course.content_url.replace('watch?v=', 'embed/')}
                          className="w-full aspect-video rounded-xl border-0"
                          title="Contenido del curso"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : course.content_url.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/i) ? (
                        <iframe
                          src={`https://docs.google.com/viewer?url=${encodeURIComponent(course.content_url)}&embedded=true`}
                          className="w-full h-[700px] rounded-xl border border-slate-200"
                          title="Contenido del curso"
                        />
                      ) : (
                        <iframe
                          src={course.content_url}
                          className="w-full h-[700px] rounded-xl border border-slate-200"
                          title="Contenido del curso"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p>Contenido no disponible aún</p>
                    </div>
                  )}
                </CardContent>
              </Card>
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
              {quizzes.length === 0 ? (
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
                      {user ? (
                        <QuizViewer quiz={quiz} user={user} onComplete={() => {}} />
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <p>Debes inscribirte para realizar el quiz</p>
                        </div>
                      )}
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