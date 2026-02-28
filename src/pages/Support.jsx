import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const statusConfig = {
  abierto: { color: 'bg-blue-100 text-blue-800', label: 'Abierto' },
  en_progreso: { color: 'bg-amber-100 text-amber-800', label: 'En progreso' },
  resuelto: { color: 'bg-green-100 text-green-800', label: 'Resuelto' },
  cerrado: { color: 'bg-slate-100 text-slate-800', label: 'Cerrado' }
};

const priorityConfig = {
  baja: { color: 'bg-slate-50 text-slate-700', label: 'Baja' },
  media: { color: 'bg-blue-50 text-blue-700', label: 'Media' },
  alta: { color: 'bg-amber-50 text-amber-700', label: 'Alta' },
  urgente: { color: 'bg-red-50 text-red-700', label: 'Urgente' }
};

export default function Support() {
  const [user, setUser] = useState(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'other',
    priority: 'media'
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(console.error);
  }, []);

  const { data: tickets = [] } = useQuery({
    queryKey: ['supportTickets', user?.email],
    queryFn: () => user?.email ? base44.entities.SupportTicket.filter({ user_email: user.email }) : [],
    enabled: !!user?.email,
  });

  const createTicketMutation = useMutation({
    mutationFn: (data) => base44.entities.SupportTicket.create({
      ...data,
      user_email: user.email,
      messages: [{
        author_email: user.email,
        author_name: user.full_name,
        message: data.description,
        timestamp: new Date().toISOString()
      }]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets', user?.email] });
      setFormData({ subject: '', description: '', category: 'other', priority: 'media' });
      setShowNewTicket(false);
    }
  });

  const addMessageMutation = useMutation({
    mutationFn: (message) => {
      const messages = selectedTicket.messages || [];
      return base44.entities.SupportTicket.update(selectedTicket.id, {
        messages: [...messages, {
          author_email: user.email,
          author_name: user.full_name,
          message,
          timestamp: new Date().toISOString()
        }]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets', user?.email] });
      setNewMessage('');
    }
  });

  const handleCreateTicket = () => {
    createTicketMutation.mutate(formData);
  };

  const handleAddMessage = () => {
    if (newMessage.trim()) {
      addMessageMutation.mutate(newMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Centro de Soporte</h1>
            <p className="text-slate-600 mt-1">Gestiona tus tickets de soporte</p>
          </div>

          <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Ticket</DialogTitle>
                <DialogDescription>Describe el problema que necesitas reportar</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-900 mb-2 block">Asunto</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Describe brevemente..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-900 mb-2 block">Descripción</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalles del problema..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-900 mb-2 block">Categoría</label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">Bug</SelectItem>
                        <SelectItem value="feature">Feature</SelectItem>
                        <SelectItem value="billing">Facturación</SelectItem>
                        <SelectItem value="account">Cuenta</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-900 mb-2 block">Prioridad</label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baja">Baja</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleCreateTicket}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={createTicketMutation.isPending}
                >
                  {createTicketMutation.isPending ? 'Creando...' : 'Crear Ticket'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1 space-y-3">
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <motion.button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border transition-all',
                    selectedTicket?.id === ticket.id
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-slate-900 line-clamp-2">{ticket.subject}</h3>
                    <span className={cn('text-xs px-2 py-1 rounded-full shrink-0', statusConfig[ticket.status].color)}>
                      {statusConfig[ticket.status].label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">#{ticket.id?.slice(-6)}</p>
                </motion.button>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No tienes tickets abiertos</p>
              </div>
            )}
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl border border-slate-200 p-6"
              >
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedTicket.subject}</h2>
                      <p className="text-sm text-slate-500 mt-1">#{selectedTicket.id?.slice(-6)}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={cn('text-xs px-3 py-1 rounded-full', statusConfig[selectedTicket.status].color)}>
                        {statusConfig[selectedTicket.status].label}
                      </span>
                      <span className={cn('text-xs px-3 py-1 rounded-full', priorityConfig[selectedTicket.priority].color)}>
                        {priorityConfig[selectedTicket.priority].label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {selectedTicket.messages?.map((msg, idx) => (
                    <div key={idx} className={cn(
                      'p-3 rounded-lg',
                      msg.author_email === user?.email
                        ? 'bg-indigo-50 border border-indigo-100'
                        : 'bg-slate-50 border border-slate-100'
                    )}>
                      <div className="text-xs text-slate-600 font-medium mb-1">
                        {msg.author_name} • {new Date(msg.timestamp).toLocaleDateString('es-CL')}
                      </div>
                      <p className="text-sm text-slate-900">{msg.message}</p>
                    </div>
                  ))}
                </div>

                {/* Add Message */}
                {selectedTicket.status !== 'cerrado' && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe tu respuesta..."
                      rows={3}
                    />
                    <Button
                      onClick={handleAddMessage}
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      disabled={addMessageMutation.isPending || !newMessage.trim()}
                    >
                      {addMessageMutation.isPending ? 'Enviando...' : 'Enviar Mensaje'}
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Selecciona un ticket para ver detalles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}