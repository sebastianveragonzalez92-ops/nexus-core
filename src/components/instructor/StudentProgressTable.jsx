import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User, TrendingUp, TrendingDown, Minus, RotateCcw, Edit, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function StudentProgressTable({ courses, enrollments }) {
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resettingEnrollment, setResettingEnrollment] = useState(null);
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

  // Edit enrollment mutation
  const editEnrollmentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Enrollment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-enrollments']);
      toast.success('Inscripción actualizada');
      setShowEditDialog(false);
      setEditingEnrollment(null);
    },
    onError: () => {
      toast.error('Error al actualizar inscripción');
    }
  });

  // Reset enrollment mutation
  const resetEnrollmentMutation = useMutation({
    mutationFn: async (enrollment) => {
      // Reset enrollment
      await base44.entities.Enrollment.update(enrollment.id, {
        status: 'enrolled',
        progress_percent: 0,
        score: null,
        attempts: 0,
        started_date: null,
        completed_date: null,
        time_spent_minutes: 0
      });

      // Delete all lesson progress for this enrollment
      const lessonProgress = await base44.entities.LessonProgress.filter({
        course_id: enrollment.course_id,
        user_email: enrollment.user_email
      });
      
      await Promise.all(
        lessonProgress.map(lp => base44.entities.LessonProgress.delete(lp.id))
      );

      return enrollment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-enrollments']);
      toast.success('Curso reiniciado exitosamente');
      setShowResetDialog(false);
      setResettingEnrollment(null);
    },
    onError: () => {
      toast.error('Error al reiniciar curso');
    }
  });

  const handleEdit = (enrollment) => {
    setEditingEnrollment(enrollment);
    setShowEditDialog(true);
  };

  const handleReset = (enrollment) => {
    setResettingEnrollment(enrollment);
    setShowResetDialog(true);
  };

  const handleSaveEdit = () => {
    if (editingEnrollment) {
      editEnrollmentMutation.mutate({
        id: editingEnrollment.id,
        data: {
          status: editingEnrollment.status,
          progress_percent: editingEnrollment.progress_percent,
          score: editingEnrollment.score,
          attempts: editingEnrollment.attempts
        }
      });
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
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(enrollment)}
                      className="shrink-0"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReset(enrollment)}
                      className="shrink-0 text-amber-600 hover:text-amber-700 border-amber-300 hover:bg-amber-50"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reiniciar
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modificar Inscripción</DialogTitle>
            <DialogDescription>
              Edita el estado y progreso del estudiante {editingEnrollment?.user_email}
            </DialogDescription>
          </DialogHeader>
          
          {editingEnrollment && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Estado</label>
                <Select
                  value={editingEnrollment.status}
                  onValueChange={(value) => setEditingEnrollment({ ...editingEnrollment, status: value })}
                >
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
                  Progreso (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editingEnrollment.progress_percent || 0}
                  onChange={(e) => setEditingEnrollment({ 
                    ...editingEnrollment, 
                    progress_percent: parseInt(e.target.value) || 0 
                  })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Puntaje (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editingEnrollment.score || 0}
                  onChange={(e) => setEditingEnrollment({ 
                    ...editingEnrollment, 
                    score: parseInt(e.target.value) || 0 
                  })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Intentos
                </label>
                <Input
                  type="number"
                  min="0"
                  value={editingEnrollment.attempts || 0}
                  onChange={(e) => setEditingEnrollment({ 
                    ...editingEnrollment, 
                    attempts: parseInt(e.target.value) || 0 
                  })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={editEnrollmentMutation.isPending}
              className="bg-gradient-to-r from-indigo-500 to-violet-500"
            >
              {editEnrollmentMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Reinicio de Curso
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de reiniciar el curso para {resettingEnrollment?.user_email}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                <strong>Advertencia:</strong> Esta acción eliminará todo el progreso del estudiante en este curso, incluyendo:
              </p>
              <ul className="list-disc list-inside text-sm text-amber-800 mt-2 space-y-1">
                <li>Progreso de todas las lecciones</li>
                <li>Puntajes y calificaciones</li>
                <li>Intentos de quizzes</li>
                <li>Tiempo dedicado</li>
              </ul>
            </div>
            
            {resettingEnrollment && (
              <div className="text-sm text-slate-700">
                <p><strong>Curso:</strong> {getCourseName(resettingEnrollment.course_id)}</p>
                <p><strong>Progreso actual:</strong> {resettingEnrollment.progress_percent}%</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => resetEnrollmentMutation.mutate(resettingEnrollment)}
              disabled={resetEnrollmentMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {resetEnrollmentMutation.isPending ? 'Reiniciando...' : 'Sí, Reiniciar Curso'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}