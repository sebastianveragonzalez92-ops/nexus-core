import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Ticket } from 'lucide-react';
import TicketForm from '../components/tickets/TicketForm';
import TicketList from '../components/tickets/TicketList';

export default function Tickets() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => base44.entities.SupportTicket.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SupportTicket.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setView('list');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SupportTicket.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setView('list');
      setSelectedTicket(null);
    },
  });

  const handleSubmit = (formData) => {
    if (selectedTicket) {
      updateMutation.mutate({ id: selectedTicket.id, data: formData });
    } else {
      createMutation.mutate({ ...formData, user_email: user?.email });
    }
  };

  const handleEdit = (ticket) => {
    setSelectedTicket(ticket);
    setView('edit');
  };

  const handleCancel = () => {
    setView('list');
    setSelectedTicket(null);
  };

  if (view === 'create' || view === 'edit') {
    return (
      <div className="p-6">
        <TicketForm
          ticket={selectedTicket}
          user={user}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Ticket className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tickets</h1>
            <p className="text-sm text-slate-500">Gestión de tickets de soporte</p>
          </div>
        </div>
        <Button onClick={() => setView('create')} className="gap-2">
          <Plus className="w-4 h-4" />
          Registrar Ticket
        </Button>
      </div>

      <TicketList
        tickets={tickets}
        isLoading={isLoading}
        onEdit={handleEdit}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['tickets'] })}
      />
    </div>
  );
}