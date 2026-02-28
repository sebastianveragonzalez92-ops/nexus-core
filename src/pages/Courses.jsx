import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getUserSubscription } from '@/components/subscriptionHelpers';
import FeatureLimitGuard from '@/components/FeatureLimitGuard';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Video, FileText, Award, Search, Filter, Calendar, Grid, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CourseCard from '@/components/courses/CourseCard';
import CourseModal from '@/components/courses/CourseModal';
import CourseCalendar from '@/components/courses/CourseCalendar';

export default function Courses() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then((userData) => {
      setUser(userData);
      if (userData?.email) {
        getUserSubscription(userData.email).then(setSubscription);
      }
    }).catch((error) => {
      console.error('Error al cargar usuario:', error);
    });
  }, []);

  const { data: allCourses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100),
  });

  // Usuarios normales solo ven cursos publicados, admins ven todos
  const courses = user?.role === 'admin' ? allCourses : allCourses.filter(c => c.status === 'published');

  const { data: enrollments = [] } = useQuery({
    queryKey: ['myEnrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: user?.email }),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  // Combinar cursos con enrollments para la vista de calendario
  const enrolledCourses = enrollments.map(enrollment => {
    const course = courses.find(c => c.id === enrollment.course_id);
    return { ...enrollment, course };
  }).filter(e => e.course);

  // Filtrar cursos
  let filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    
    // Filtrar por estado de inscripción si aplica
    if (statusFilter !== 'all') {
      const enrollment = enrollments.find(e => e.course_id === course.id);
      if (!enrollment || enrollment.status !== statusFilter) {
        return false;
      }
    }
    
    return matchesSearch && matchesCategory;
  });

  // Ordenar cursos
  filteredCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_date) - new Date(a.created_date);
      case 'oldest':
        return new Date(a.created_date) - new Date(b.created_date);
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      default:
        return 0;
    }
  });

  const handleEdit = (course) => {
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleAdd = () => {
    if (subscription?.plan === 'free') {
      alert('Los cursos están disponibles solo en plan PRO. Upgradea ahora.');
      navigate(createPageUrl('Pricing'));
      return;
    }
    setEditingCourse(null);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Capacitaciones</h1>
              <p className="text-slate-500 mt-1">Gestiona cursos, evaluaciones y certificaciones</p>
            </div>
            {user?.role === 'admin' && (
              <FeatureLimitGuard 
                subscription={subscription}
                feature="max_courses"
                currentCount={courses.length}
              >
                <Button
                  onClick={handleAdd}
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Capacitación
                </Button>
              </FeatureLimitGuard>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{courses.length}</p>
                  <p className="text-xs text-slate-500">Total Cursos</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50">
                  <Video className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {courses.filter(c => c.status === 'published').length}
                  </p>
                  <p className="text-xs text-slate-500">Publicados</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-50">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {courses.filter(c => c.status === 'draft').length}
                  </p>
                  <p className="text-xs text-slate-500">Borradores</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-50">
                  <Award className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {courses.filter(c => c.requires_certification).length}
                  </p>
                  <p className="text-xs text-slate-500">Con Certificación</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 border border-slate-200 mb-6"
        >
          <div className="flex flex-col gap-4">
            {/* Search and Category */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar capacitaciones..."
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="operacion">Operación</SelectItem>
                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="seguridad">Seguridad</SelectItem>
                  <SelectItem value="calidad">Calidad</SelectItem>
                  <SelectItem value="tecnico">Técnico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort and View Mode */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="font-medium">Ordenar y visualizar</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="enrolled">Pendiente</SelectItem>
                    <SelectItem value="in_progress">En progreso</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-56">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Más recientes</SelectItem>
                    <SelectItem value="oldest">Más antiguos</SelectItem>
                    <SelectItem value="title">Título (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('calendar')}
                >
                  <Calendar className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CourseCalendar enrolledCourses={enrolledCourses} />
          </motion.div>
        )}

        {/* Courses Grid */}
        {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            ))
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                index={index}
                user={user}
                onEdit={handleEdit}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No se encontraron capacitaciones</p>
            </div>
          )}
        </div>
        )}
      </div>

      {showModal && (
        <CourseModal
          course={editingCourse}
          onClose={() => {
            setShowModal(false);
            setEditingCourse(null);
          }}
        />
      )}
    </div>
  );
}