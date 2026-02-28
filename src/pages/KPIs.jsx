import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Target, Settings, Download, FileText, PlusCircle } from 'lucide-react';
import KPIDashboard from '@/components/kpis/KPIDashboard';
import KPIManagement from '@/components/kpis/KPIManagement';
import KPIReports from '@/components/kpis/KPIReports';
import KPITracking from '@/components/kpis/KPITracking';
import KPIExport from '@/components/kpis/KPIExport';

export default function KPIs() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(console.error);
  }, []);

  const { data: kpis = [] } = useQuery({
    queryKey: ['kpis'],
    queryFn: () => base44.entities.KPI.list('-created_date', 100),
  });

  const { data: kpiValues = [] } = useQuery({
    queryKey: ['kpiValues'],
    queryFn: () => base44.entities.KPIValue.list('-period', 200),
  });

  const isAdmin = user?.role === 'admin';
  const canManageKPIs = ['admin', 'supervisor'].includes(user?.role);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-slate-900">KPIs y Reportes</h1>
            </div>
            <KPIExport kpis={kpis} kpiValues={kpiValues} />
          </div>
          <p className="text-slate-600">Monitora y gestiona indicadores clave de desempeño</p>
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
                  { value: 'seguimiento', label: 'Seguimiento', icon: TrendingUp },
                  { value: 'reportes', label: 'Reportes', icon: FileText },
                  ...(canManageKPIs ? [
                    { value: 'kpis', label: 'Gestionar KPIs', icon: Target },
                    { value: 'configuracion', label: 'Configuración', icon: Settings },
                  ] : []),
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

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <KPIDashboard user={user} kpis={kpis} kpiValues={kpiValues} />
            </TabsContent>

            {/* Seguimiento Tab */}
            <TabsContent value="seguimiento" className="space-y-6">
              <KPITracking user={user} kpis={kpis} kpiValues={kpiValues} />
            </TabsContent>

            {/* Reportes Tab */}
            <TabsContent value="reportes" className="space-y-6">
              <KPIReports kpis={kpis} kpiValues={kpiValues} />
            </TabsContent>

            {/* Gestionar KPIs Tab */}
            {canManageKPIs && (
              <TabsContent value="kpis" className="space-y-6">
                <KPIManagement
                  kpis={kpis}
                  user={user}
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['kpis'] });
                    queryClient.invalidateQueries({ queryKey: ['kpiValues'] });
                  }}
                />
              </TabsContent>
            )}

            {/* Configuración Tab */}
            {canManageKPIs && (
              <TabsContent value="configuracion" className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Configuración de KPIs</h2>
                  <p className="text-slate-600">Configuración del sistema de KPIs por implementar</p>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}