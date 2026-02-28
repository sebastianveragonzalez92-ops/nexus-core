import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layers, Activity, RefreshCw, Zap, TrendingUp, BookOpen, Users, Award, Wrench, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import StatsCard from '@/components/ui/StatsCard';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ModulesGrid from '@/components/dashboard/ModulesGrid';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import SyncPanel from '@/components/dashboard/SyncPanel';
import ModuleModal from '@/components/modals/ModuleModal';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import StockAlertsBanner from '@/components/spareparts/StockAlertsBanner';

export default function Dashboard() {
  console.log('🚀 Dashboard: Componente iniciando...');
  
  const [user, setUser] = useState(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showSyncPanel, setShowSyncPanel] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('🔵 Dashboard: useEffect de usuario ejecutándose');
    base44.auth.me()
      .then((userData) => {
        console.log('✅ Dashboard: Usuario cargado:', userData);
        setUser(userData);
      })
      .catch((error) => {
        console.error('❌ Dashboard: Error al cargar usuario:', error);
        setUser(null);
      });
  }, []);

  console.log('🟢 Dashboard: Estado del usuario:', user);

  // Modules query
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      console.log('📦 Dashboard: Cargando módulos...');
      try {
        const result = await base44.entities.Module.list('-created_date');
        console.log('✅ Dashboard: Módulos cargados:', result?.length || 0);
        return result;
      } catch (error) {
        console.error('❌ Dashboard: Error cargando módulos:', error);
        return [];
      }
    },
  });

  // Activity query
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 10),
  });

  // Sync queue query
  const { data: syncQueue = [], isLoading: syncLoading } = useQuery({
    queryKey: ['syncQueue'],
    queryFn: () => base44.entities.SyncQueue.list('-created_date'),
  });

  // Courses query
  const { data: allCourses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 50),
  });

  // Filter courses based on role
  const courses = user?.role === 'admin' ? allCourses : allCourses.filter(c => c.status === 'published');

  // Enrollments query
  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => base44.entities.Enrollment.list(),
  });

  // Users query
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  // Module mutations
  const createModuleMutation = useMutation({
    mutationFn: async (data) => {
      const module = await base44.entities.Module.create(data);
      await base44.entities.ActivityLog.create({
        action: 'create',
        module: data.name,
        details: `Módulo "${data.name}" creado`,
      });
      return module;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Módulo creado exitosamente');
      setShowModuleModal(false);
    },
  });

  const updateModuleMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const module = await base44.entities.Module.update(id, data);
      await base44.entities.ActivityLog.create({
        action: 'update',
        module: data.name,
        details: `Módulo "${data.name}" actualizado`,
      });
      return module;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Módulo actualizado');
      setShowModuleModal(false);
      setEditingModule(null);
    },
  });

  const toggleModuleMutation = useMutation({
    mutationFn: async (module) => {
      const newStatus = module.status === 'active' ? 'inactive' : 'active';
      await base44.entities.Module.update(module.id, { status: newStatus });
      await base44.entities.ActivityLog.create({
        action: 'update',
        module: module.name,
        details: `Módulo "${module.name}" ${newStatus === 'active' ? 'activado' : 'desactivado'}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const handleSaveModule = (data) => {
    if (editingModule) {
      updateModuleMutation.mutate({ id: editingModule.id, data });
    } else {
      createModuleMutation.mutate(data);
    }
  };

  const handleAddModule = () => {
    setEditingModule(null);
    setShowModuleModal(true);
  };

  const handleSync = async () => {
    toast.success('Sincronización iniciada');
  };

  const handleClearCompleted = async () => {
    const completed = syncQueue.filter(i => i.status === 'completed');
    for (const item of completed) {
      await base44.entities.SyncQueue.delete(item.id);
    }
    queryClient.invalidateQueries({ queryKey: ['syncQueue'] });
    toast.success('Cola limpiada');
  };

  const pendingCount = syncQueue.filter(i => i.status === 'pending').length;
  const activeModules = modules.filter(m => m.status === 'active').length;

  // Calculate training metrics
  const myEnrollments = enrollments.filter(e => e.user_email === user?.email);
  const completedCourses = myEnrollments.filter(e => e.status === 'completed').length;
  const inProgressCourses = myEnrollments.filter(e => e.status === 'in_progress').length;
  const avgProgress = myEnrollments.length > 0 
    ? Math.round(myEnrollments.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / myEnrollments.length)
    : 0;

  // Contenido específico por rol
  const renderRoleSpecificContent = () => {
    if (user?.role === 'admin' || user?.role === 'supervisor') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Link to={createPageUrl('Maintenance')} className="block">
            <StatsCard
              title="Panel Mantenimiento"
              value="OT"
              subtitle="Gestionar mantenimiento"
              icon={Wrench}
              color="blue"
              index={0}
            />
          </Link>
          <Link to={createPageUrl('Equipment')} className="block">
            <StatsCard
              title="Equipos"
              value="📊"
              subtitle="Estado operativo"
              icon={Cpu}
              color="purple"
              index={1}
            />
          </Link>
          <Link to={createPageUrl('SpareParts')} className="block">
            <StatsCard
              title="Inventario"
              value="📦"
              subtitle="Repuestos"
              icon={Activity}
              color="emerald"
              index={2}
            />
          </Link>
          {user?.role === 'admin' && (
            <Link to={createPageUrl('Courses')} className="block">
              <StatsCard
                title="Capacitaciones"
                value={courses.length}
                subtitle="en catálogo"
                icon={BookOpen}
                color="amber"
                index={3}
              />
            </Link>
          )}
        </div>
      );
    }

    // Contenido para técnico
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Link to={createPageUrl('MyCourses')} className="block">
          <StatsCard
            title="Cursos Completados"
            value={completedCourses}
            subtitle={`de ${myEnrollments.length} inscritos`}
            icon={BookOpen}
            color="indigo"
            index={0}
          />
        </Link>
        <Link to={createPageUrl('MyCourses')} className="block">
          <StatsCard
            title="Progreso General"
            value={`${avgProgress}%`}
            subtitle="promedio"
            icon={TrendingUp}
            color="emerald"
            trend={avgProgress > 50 ? 12 : -5}
            index={1}
          />
        </Link>
        <Link to={createPageUrl('MyCourses')} className="block">
          <StatsCard
            title="En Progreso"
            value={inProgressCourses}
            subtitle="cursos activos"
            icon={RefreshCw}
            color="violet"
            index={2}
          />
        </Link>
        <Link to={createPageUrl('MyCourses')} className="block">
          <StatsCard
            title="Mis Certificados"
            value="📜"
            subtitle="Logros obtenidos"
            icon={Award}
            color="amber"
            index={3}
          />
        </Link>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader 
          user={user} 
          pendingCount={pendingCount}
          onSync={handleSync}
        />

        {/* Stock alerts banner */}
        {(user?.role === 'admin' || user?.role === 'supervisor') && (
          <div className="mb-6">
            <StockAlertsBanner user={user} />
          </div>
        )}

        {/* Stats por rol */}
        {renderRoleSpecificContent()}

        {/* Main Content Grid */}
        {user?.role !== 'admin' && user?.role !== 'supervisor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* My Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Mis Cursos Activos</CardTitle>
                <Link to={createPageUrl('MyCourses')}>
                  <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    Ver todos →
                  </button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {myEnrollments.filter(e => e.status !== 'completed').slice(0, 3).map((enrollment, idx) => {
                  const course = courses.find(c => c.id === enrollment.course_id);
                  return (
                    <motion.div
                      key={enrollment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Link to={createPageUrl('CourseDetail') + '?id=' + enrollment.course_id} className="block">
                        <div className="p-4 bg-slate-50 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer border border-transparent hover:border-indigo-200">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-slate-900">{course?.title || 'Curso'}</h4>
                            <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                              {enrollment.progress_percent}%
                            </span>
                          </div>
                          <Progress value={enrollment.progress_percent || 0} className="h-2 mb-2" />
                          <p className="text-xs text-slate-500">{course?.category || 'General'}</p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
                {myEnrollments.filter(e => e.status !== 'completed').length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No tienes cursos en progreso</p>
                    <Link to={createPageUrl('Courses')}>
                      <button className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        Explorar cursos disponibles
                      </button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ActivityFeed
              activities={activities}
              isLoading={activitiesLoading}
              onViewAll={() => {}}
            />
          </motion.div>
        </div>
        )}

        {/* Recent Courses - Solo para técnico */}
        {user?.role !== 'admin' && user?.role !== 'supervisor' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Cursos Recientes</CardTitle>
              <Link to={createPageUrl('Courses')}>
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  Ver todos →
                </button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.slice(0, 3).map((course, idx) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link to={createPageUrl('CourseDetail') + '?id=' + course.id} className="block">
                      <div className="p-4 bg-gradient-to-br from-indigo-50 to-white rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer border border-indigo-100">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xs px-2 py-1 bg-white rounded border border-indigo-200 text-indigo-700">
                            {course.category}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-900 mb-2 line-clamp-2">{course.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-2">{course.description}</p>
                        {course.duration_minutes && (
                          <p className="text-xs text-slate-500 mt-2">⏱️ {course.duration_minutes} min</p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        )}

        {/* Modules Grid - Solo para Admin */}
        {user?.role === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ModulesGrid
            modules={modules}
            onToggleModule={user?.role === 'admin' ? (module) => toggleModuleMutation.mutate(module) : null}
            onAddModule={handleAddModule}
            isAdmin={user?.role === 'admin'}
          />
        </motion.div>
        )}
        </div>

        {/* Module Modal */}
      <ModuleModal
        isOpen={showModuleModal}
        onClose={() => {
          setShowModuleModal(false);
          setEditingModule(null);
        }}
        onSave={handleSaveModule}
        module={editingModule}
      />

      {/* Sync Panel */}
      <SyncPanel
        items={syncQueue}
        isLoading={syncLoading}
        isOpen={showSyncPanel}
        onClose={() => setShowSyncPanel(false)}
        onClearCompleted={handleClearCompleted}
      />
    </div>
  );
}