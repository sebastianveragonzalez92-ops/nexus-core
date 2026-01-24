import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Bell, Plus, Search, Filter, Check, X, Calendar,
  AlertTriangle, CheckCircle, Clock, Users, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import NotificationForm from '../components/notifications/NotificationForm';
import ExamManagement from '../components/notifications/ExamManagement';

export default function NotificationsPage() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch((error) => {
      console.error('Error cargando usuario:', error);
    });
  }, []);

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ 
      user_email: user?.email 
    }, '-created_date', 100),
    enabled: !!user,
  });

  // Fetch exams
  const { data: exams = [] } = useQuery({
    queryKey: ['exams', user?.email],
    queryFn: () => base44.entities.OccupationalExam.filter({ 
      user_email: user?.email 
    }, '-expiry_date'),
    enabled: !!user,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationIds) => Promise.all(
      notificationIds.map(id => {
        const notification = notifications.find(n => n.id === id);
        return base44.entities.Notification.update(id, { ...notification, read: true });
      })
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notificaciones marcadas como leídas');
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notificación eliminada');
    },
  });

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.message?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || n.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const expiringExams = exams.filter(e => e.status === 'proximo_vencer').length;

  const typeColors = {
    new_course: 'bg-blue-50 text-blue-700 border-blue-200',
    course_update: 'bg-purple-50 text-purple-700 border-purple-200',
    forum_reply: 'bg-green-50 text-green-700 border-green-200',
    quiz_deadline: 'bg-amber-50 text-amber-700 border-amber-200',
    direct_message: 'bg-rose-50 text-rose-700 border-rose-200',
    general: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Notificaciones y Exámenes</h1>
              <p className="text-slate-500 mt-1">Gestiona notificaciones y exámenes ocupacionales</p>
            </div>
            
            {/* Stats */}
            <div className="flex gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{unreadCount}</p>
                      <p className="text-xs text-slate-500">Sin leer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{expiringExams}</p>
                      <p className="text-xs text-slate-500">Exámenes por vencer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1">
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="exams">
              <Calendar className="w-4 h-4 mr-2" />
              Exámenes Ocupacionales
            </TabsTrigger>
            {user?.role === 'admin' && (
              <TabsTrigger value="send">
                <Send className="w-4 h-4 mr-2" />
                Enviar Notificación
              </TabsTrigger>
            )}
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Buscar notificaciones..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="new_course">Nuevo curso</SelectItem>
                      <SelectItem value="course_update">Actualización</SelectItem>
                      <SelectItem value="forum_reply">Respuesta foro</SelectItem>
                      <SelectItem value="quiz_deadline">Plazo quiz</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>

                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => markAsReadMutation.mutate(
                        notifications.filter(n => !n.read).map(n => n.id)
                      )}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Marcar todas leídas
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notifications List */}
            {isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300 animate-spin" />
                  <p className="text-slate-500">Cargando notificaciones...</p>
                </CardContent>
              </Card>
            ) : filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500">No hay notificaciones</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className={`${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-slate-900">
                                    {notification.title}
                                  </h3>
                                  {!notification.read && (
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 mb-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-3">
                                  <Badge className={typeColors[notification.type]}>
                                    {notification.type}
                                  </Badge>
                                  <span className="text-xs text-slate-500">
                                    {formatDistanceToNow(new Date(notification.created_date), {
                                      addSuffix: true,
                                      locale: es
                                    })}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                {!notification.read && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => markAsReadMutation.mutate([notification.id])}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteMutation.mutate(notification.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {notification.action_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.location.href = notification.action_url}
                                className="mt-2"
                              >
                                Ver detalles
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Exams Tab */}
           <TabsContent value="exams">
             {!user ? (
               <Card>
                 <CardContent className="py-12 text-center">
                   <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300 animate-spin" />
                   <p className="text-slate-500">Cargando usuario...</p>
                 </CardContent>
               </Card>
             ) : (
               <ExamManagement user={user} exams={exams} />
             )}
           </TabsContent>

          {/* Send Notification Tab (Admin only) */}
          {user?.role === 'admin' && (
            <TabsContent value="send">
              <NotificationForm />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}