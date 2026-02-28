import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Wrench, BarChart3, ListTodo, CheckSquare, Cpu } from 'lucide-react';
import MaintenanceDashboard from '@/components/maintenance/MaintenanceDashboard';
import WorkOrderManagement from '@/components/maintenance/WorkOrderManagement';
import MaintenanceHistory from '@/components/maintenance/MaintenanceHistory';
import ImportFromSheets from '@/components/maintenance/ImportFromSheets';
import ExportButton from '@/components/maintenance/ExportButton';
import MaintenanceReports from '@/components/maintenance/MaintenanceReports';
import ReportTemplateManager from '@/components/maintenance/ReportTemplateManager';
import TaskManager from '@/components/maintenance/TaskManager';
import EquipmentManager from '@/components/maintenance/EquipmentManager';

export default function Maintenance() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(console.error);
  }, []);

  const { data: workOrders = [] } = useQuery({
    queryKey: ['workOrders'],
    queryFn: () => base44.entities.WorkOrder.list('-created_date', 100),
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list(),
  });

  const { data: kpiValues = [] } = useQuery({
    queryKey: ['kpiValues'],
    queryFn: () => base44.entities.KPIValue.list('-period', 50),
  });

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <Wrench className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-slate-900">Mantenimiento</h1>
            </div>
            <ExportButton />
          </div>
          <p className="text-slate-600">Gestiona órdenes de trabajo, historial y métricas de mantenimiento</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-8 overflow-x-auto">
              <TabsList className="flex w-max min-w-full sm:grid sm:grid-cols-7">
                <TabsTrigger value="dashboard" className="gap-2 whitespace-nowrap px-4">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Panel</span>
                </TabsTrigger>
                <TabsTrigger value="preventivo" className="gap-2 whitespace-nowrap px-4">
                  <ListTodo className="w-4 h-4" />
                  Preventivos
                </TabsTrigger>
                <TabsTrigger value="correctivo" className="gap-2 whitespace-nowrap px-4">
                  <Wrench className="w-4 h-4" />
                  Correctivos
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2 whitespace-nowrap px-4">
                  <Wrench className="w-4 h-4" />
                  Historial
                </TabsTrigger>
                <TabsTrigger value="equipos" className="gap-2 whitespace-nowrap px-4">
                  <Cpu className="w-4 h-4" />
                  Equipos
                </TabsTrigger>
                <TabsTrigger value="tareas" className="gap-2 whitespace-nowrap px-4">
                  <CheckSquare className="w-4 h-4" />
                  Tareas
                </TabsTrigger>
                <TabsTrigger value="import" className="gap-2 whitespace-nowrap px-4">
                  <ListTodo className="w-4 h-4" />
                  Importar
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger value="plantillas" className="gap-2 whitespace-nowrap px-4">
                    <ListTodo className="w-4 h-4" />
                    Plantillas
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="space-y-6">
              <MaintenanceDashboard
                workOrders={workOrders}
                assets={assets}
                kpiValues={kpiValues}
                user={user}
              />
            </TabsContent>

            <TabsContent value="preventivo" className="space-y-8">
              <WorkOrderManagement
                workOrders={workOrders.filter(wo => wo.type === 'preventivo')}
                assets={assets}
                user={user}
                isAdmin={isAdmin}
                type="preventivo"
              />
              <div className="border-t border-slate-200 pt-8">
                <MaintenanceReports assets={assets} reportType="preventivo" />
              </div>
            </TabsContent>

            <TabsContent value="correctivo" className="space-y-8">
              <WorkOrderManagement
                workOrders={workOrders.filter(wo => wo.type === 'correctivo')}
                assets={assets}
                user={user}
                isAdmin={isAdmin}
                type="correctivo"
              />
              <div className="border-t border-slate-200 pt-8">
                <MaintenanceReports assets={assets} reportType="correctivo" />
              </div>
            </TabsContent>

            <TabsContent value="equipos">
              <EquipmentManager />
            </TabsContent>

            <TabsContent value="tareas">
              <TaskManager />
            </TabsContent>

            <TabsContent value="history">
              <MaintenanceHistory
                workOrders={workOrders}
                assets={assets}
                user={user}
              />
            </TabsContent>

            <TabsContent value="import">
              <ImportFromSheets
                onImportComplete={() => {
                  queryClient.invalidateQueries({ queryKey: ['workOrders'] });
                }}
              />
            </TabsContent>

            {isAdmin && (
              <TabsContent value="plantillas">
                <ReportTemplateManager />
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}