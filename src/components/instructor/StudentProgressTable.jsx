import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Search, User, TrendingUp, TrendingDown, Minus, MoreVertical, RotateCcw, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function StudentProgressTable({ courses, enrollments }) {
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [editProgress, setEditProgress] = useState(0);
  const [editStatus, setEditStatus] = useState('enrolled');
  const queryClient = useQueryClient();

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

  const resetEnrollmentMutation = useMutation({
    mutationFn: async (enrollmentId) => {
      // Reset enrollment to initial state
      await base44.entities.Enrollment.update(enrollmentId, {
        status: 'enrolled',
        progress_percent: 0,
        score: null,
        attempts: 0,
        started_date: null,
        completed_date: null,
        time_spent_minutes: 0
      });
      
      // Also delete all lesson progress for this enrollment
      const enrollment = enrollments.find(e => e.id === enrollmentId);
      if (enrollment) {
        const lessonProgress = await base44.entities.LessonProgress.filter({
          user_email: enrollment.user_email,
          course_id: enrollment.course_id
        });
        await Promise.all(lessonProgress.map(lp => base44.entities.LessonProgress.delete(lp.id)));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-enrollments']);
      toast.success('Progreso reiniciado exitosamente');
    },
    onError: () => {
      toast.error('Error al reiniciar progreso');
    }
  });

  const updateEnrollmentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Enrollment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-enrollments']);
      setEditingEnrollment(null);
      toast.success('Inscripción actualizada');
    },
    onError: () => {
      toast.error('Error al actualizar inscripción');
    }
  });

  const deleteEnrollmentMutation = useMutation({
    mutationFn: (id) => base44.entities.Enrollment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-enrollments']);
      toast.success('Inscripción eliminada');
    },
    onError: () => {
      toast.error('Error al eliminar inscripción');
    }
  });

  const handleEdit = (enrollment) => {
    setEditingEnrollment(enrollment);
    setEditProgress(enrollment.progress_percent || 0);
    setEditStatus(enrollment.status);
  };

  const handleSaveEdit = () => {
    updateEnrollmentMutation.mutate({
      id: editingEnrollment.id,
      data: {
        progress_percent: editProgress,
        status: editStatus
      }
    });
  };

  const handleReset = (enrollmentId) => {
    if (confirm('¿Estás seguro de reiniciar el progreso de este estudiante? Esta acción eliminará todo su progreso en el curso.')) {
      resetEnrollmentMutation.mutate(enrollmentId);
    }
  };

  const handleDelete = (enrollmentId) => {
    if (confirm('¿Estás seguro de eliminar esta inscripción? Esta acción no se puede deshacer.')) {
      deleteEnrollmentMutation.mutate(enrollmentId);
    }
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
                      <div className="flex items-center gap-2">
                        {getStatusBadge(enrollment.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(enrollment)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar Progreso
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReset(enrollment.id)}>
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Reiniciar Curso
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(enrollment.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar Inscripción
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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

      {/* Edit Dialog */}
      <Dialog open={!!editingEnrollment} onOpenChange={(open) => !open && setEditingEnrollment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Progreso del Estudiante</DialogTitle>
            <DialogDescription>
              Modifica el progreso y estado de la inscripción de {editingEnrollment?.user_email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Estado de la Inscripción
              </label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enrolled">Inscrito</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="failed">Fallado</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Progreso: {editProgress}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={editProgress}
                onChange={(e) => setEditProgress(parseInt(e.target.value))}
                className="w-full"
              />
              <Progress value={editProgress} className="h-2 mt-2" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEnrollment(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={updateEnrollmentMutation.isPending}
              className="bg-gradient-to-r from-indigo-500 to-violet-500"
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}