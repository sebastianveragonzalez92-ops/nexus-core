import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Plus, Ticket, AlertCircle, Clock, CheckCircle2, XCircle, TrendingUp, Building2, Loader2, Settings } from 'lucide-react';
import TicketForm from '../components/tickets/TicketForm';
import TicketList from '../components/tickets/TicketList';
import TicketDetail from '../components/tickets/TicketDetail';
import { useCompany } from '@/hooks/useCompany';

export default function Tickets() {
  const navigate = useNavigate();
  const { user, company, config, loading, isPlatformAdmin } = useCompany();
  const [view, setView] = useState('list');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets', company?.id],
    queryFn: () => base44.entities.SupportTicket.filter({ company_id: company.id }, '-created_date', 200),
    enabled: !!company,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SupportTicket.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', company?.id] });
      setView('list');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SupportTicket.update(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', company?.id] });
      if (view === 'detail') {
        const updated = tickets.find(t => t.id === vars.id);
        if (updated) setSelectedTicket({ ...updated, ...vars.data });
      } else {
        setView('list');
        setSelectedTicket(null);
      }
    },
  });

  const handleSubmit = (formData) => {
    if (selectedTicket) {
      updateMutation.mutate({ id: selectedTicket.id, data: formData });
    } else {
      createMutation.mutate({ ...formData, user_email: user?.email, company_id: company?.id });
    }
  };

  const handleEdit = (ticket) => { setSelectedTicket(ticket); setView('edit'); };
  const handleView = (ticket) => { setSelectedTicket(ticket); setView('detail'); };
  const handleCancel = () => { setView('list'); setSelectedTicket(null); };
  const handleStatusChange = (ticket, newStatus) => {
    updateMutation.mutate({ id: ticket.id, data: { status: newStatus } });
  };

  const stats = {
    total: tickets.length,
    abiertos: tickets.filter(t => t.status === 'abierto' || (!config.statuses.find(s => s.value === t.status))).length,
    en_progreso: tickets.filter(t => t.status === 'en_progreso').length,
    resueltos: tickets.filter(t => t.status === 'resuelto').length,
    urgentes: tickets.filter(t => t.priority === 'urgente' && t.status !== 'cerrado').length,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>;
  }

  if (!company) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center mt-10">
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Registra tu empresa</h1>
        <p className="text-slate-500 mt-2">Para crear y gestionar tickets, primero necesitas registrar tu empresa en la plataforma.</p>
        {isPlatformAdmin && (
          <Button variant="outline" className="mt-4 mr-2" onClick={() => navigate('/Empresas')}>
            Ver empresas registradas
          </Button>
        )}
        <Button className="mt-4 gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate('/RegistrarEmpresa')}>
          <Building2 className="w-4 h-4" /> Registrar empresa
        </Button>
      </div>
    );
  }

  if (view === 'create' || view === 'edit') {
    return (
      <div className="p-6">
        <TicketForm
          ticket={selectedTicket}
          user={user}
          config={config}
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
        <TicketDetail
          ticket={selectedTicket}
          user={user}
          config={config}
          onEdit={() => handleEdit(selectedTicket)}
          onBack={handleCancel}
          onStatusChange={handleStatusChange}
          isUpdating={updateMutation.isPending}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Ticket className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tickets de Soporte</h1>
            <p className="text-sm text-slate-500">{company.name} · {stats.total} tickets</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/ConfiguracionTickets')} title="Configurar tickets">
            <Settings className="w-5 h-5 text-slate-500" />
          </Button>
          <Button onClick={() => { setSelectedTicket(null); setView('create'); }} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Nuevo Ticket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={<TrendingUp className="w-5 h-5 text-slate-600" />} label="Total" value={stats.total} color="bg-slate-100" />
        <StatCard icon={<AlertCircle className="w-5 h-5 text-blue-600" />} label="Abiertos" value={stats.abiertos} color="bg-blue-50" valueColor="text-blue-700" />
        <StatCard icon={<Clock className="w-5 h-5 text-yellow-600" />} label="En Progreso" value={stats.en_progreso} color="bg-yellow-50" valueColor="text-yellow-700" />
        <StatCard icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} label="Resueltos" value={stats.resueltos} color="bg-green-50" valueColor="text-green-700" />
        <StatCard icon={<XCircle className="w-5 h-5 text-red-600" />} label="Urgentes" value={stats.urgentes} color="bg-red-50" valueColor="text-red-700" />
      </div>

      <TicketList
        tickets={tickets}
        config={config}
        isLoading={isLoading}
        onEdit={handleEdit}
        onView={handleView}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

function StatCard({ icon, label, value, color, valueColor = 'text-slate-800' }) {
  return (
    <div className={`${color} rounded-xl p-4 flex items-center gap-3`}>
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}