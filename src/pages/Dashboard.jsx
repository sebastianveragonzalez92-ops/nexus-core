import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layers, Activity, RefreshCw, Zap } from 'lucide-react';
import StatsCard from '@/components/ui/StatsCard';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ModulesGrid from '@/components/dashboard/ModulesGrid';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import SyncPanel from '@/components/dashboard/SyncPanel';
import ModuleModal from '@/components/modals/ModuleModal';
import { toast } from 'sonner';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showSyncPanel, setShowSyncPanel] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Modules query
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: () => base44.entities.Module.list('-created_date'),
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader 
          user={user} 
          pendingCount={pendingCount}
          onSync={handleSync}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatsCard
            title="Módulos activos"
            value={activeModules}
            subtitle={`de ${modules.length} totales`}
            icon={Layers}
            color="indigo"
            index={0}
          />
          <StatsCard
            title="Actividades"
            value={activities.length}
            subtitle="últimas 24h"
            icon={Activity}
            color="emerald"
            trend={12}
            index={1}
          />
          <StatsCard
            title="Sincronizaciones"
            value={pendingCount}
            subtitle="pendientes"
            icon={RefreshCw}
            color="violet"
            index={2}
          />
          <StatsCard
            title="Rendimiento"
            value="98%"
            subtitle="uptime"
            icon={Zap}
            color="amber"
            trend={5}
            index={3}
          />
        </div>

        {/* Modules Grid */}
        <div className="mb-8">
          <ModulesGrid
            modules={modules}
            onToggleModule={(module) => toggleModuleMutation.mutate(module)}
            onAddModule={handleAddModule}
          />
        </div>

        {/* Activity Feed */}
        <div className="max-w-2xl">
          <ActivityFeed
            activities={activities}
            isLoading={activitiesLoading}
            onViewAll={() => {}}
          />
        </div>
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