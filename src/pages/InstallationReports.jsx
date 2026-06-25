import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, FileText, ClipboardCheck, ClipboardList } from 'lucide-react';
import InstallationReportList from '../components/installation/InstallationReportList';
import InstallationReportForm from '../components/installation/InstallationReportForm';
import InstallationReportDetail from '../components/installation/InstallationReportDetail';

export default function InstallationReports() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('list');
  const [selectedReport, setSelectedReport] = useState(null);
  const [createType, setCreateType] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['installation_reports'],
    queryFn: () => base44.entities.InstallationReport.list('-created_date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.InstallationReport.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation_reports'] });
      setView('list');
      setCreateType(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InstallationReport.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation_reports'] });
      setView('list');
      setSelectedReport(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.InstallationReport.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation_reports'] });
      setView('list');
      setSelectedReport(null);
    },
  });

  const handleSubmit = (formData) => {
    if (selectedReport) {
      updateMutation.mutate({ id: selectedReport.id, data: formData });
    } else {
      createMutation.mutate({ ...formData, created_by_email: user?.email });
    }
  };

  const handleCancel = () => {
    setView('list');
    setSelectedReport(null);
    setCreateType(null);
  };

  const stats = {
    total: reports.length,
    pre: reports.filter(r => r.tipo === 'preinstalacion').length,
    post: reports.filter(r => r.tipo === 'postinstalacion').length,
    aprobados: reports.filter(r => r.estado === 'aprobado').length,
  };

  if (view === 'create' || view === 'edit') {
    return (
      <div className="p-6">
        <InstallationReportForm
          report={selectedReport}
          defaultType={createType}
          user={user}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    );
  }

  if (view === 'detail') {
    return (
      <div className="p-6">
        <InstallationReportDetail
          report={selectedReport}
          onBack={handleCancel}
          onEdit={() => setView('edit')}
          onDelete={() => deleteMutation.mutate(selectedReport.id)}
          isDeleting={deleteMutation.isPending}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Informes de Instalación</h1>
            <p className="text-sm text-slate-500">Pre y Post instalación Sistema CAS + FMS + LTE</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => { setCreateType('preinstalacion'); setSelectedReport(null); setView('create'); }}
            className="gap-2 border-teal-200 text-teal-700 hover:bg-teal-50"
          >
            <ClipboardList className="w-4 h-4" />
            Pre-instalación
          </Button>
          <Button
            onClick={() => { setCreateType('postinstalacion'); setSelectedReport(null); setView('create'); }}
            className="gap-2 bg-teal-600 hover:bg-teal-700"
          >
            <ClipboardCheck className="w-4 h-4" />
            Post-instalación
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} color="bg-slate-100" valueColor="text-slate-800" />
        <StatCard label="Pre-instalación" value={stats.pre} color="bg-teal-50" valueColor="text-teal-700" />
        <StatCard label="Post-instalación" value={stats.post} color="bg-blue-50" valueColor="text-blue-700" />
        <StatCard label="Aprobados" value={stats.aprobados} color="bg-green-50" valueColor="text-green-700" />
      </div>

      <InstallationReportList
        reports={reports}
        isLoading={isLoading}
        onView={(r) => { setSelectedReport(r); setView('detail'); }}
        onEdit={(r) => { setSelectedReport(r); setView('edit'); }}
      />
    </div>
  );
}

function StatCard({ label, value, color, valueColor }) {
  return (
    <div className={`${color} rounded-xl p-4`}>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}