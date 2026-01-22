import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, Users, Zap, Clock, MessageSquare } from 'lucide-react';
import { format, startOfDay, subDays } from 'date-fns';

export default function EnhancedAnalytics({ courses, enrollments, quizAttempts }) {
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Fetch additional data
  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => base44.entities.Lesson.list(),
  });

  const { data: lessonProgress = [] } = useQuery({
    queryKey: ['lesson-progress'],
    queryFn: () => base44.entities.LessonProgress.list(),
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => base44.entities.Quiz.list(),
  });

  const { data: discussions = [] } = useQuery({
    queryKey: ['discussions'],
    queryFn: () => base44.entities.DiscussionPost.list(),
  });

  // Calculate completion trends
  const completionTrends = useMemo(() => {
    const trends = {};
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = format(subDays(new Date(), 29 - i), 'MMM dd');
      return { date, completed: 0, total: 0 };
    });

    enrollments.forEach(e => {
      if (e.completed_date) {
        const date = format(new Date(e.completed_date), 'MMM dd');
        const dayData = last30Days.find(d => d.date === date);
        if (dayData) dayData.completed++;
      }
    });

    last30Days.forEach(day => {
      day.total = Math.max(enrollments.filter(e => e.created_date && 
        format(new Date(e.created_date), 'MMM dd') <= day.date
      ).length, day.completed);
    });

    return last30Days;
  }, [enrollments]);

  // Identify challenging quizzes
  const challengingQuizzes = useMemo(() => {
    return quizzes.map(quiz => {
      const attempts = quizAttempts.filter(a => a.quiz_id === quiz.id);
      const avgScore = attempts.length > 0 
        ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
        : 0;
      const passRate = attempts.length > 0
        ? Math.round((attempts.filter(a => a.passed).length / attempts.length) * 100)
        : 0;
      
      return {
        ...quiz,
        attempts: attempts.length,
        avgScore,
        passRate,
        difficulty: avgScore < 50 ? 'high' : avgScore < 70 ? 'medium' : 'low'
      };
    }).filter(q => q.attempts > 0)
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 5);
  }, [quizzes, quizAttempts]);

  // Calculate engagement metrics
  const engagementMetrics = useMemo(() => {
    const avgTimePerLesson = lessonProgress.length > 0
      ? Math.round(lessonProgress.reduce((sum, lp) => sum + (lp.time_spent_minutes || 0), 0) / lessonProgress.length)
      : 0;
    
    const avgForumPosts = enrollments.length > 0
      ? Math.round(discussions.length / new Set(enrollments.map(e => e.user_email)).size)
      : 0;
    
    const mostActiveUsers = Array.from(new Set(lessonProgress.map(lp => lp.user_email)))
      .map(email => ({
        email,
        timeSpent: lessonProgress.filter(lp => lp.user_email === email)
          .reduce((sum, lp) => sum + (lp.time_spent_minutes || 0), 0),
        forumPosts: discussions.filter(d => d.user_email === email).length,
        lessonsCompleted: lessonProgress.filter(lp => lp.user_email === email && lp.completed).length
      }))
      .sort((a, b) => b.timeSpent - a.timeSpent)
      .slice(0, 5);

    return { avgTimePerLesson, avgForumPosts, mostActiveUsers };
  }, [lessonProgress, discussions, enrollments]);

  // Challenging lessons
  const challengingLessons = useMemo(() => {
    return lessons.map(lesson => {
      const progress = lessonProgress.filter(lp => lp.lesson_id === lesson.id);
      const completed = progress.filter(lp => lp.completed).length;
      const avgTime = progress.length > 0
        ? Math.round(progress.reduce((sum, lp) => sum + (lp.time_spent_minutes || 0), 0) / progress.length)
        : 0;
      const completionRate = progress.length > 0
        ? Math.round((completed / progress.length) * 100)
        : 0;
      
      return {
        ...lesson,
        attempts: progress.length,
        completionRate,
        avgTime,
      };
    }).filter(l => l.attempts > 0)
      .sort((a, b) => a.completionRate - b.completionRate)
      .slice(0, 5);
  }, [lessons, lessonProgress]);

  const publishedCourses = courses.filter(c => c.status === 'published');
  const activeCourse = selectedCourseId ? publishedCourses.find(c => c.id === selectedCourseId) : null;

  return (
    <div className="space-y-6">
      {/* Completion Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Tendencias de Finalización (Últimos 30 días)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={completionTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                formatter={(value) => [value, 'Cursos Completados']}
              />
              <Line type="monotone" dataKey="completed" stroke="#4f46e5" strokeWidth={2} dot={{ fill: '#4f46e5', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Challenging Quizzes & Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quizzes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Quizzes Más Desafiantes
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">Basado en puntajes bajos de estudiantes</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {challengingQuizzes.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">Sin datos de quizzes</p>
            ) : (
              challengingQuizzes.map((quiz, idx) => (
                <div key={quiz.id} className="p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-900">{idx + 1}. {quiz.title}</span>
                        <Badge className={`text-xs ${
                          quiz.difficulty === 'high' ? 'bg-red-100 text-red-700' :
                          quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {quiz.difficulty === 'high' ? 'Muy Difícil' : quiz.difficulty === 'medium' ? 'Moderado' : 'Fácil'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">{quiz.attempts} intentos</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{quiz.avgScore}%</p>
                      <p className="text-xs text-slate-600">{quiz.passRate}% aprobados</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        quiz.passRate >= 70 ? 'bg-green-500' : quiz.passRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${quiz.passRate}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Challenging Lessons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Lecciones Menos Completadas
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">Basado en tasa de finalización</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {challengingLessons.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">Sin datos de lecciones</p>
            ) : (
              challengingLessons.map((lesson, idx) => (
                <div key={lesson.id} className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 mb-1">{idx + 1}. {lesson.title}</p>
                      <p className="text-xs text-slate-600">{lesson.attempts} estudiantes | ⏱ {lesson.avgTime} min promedio</p>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{lesson.completionRate}%</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        lesson.completionRate >= 70 ? 'bg-green-500' : lesson.completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${lesson.completionRate}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Patrones de Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-600">Tiempo Promedio/Lección</p>
                  <p className="text-2xl font-bold text-slate-900">{engagementMetrics.avgTimePerLesson} min</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs text-slate-600">Posts Foro/Estudiante</p>
                  <p className="text-2xl font-bold text-slate-900">{engagementMetrics.avgForumPosts}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-slate-600">Usuarios Activos</p>
                  <p className="text-2xl font-bold text-slate-900">{engagementMetrics.mostActiveUsers.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Most Active Users */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Estudiantes Más Activos</h4>
            <div className="space-y-2">
              {engagementMetrics.mostActiveUsers.map((user, idx) => (
                <div key={user.email} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{idx + 1}. {user.email}</p>
                    <p className="text-xs text-slate-600">⏱ {user.timeSpent} min | 💬 {user.forumPosts} posts | ✓ {user.lessonsCompleted} lecciones</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}