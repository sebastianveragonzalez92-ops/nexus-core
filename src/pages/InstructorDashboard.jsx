import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  GraduationCap, Users, MessageSquare, TrendingUp, 
  BarChart3, BookOpen, Award, Layout, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentProgressTable from '../components/instructor/StudentProgressTable';
import QuizAttemptsReview from '../components/instructor/QuizAttemptsReview';
import ForumModeration from '../components/instructor/ForumModeration';
import CourseAnalytics from '../components/instructor/CourseAnalytics';
import CourseContentManager from '../components/instructor/CourseContentManager';
import CourseProgressOverview from '../components/instructor/CourseProgressOverview';
import QuizCreator from '../components/instructor/QuizCreator';

export default function InstructorDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date'),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.entities.Enrollment.list('-created_date'),
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ['all-quiz-attempts'],
    queryFn: () => base44.entities.QuizAttempt.list('-created_date'),
  });

  const { data: discussions = [] } = useQuery({
    queryKey: ['all-discussions'],
    queryFn: () => base44.entities.DiscussionPost.list('-created_date'),
  });

  // Calculate stats
  const totalStudents = new Set(enrollments.map(e => e.user_email)).size;
  const completedCourses = enrollments.filter(e => e.status === 'completed').length;
  const averageScore = quizAttempts.length > 0 
    ? Math.round(quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length)
    : 0;
  const activeDiscussions = discussions.length;

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Acceso Restringido
            </h2>
            <p className="text-slate-600">
              Este panel está disponible solo para instructores y administradores.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Panel del Instructor</h1>
              <p className="text-slate-600">Gestiona cursos, estudiantes y analíticas</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Estudiantes</p>
                    <p className="text-2xl font-bold text-slate-900">{totalStudents}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Cursos Completados</p>
                    <p className="text-2xl font-bold text-slate-900">{completedCourses}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-50">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Promedio Quizzes</p>
                    <p className="text-2xl font-bold text-slate-900">{averageScore}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50">
                    <TrendingUp className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Discusiones Activas</p>
                    <p className="text-2xl font-bold text-slate-900">{activeDiscussions}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 bg-transparent h-auto p-0">
                <TabsTrigger 
                  value="overview"
                  className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-50 data-[state=active]:to-violet-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-200"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-xs font-medium">Vista General</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="analytics"
                  className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-50 data-[state=active]:to-violet-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-200"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-xs font-medium">Analíticas</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="progress"
                  className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-50 data-[state=active]:to-violet-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-200"
                >
                  <Users className="w-5 h-5" />
                  <span className="text-xs font-medium">Estudiantes</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="quizzes"
                  className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-50 data-[state=active]:to-violet-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-200"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-xs font-medium">Quizzes</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="forum"
                  className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-50 data-[state=active]:to-violet-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-200"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-xs font-medium">Foro</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="content"
                  className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-50 data-[state=active]:to-violet-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-200"
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="text-xs font-medium">Contenido</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="evaluations"
                  className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-50 data-[state=active]:to-violet-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-200"
                >
                  <Award className="w-5 h-5" />
                  <span className="text-xs font-medium">Evaluaciones</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="certificates"
                  className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-50 data-[state=active]:to-violet-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-200"
                >
                  <Layout className="w-5 h-5" />
                  <span className="text-xs font-medium">Certificados</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview">
              <CourseProgressOverview courses={courses} />
            </TabsContent>

            <TabsContent value="analytics">
              <CourseAnalytics courses={courses} enrollments={enrollments} quizAttempts={quizAttempts} />
            </TabsContent>

            <TabsContent value="progress">
              <StudentProgressTable courses={courses} enrollments={enrollments} />
            </TabsContent>

            <TabsContent value="quizzes">
              <div className="space-y-6">
                <QuizCreator courses={courses} />
                <QuizAttemptsReview />
              </div>
            </TabsContent>

            <TabsContent value="forum">
              <ForumModeration discussions={discussions} courses={courses} />
            </TabsContent>

            <TabsContent value="content">
              <CourseContentManager courses={courses} />
            </TabsContent>

            <TabsContent value="evaluations">
              <QuizCreator courses={courses} />
            </TabsContent>

            <TabsContent value="certificates">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="w-5 h-5 text-amber-500" />
                    Gestión de Certificados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600">
                    Personaliza las plantillas de certificados que se generan automáticamente cuando los estudiantes completan un curso.
                  </p>
                  <Link to={createPageUrl('CertificateTemplates')}>
                    <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                      <Layout className="w-5 h-5" />
                      Editar Plantillas de Certificados
                    </button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}