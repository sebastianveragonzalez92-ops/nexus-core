import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Users, Award } from 'lucide-react';

export default function CourseAnalytics({ courses, enrollments, quizAttempts }) {
  const getCourseStats = (courseId) => {
    const courseEnrollments = enrollments.filter(e => e.course_id === courseId);
    const totalEnrolled = courseEnrollments.length;
    const completed = courseEnrollments.filter(e => e.status === 'completed').length;
    const inProgress = courseEnrollments.filter(e => e.status === 'in_progress').length;
    const completionRate = totalEnrolled > 0 ? Math.round((completed / totalEnrolled) * 100) : 0;
    
    const courseQuizAttempts = quizAttempts.filter(a => {
      return courseEnrollments.some(e => e.user_email === a.user_email);
    });
    const avgScore = courseQuizAttempts.length > 0
      ? Math.round(courseQuizAttempts.reduce((sum, a) => sum + a.score, 0) / courseQuizAttempts.length)
      : 0;
    
    return {
      totalEnrolled,
      completed,
      inProgress,
      completionRate,
      avgScore,
    };
  };

  const publishedCourses = courses.filter(c => c.status === 'published');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analíticas por Curso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {publishedCourses.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No hay cursos publicados para analizar</p>
            </div>
          ) : (
            publishedCourses.map((course) => {
              const stats = getCourseStats(course.id);
              
              return (
                <div key={course.id} className="p-4 bg-slate-50 rounded-xl">
                  <div className="mb-4">
                    <h3 className="font-semibold text-slate-900 mb-1">{course.title}</h3>
                    <p className="text-sm text-slate-600">{course.category}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Inscritos</p>
                        <p className="text-lg font-bold text-slate-900">{stats.totalEnrolled}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <Award className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Completados</p>
                        <p className="text-lg font-bold text-slate-900">{stats.completed}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-100">
                        <TrendingUp className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">En Progreso</p>
                        <p className="text-lg font-bold text-slate-900">{stats.inProgress}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Puntaje Promedio</p>
                        <p className="text-lg font-bold text-slate-900">{stats.avgScore}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600">Tasa de Finalización</span>
                      <span className="font-semibold text-slate-900">{stats.completionRate}%</span>
                    </div>
                    <Progress value={stats.completionRate} className="h-2" />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}