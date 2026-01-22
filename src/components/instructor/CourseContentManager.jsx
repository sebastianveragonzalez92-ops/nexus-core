import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Clock, CheckCircle, Sparkles, Video, FileText, File, Search, Filter } from 'lucide-react';
import ModuleLessonManager from './ModuleLessonManager';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CourseContentManager({ courses }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: lessons = [] } = useQuery({
    queryKey: ['all-lessons-overview'],
    queryFn: () => base44.entities.Lesson.list(),
  });

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get lesson count per course
  const getLessonCount = (courseId) => {
    return lessons.filter(l => l.course_id === courseId).length;
  };

  // Get unique categories
  const categories = [...new Set(courses.map(c => c.category).filter(Boolean))];



  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-white shadow-sm">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-2">
                Tipos de Contenido Disponibles
              </h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Texto y artículos enriquecidos</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Video className="w-4 h-4 text-slate-500" />
                  <span>Videos (YouTube, Vimeo, etc.)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <File className="w-4 h-4 text-slate-500" />
                  <span>Documentos PDF</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-700 font-medium">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Escenarios Interactivos</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="published">Publicados</SelectItem>
                  <SelectItem value="draft">Borradores</SelectItem>
                  <SelectItem value="archived">Archivados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Selecciona un Curso</span>
            <Badge variant="outline">{filteredCourses.length} cursos</Badge>
          </CardTitle>
          <CardDescription>
            Selecciona un curso para gestionar sus módulos, lecciones y contenido
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCourses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No hay cursos que coincidan con los filtros</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedCourse?.id === course.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">{course.title}</h3>
                    <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                      {course.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {getLessonCount(course.id)} lecciones
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.duration_minutes || 0} min
                    </span>
                    {course.requires_certification && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        Certificado
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Module & Lesson Management */}
      {selectedCourse && (
        <ModuleLessonManager course={selectedCourse} />
      )}
    </div>
  );
}