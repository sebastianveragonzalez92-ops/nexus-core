import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Wrench, BarChart3, ClipboardList, CheckSquare, Cpu, History, FileText, Download, FileStack } from 'lucide-react';
import MaintenanceDashboard from '@/components/maintenance/MaintenanceDashboard';
import WorkOrderManagement from '@/components/maintenance/WorkOrderManagement';
import MaintenanceHistory from '@/components/maintenance/MaintenanceHistory';
import ImportFromSheets from '@/components/maintenance/ImportFromSheets';
import ExportButton from '@/components/maintenance/ExportButton';
import MaintenanceReports from '@/components/maintenance/MaintenanceReports';
import ReportTemplateManager from '@/components/maintenance/ReportTemplateManager';
import TaskManager from '@/components/maintenance/TaskManager';
import EquipmentManager from '@/components/maintenance/EquipmentManager';
import ConsolidatedReports from '@/components/maintenance/ConsolidatedReports';

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
  const canManageTemplates = ['admin', 'supervisor'].includes(user?.role);

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
            <div className="mb-8 overflow-x-auto scrollbar-hide">
              <TabsList className="inline-flex h-auto p-1 gap-1 bg-slate-100 rounded-xl">
                {[
                  { value: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                  { value: 'preventivo', label: 'Preventivos', icon: ClipboardList },
                  { value: 'correctivo', label: 'Correctivos', icon: Wrench },
                  { value: 'history', label: 'Historial', icon: History },
                  { value: 'equipos', label: 'Equipos', icon: Cpu },
                  { value: 'tareas', label: 'Tareas', icon: CheckSquare },
                  { value: 'reportes', label: 'Reportes', icon: FileText },
                  { value: 'import', label: 'Importar', icon: Download },
                  ...(canManageTemplates ? [{ value: 'plantillas', label: 'Plantillas', icon: FileStack }] : []),
                ].map(({ value, label, icon: Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="space-y-6">
              <MaintenanceDashboard user={user} />
            </TabsContent>

            <TabsContent value="preventivo" className="space-y-8">
              <WorkOrderManagement
                workOrders={workOrders.filter(wo => wo.type === 'preventivo')}
                assets={assets}
                user={user}
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

            <TabsContent value="reportes">
              <ConsolidatedReports />
            </TabsContent>

            <TabsContent value="import">
              <ImportFromSheets
                onImportComplete={() => {
                  queryClient.invalidateQueries({ queryKey: ['workOrders'] });
                }}
              />
            </TabsContent>

            {canManageTemplates && (
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