import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Send, Users, User } from 'lucide-react';
import { toast } from 'sonner';
import {
  notifySpecializedCourseAvailable,
  notifyMandatoryCourseReminder,
  notifyExamExpiring,
  notifyExamExpired
} from './notificationHelpers';

export default function NotificationForm() {
  const [formData, setFormData] = useState({
    recipient_type: 'all',
    recipient_email: '',
    type: 'general',
    title: '',
    message: '',
    action_url: '',
  });

  const queryClient = useQueryClient();

  // Fetch all users (admin only)
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  // Send notification mutation
  const sendMutation = useMutation({
    mutationFn: async (data) => {
      if (data.recipient_type === 'all') {
        const notifications = users.map(user => ({
          user_email: user.email,
          type: data.type,
          title: data.title,
          message: data.message,
          action_url: data.action_url || '',
        }));
        return await base44.entities.Notification.bulkCreate(notifications);
      } else {
        return await base44.entities.Notification.create({
          user_email: data.recipient_email,
          type: data.type,
          title: data.title,
          message: data.message,
          action_url: data.action_url || '',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notificación enviada exitosamente');
      setFormData({
        recipient_type: 'all',
        recipient_email: '',
        type: 'general',
        title: '',
        message: '',
        action_url: '',
      });
    },
    onError: (error) => {
      console.error('Error sending notification:', error);
      toast.error('Error al enviar notificación: ' + (error.message || 'Error desconocido'));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('📤 NotificationForm: handleSubmit called, formData:', formData);
    if (!formData.title || !formData.message) {
      toast.error('Título y mensaje son obligatorios');
      return;
    }
    if (formData.recipient_type === 'individual' && !formData.recipient_email) {
      toast.error('Selecciona un destinatario');
      return;
    }
    console.log('📤 NotificationForm: Enviando notificación...');
    sendMutation.mutate(formData);
  };

  // Quick templates
  const templates = [
    {
      name: 'Curso de Conducción',
      type: 'new_course',
      title: 'Nuevo Curso: Conducción Segura',
      message: 'El curso de Conducción Segura está disponible. Inscríbete ahora para obtener tu certificación.',
    },
    {
      name: 'Curso de Extintores',
      type: 'new_course',
      title: 'Nuevo Curso: Manejo de Extintores',
      message: 'Capacitación obligatoria en Manejo de Extintores disponible. Complétala antes del próximo mes.',
    },
    {
      name: 'Recordatorio Examen',
      type: 'quiz_deadline',
      title: 'Examen Ocupacional Próximo a Vencer',
      message: 'Tu examen ocupacional vence en 30 días. Programa tu renovación.',
    },
  ];

  const applyTemplate = (template) => {
    setFormData({
      ...formData,
      type: template.type,
      title: template.title,
      message: template.message,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Enviar Notificación</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Recipient Type */}
            <div>
              <Label>Destinatarios</Label>
              <Select
                value={formData.recipient_type}
                onValueChange={(value) => setFormData({ ...formData, recipient_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Todos los usuarios
                    </div>
                  </SelectItem>
                  <SelectItem value="individual">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Usuario individual
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Individual recipient */}
            {formData.recipient_type === 'individual' && (
              <div>
                <Label>Usuario</Label>
                <Select
                  value={formData.recipient_email}
                  onValueChange={(value) => setFormData({ ...formData, recipient_email: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.email} value={user.email}>
                        {user.full_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Type */}
            <div>
              <Label>Tipo de Notificación</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="new_course">Nuevo Curso</SelectItem>
                  <SelectItem value="course_update">Actualización de Curso</SelectItem>
                  <SelectItem value="quiz_deadline">Plazo/Recordatorio</SelectItem>
                  <SelectItem value="forum_reply">Respuesta del Foro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div>
              <Label>Título</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título de la notificación"
              />
            </div>

            {/* Message */}
            <div>
              <Label>Mensaje</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Contenido del mensaje"
                rows={4}
              />
            </div>

            {/* Action URL */}
            <div>
              <Label>URL de Acción (opcional)</Label>
              <Input
                value={formData.action_url}
                onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
                placeholder="/courses?id=123"
              />
            </div>

            <Button type="submit" className="w-full" disabled={sendMutation.isPending}>
              <Send className="w-4 h-4 mr-2" />
              {sendMutation.isPending ? 'Enviando...' : 'Enviar Notificación'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {templates.map((template, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3"
              onClick={() => applyTemplate(template)}
            >
              <div>
                <p className="font-semibold text-sm">{template.name}</p>
                <p className="text-xs text-slate-500 mt-1">{template.title}</p>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}