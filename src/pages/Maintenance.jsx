import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Wrench, BarChart3, ListTodo } from 'lucide-react';
import MaintenanceDashboard from '@/components/maintenance/MaintenanceDashboard';
import WorkOrderManagement from '@/components/maintenance/WorkOrderManagement';
import MaintenanceHistory from '@/components/maintenance/MaintenanceHistory';

export default function Maintenance() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

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
          <div className="flex items-center gap-3 mb-2">
            <Wrench className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-slate-900">Mantenimiento</h1>
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
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="dashboard" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="workorders" className="gap-2">
                <ListTodo className="w-4 h-4" />
                Órdenes de Trabajo
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <Wrench className="w-4 h-4" />
                Historial
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <MaintenanceDashboard
                workOrders={workOrders}
                assets={assets}
                kpiValues={kpiValues}
                user={user}
              />
            </TabsContent>

            <TabsContent value="workorders">
              <WorkOrderManagement
                workOrders={workOrders}
                assets={assets}
                user={user}
                isAdmin={isAdmin}
              />
            </TabsContent>

            <TabsContent value="history">
              <MaintenanceHistory
                workOrders={workOrders}
                assets={assets}
                user={user}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}