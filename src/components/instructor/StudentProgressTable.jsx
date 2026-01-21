import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function StudentProgressTable({ courses, enrollments }) {
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');

  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = e.user_email.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || e.course_id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const getCourseName = (courseId) => {
    return courses.find(c => c.id === courseId)?.title || 'Curso desconocido';
  };

  const getStatusBadge = (status) => {
    const config = {
      enrolled: { label: 'Inscrito', className: 'bg-blue-100 text-blue-700' },
      in_progress: { label: 'En Progreso', className: 'bg-amber-100 text-amber-700' },
      completed: { label: 'Completado', className: 'bg-green-100 text-green-700' },
      failed: { label: 'Fallado', className: 'bg-red-100 text-red-700' },
      expired: { label: 'Expirado', className: 'bg-slate-100 text-slate-700' },
    };
    const { label, className } = config[status] || config.enrolled;
    return <Badge className={className}>{label}</Badge>;
  };

  const getProgressIcon = (progress) => {
    if (progress >= 75) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (progress >= 40) return <Minus className="w-4 h-4 text-amber-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progreso de Estudiantes</CardTitle>
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
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filtrar por curso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los cursos</SelectItem>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredEnrollments.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <User className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No hay inscripciones para mostrar</p>
            </div>
          ) : (
            filteredEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">{enrollment.user_email}</p>
                        <p className="text-sm text-slate-600">{getCourseName(enrollment.course_id)}</p>
                      </div>
                      {getStatusBadge(enrollment.status)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-600">Progreso</span>
                            <span className="font-semibold">{enrollment.progress_percent || 0}%</span>
                          </div>
                          <Progress value={enrollment.progress_percent || 0} className="h-2" />
                        </div>
                        {getProgressIcon(enrollment.progress_percent || 0)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {enrollment.score && (
                          <span>Puntaje: <strong>{enrollment.score}%</strong></span>
                        )}
                        {enrollment.attempts && (
                          <span>Intentos: <strong>{enrollment.attempts}</strong></span>
                        )}
                        {enrollment.started_date && (
                          <span>
                            Iniciado {formatDistanceToNow(new Date(enrollment.started_date), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                        )}
                        {enrollment.time_spent_minutes && (
                          <span>Tiempo: <strong>{enrollment.time_spent_minutes} min</strong></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}