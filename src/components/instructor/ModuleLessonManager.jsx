import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff, Video, FileText, File } from 'lucide-react';
import { toast } from 'sonner';
import LessonEditor from './LessonEditor';

export default function ModuleLessonManager({ course }) {
  const [showEditor, setShowEditor] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const queryClient = useQueryClient();

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', course?.id],
    queryFn: () => base44.entities.Lesson.filter({ course_id: course.id }, 'order'),
    enabled: !!course?.id
  });

  const saveLessonMutation = useMutation({
    mutationFn: (data) => {
      if (editingLesson?.id) {
        return base44.entities.Lesson.update(editingLesson.id, data);
      }
      return base44.entities.Lesson.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons', course.id]);
      setShowEditor(false);
      setEditingLesson(null);
      toast.success('Lección guardada');
    },
    onError: () => {
      toast.error('Error al guardar lección');
    }
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (id) => base44.entities.Lesson.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons', course.id]);
      toast.success('Lección eliminada');
    }
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, is_published }) => base44.entities.Lesson.update(id, { is_published }),
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons', course.id]);
    }
  });

  const handleDelete = (lesson) => {
    if (confirm(`¿Eliminar la lección "${lesson.title}"?`)) {
      deleteLessonMutation.mutate(lesson.id);
    }
  };

  // Group lessons by module
  const moduleGroups = lessons.reduce((acc, lesson) => {
    const moduleName = lesson.module_name || 'Sin Módulo';
    if (!acc[moduleName]) {
      acc[moduleName] = [];
    }
    acc[moduleName].push(lesson);
    return acc;
  }, {});

  const getContentIcon = (type) => {
    switch(type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'pdf': return <File className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{course.title}</h3>
          <p className="text-slate-600 text-sm">Gestiona los módulos y lecciones del curso</p>
        </div>
        <Button
          onClick={() => {
            setEditingLesson(null);
            setShowEditor(true);
          }}
          className="bg-gradient-to-r from-indigo-500 to-violet-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Lección
        </Button>
      </div>

      {/* Modules and Lessons */}
      {Object.entries(moduleGroups).length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No hay lecciones</h3>
            <p className="text-slate-500 mb-4">Crea la primera lección para este curso</p>
            <Button onClick={() => setShowEditor(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Lección
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(moduleGroups).map(([moduleName, moduleLessons]) => (
            <Card key={moduleName}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GripVertical className="w-5 h-5 text-slate-400" />
                  {moduleName}
                  <Badge variant="outline">{moduleLessons.length} lecciones</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {moduleLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                      {getContentIcon(lesson.content_type)}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{lesson.title}</p>
                        {lesson.description && (
                          <p className="text-sm text-slate-500">{lesson.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={lesson.is_published ? 'default' : 'secondary'}>
                          {lesson.is_published ? 'Publicada' : 'Borrador'}
                        </Badge>
                        {lesson.video_duration_minutes > 0 && (
                          <Badge variant="outline">{lesson.video_duration_minutes} min</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        onClick={() => togglePublishMutation.mutate({ 
                          id: lesson.id, 
                          is_published: !lesson.is_published 
                        })}
                        variant="ghost"
                        size="icon"
                        title={lesson.is_published ? 'Ocultar' : 'Publicar'}
                      >
                        {lesson.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingLesson(lesson);
                          setShowEditor(true);
                        }}
                        variant="ghost"
                        size="icon"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(lesson)}
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={(open) => {
        if (!open) {
          setShowEditor(false);
          setEditingLesson(null);
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'Editar Lección' : 'Nueva Lección'}
            </DialogTitle>
          </DialogHeader>
          <LessonEditor
            lesson={editingLesson}
            courseId={course.id}
            onSave={(data) => saveLessonMutation.mutate(data)}
            onCancel={() => {
              setShowEditor(false);
              setEditingLesson(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}