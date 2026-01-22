import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, Users, Clock, 
  CheckCircle, Award, BookOpen, AlertCircle 
} from 'lucide-react';

export default function CourseProgressOverview({ courses }) {
  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.entities.Enrollment.list('-created_date'),
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['all-lessons'],
    queryFn: () => base44.entities.Lesson.list(),
  });

  const { data: lessonProgress = [] } = useQuery({
    queryKey: ['all-lesson-progress'],
    queryFn: () => base44.entities.LessonProgress.list(),
  });

  // Calculate course stats
  const getCourseStats = (courseId) => {
    const courseEnrollments = enrollments.filter(e => e.course_id === courseId);
    const courseLessons = lessons.filter(l => l.course_id === courseId);
    const completed = courseEnrollments.filter(e => e.status === 'completed').length;
    const inProgress = courseEnrollments.filter(e => e.status === 'in_progress').length;
    const avgProgress = courseEnrollments.length > 0
      ? Math.round(courseEnrollments.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / courseEnrollments.length)
      : 0;
    const avgScore = courseEnrollments.filter(e => e.score).length > 0
      ? Math.round(courseEnrollments.reduce((sum, e) => sum + (e.score || 0), 0) / courseEnrollments.filter(e => e.score).length)
      : null;

    return {
      totalStudents: courseEnrollments.length,
      completed,
      inProgress,
      notStarted: courseEnrollments.filter(e => e.status === 'enrolled').length,
      avgProgress,
      avgScore,
      totalLessons: courseLessons.length,
      completionRate: courseEnrollments.length > 0 ? Math.round((completed / courseEnrollments.length) * 100) : 0
    };
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Cursos</p>
                <p className="text-3xl font-bold text-slate-900">{courses.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Inscripciones Totales</p>
                <p className="text-3xl font-bold text-slate-900">{enrollments.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Lecciones Totales</p>
                <p className="text-3xl font-bold text-slate-900">{lessons.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50">
                <BookOpen className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Progress Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Progreso por Curso</h3>
        
        {courses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No hay cursos creados aún</p>
            </CardContent>
          </Card>
        ) : (
          courses.map(course => {
            const stats = getCourseStats(course.id);
            return (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{course.title}</CardTitle>
                      <p className="text-sm text-slate-500">{course.category}</p>
                    </div>
                    <Badge 
                      variant={course.status === 'published' ? 'default' : 'secondary'}
                    >
                      {course.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-slate-500" />
                        <p className="text-xs text-slate-600">Estudiantes</p>
                      </div>
                      <p className="text-xl font-bold text-slate-900">{stats.totalStudents}</p>
                    </div>

                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <p className="text-xs text-green-700">Completados</p>
                      </div>
                      <p className="text-xl font-bold text-green-700">{stats.completed}</p>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-blue-700">En Progreso</p>
                      </div>
                      <p className="text-xl font-bold text-blue-700">{stats.inProgress}</p>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-amber-600" />
                        <p className="text-xs text-amber-700">Lecciones</p>
                      </div>
                      <p className="text-xl font-bold text-amber-700">{stats.totalLessons}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Progreso Promedio</span>
                      <span className="font-semibold text-slate-900">{stats.avgProgress}%</span>
                    </div>
                    <Progress value={stats.avgProgress} className="h-2" />
                  </div>

                  {/* Additional Stats */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-slate-700">
                        Tasa de Completación: <span className="font-semibold">{stats.completionRate}%</span>
                      </span>
                    </div>
                    
                    {stats.avgScore !== null && (
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-600" />
                        <span className="text-slate-700">
                          Promedio Calificación: <span className="font-semibold">{stats.avgScore}%</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Warning for low performance */}
                  {stats.avgProgress < 30 && stats.totalStudents > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">Progreso bajo</p>
                        <p className="text-xs text-amber-700">
                          Los estudiantes tienen un progreso promedio bajo. Considera revisar el contenido o enviar recordatorios.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}