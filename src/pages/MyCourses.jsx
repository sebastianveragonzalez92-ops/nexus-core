import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, Award, Clock, CheckCircle, TrendingUp, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CourseFilters from '@/components/courses/CourseFilters';
import CourseCalendar from '@/components/courses/CourseCalendar';

export default function MyCourses() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sortBy, setSortBy] = useState('recent');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: enrollments = [] } = useQuery({
    queryKey: ['myEnrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: user?.email }),
    enabled: !!user,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['certificates', user?.email],
    queryFn: () => base44.entities.Certificate.filter({ user_email: user?.email }),
    enabled: !!user,
  });

  const enrolledCourses = enrollments.map(enrollment => {
    const course = courses.find(c => c.id === enrollment.course_id);
    return { ...enrollment, course };
  }).filter(e => e.course);

  // Filtrar por estado
  const filteredByStatus = statusFilter === 'all' 
    ? enrolledCourses 
    : enrolledCourses.filter(e => e.status === statusFilter);

  // Ordenar
  const sortedCourses = [...filteredByStatus].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_date) - new Date(a.created_date);
      case 'oldest':
        return new Date(a.created_date) - new Date(b.created_date);
      case 'progress':
        return (b.progress_percent || 0) - (a.progress_percent || 0);
      case 'title':
        return (a.course?.title || '').localeCompare(b.course?.title || '');
      case 'completion':
        if (!a.completed_date && !b.completed_date) return 0;
        if (!a.completed_date) return 1;
        if (!b.completed_date) return -1;
        return new Date(b.completed_date) - new Date(a.completed_date);
      default:
        return 0;
    }
  });

  const inProgress = sortedCourses.filter(e => e.status === 'in_progress');
  const completed = sortedCourses.filter(e => e.status === 'completed');

  const avgProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / enrolledCourses.length)
    : 0;

  // Eliminar certificados duplicados
  const uniqueCertificates = certificates.reduce((acc, cert) => {
    const exists = acc.find(c => c.course_id === cert.course_id && c.user_email === cert.user_email);
    if (!exists) acc.push(cert);
    return acc;
  }, []).sort((a, b) => new Date(b.issued_date) - new Date(a.issued_date));



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Mis Capacitaciones</h1>
          <p className="text-slate-500">Seguimiento de tu progreso y certificaciones</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{enrolledCourses.length}</p>
                  <p className="text-xs text-slate-500">Cursos Inscritos</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-50">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inProgress.length}</p>
                  <p className="text-xs text-slate-500">En Progreso</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completed.length}</p>
                  <p className="text-xs text-slate-500">Completados</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-50">
                   <Award className="w-5 h-5 text-violet-600" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{uniqueCertificates.length}</p>
                   <p className="text-xs text-slate-500">Certificados</p>
                 </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <CourseFilters
          sortBy={sortBy}
          onSortChange={setSortBy}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <CourseCalendar enrolledCourses={enrolledCourses} />
          </motion.div>
        )}

        {/* In Progress Courses */}
        {viewMode === 'grid' && (
          <>
        {inProgress.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">En Progreso</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {inProgress.map((enrollment, index) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg">{enrollment.course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Progreso</span>
                          <span className="font-semibold">{enrollment.progress_percent}%</span>
                        </div>
                        <Progress value={enrollment.progress_percent} className="h-2" />
                      </div>

                      <Button 
                        className="w-full"
                        onClick={() => navigate(createPageUrl('CourseDetail') + `?id=${enrollment.course_id}`)}
                      >
                        Continuar
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Completed Courses */}
        {completed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Completados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {completed.map((enrollment, index) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card className="border-emerald-200 bg-emerald-50/30">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg flex-1">{enrollment.course.title}</CardTitle>
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {enrollment.score && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Puntaje:</span>
                          <span className="font-semibold">{enrollment.score}%</span>
                        </div>
                      )}
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(createPageUrl('CourseDetail') + `?id=${enrollment.course_id}`)}
                      >
                        Ver Detalles
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Certificates */}
        {uniqueCertificates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Certificados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {uniqueCertificates.map((cert, index) => {
                const course = courses.find(c => c.id === cert.course_id);
                return (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Card className="border-purple-200 bg-purple-50/30">
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-5 h-5 text-purple-600" />
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                            Certificado
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{course?.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-600">N°:</span>
                            <span className="font-mono text-xs">{cert.certificate_number}</span>
                          </div>
                          {cert.score && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Puntaje:</span>
                              <span className="font-semibold">{cert.score}%</span>
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate(createPageUrl('Certificates'))}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Ver Certificado
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
          </>
        )}

        {/* Empty State */}
        {enrolledCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">No hay capacitaciones</h3>
            <p className="text-slate-500 mb-6">Comienza inscribiéndote en un curso</p>
            <Button onClick={() => navigate(createPageUrl('Courses'))}>
              Explorar Cursos
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}