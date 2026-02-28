import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Shield, Send, Check, Users, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ROLE_LABELS, ROLE_COLORS } from '@/components/lib/permissions';

const ROLES = [
  { value: 'admin', label: 'Administrador', desc: 'Acceso total a la plataforma' },
  { value: 'supervisor', label: 'Supervisor', desc: 'Gestiona OTs, aprueba trabajos, ve reportes' },
  { value: 'tecnico', label: 'Técnico', desc: 'Ejecuta OTs y crea reportes de mantención' },
];

export default function UserManagement({ currentUser }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [isInviting, setIsInviting] = useState(false);
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }) => base44.entities.User.update(userId, { role: newRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Rol actualizado');
    },
    onError: () => toast.error('Error al actualizar rol'),
  });

  const handleInvite = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Ingresa un correo válido');
      return;
    }
    setIsInviting(true);
    try {
      // base44 only supports 'admin' or 'user' for invite; role is updated after
      const baseRole = role === 'admin' ? 'admin' : 'user';
      await base44.users.inviteUser(email, baseRole);
      toast.success(`Invitación enviada a ${email}`);
      setSuccess(true);
      setEmail('');
      setTimeout(() => setSuccess(false), 3000);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch {
      toast.error('Error al enviar invitación');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Users List */}
      <Card className="rounded-2xl border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-50">
              <Users className="w-5 h-5 text-violet-600" />
            </div>
            Usuarios registrados
          </CardTitle>
          <CardDescription>{allUsers.length} usuarios en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-slate-500">Cargando...</p>
          ) : allUsers.length === 0 ? (
            <p className="text-center py-8 text-slate-500">No hay usuarios</p>
          ) : (
            <div className="space-y-2">
              {allUsers.map((u) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-indigo-600">
                        {u.full_name?.charAt(0) || u.email?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{u.full_name || 'Sin nombre'}</p>
                      <p className="text-sm text-slate-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentUser?.role === 'admin' && u.id !== currentUser?.id ? (
                      <Select
                        value={u.role || 'user'}
                        onValueChange={(newRole) => updateRoleMutation.mutate({ userId: u.id, newRole })}
                      >
                        <SelectTrigger className={cn('w-52 rounded-xl border text-xs font-medium h-8', ROLE_COLORS[u.role || 'user'])}>
                          <SelectValue />
                          <ChevronDown className="w-3 h-3 ml-1" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              <div>
                                <p className="font-medium">{r.label}</p>
                                <p className="text-xs text-slate-500">{r.desc}</p>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={cn('border', ROLE_COLORS[u.role || 'user'])}>
                        {ROLE_LABELS[u.role || 'user'] || u.role}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Card */}
      <Card className="rounded-2xl border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50">
              <UserPlus className="w-5 h-5 text-indigo-600" />
            </div>
            Invitar usuarios
          </CardTitle>
          <CardDescription>Invita nuevos miembros a la plataforma</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Correo electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="email"
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 rounded-xl"
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rol</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value} disabled={r.value === 'admin' && currentUser?.role !== 'admin'}>
                    <div>
                      <p className="font-medium">{r.label}</p>
                      <p className="text-xs text-slate-500">{r.desc}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleInvite}
            disabled={isInviting || !email || success}
            className={cn(
              'w-full rounded-xl',
              success
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600'
            )}
          >
            {success ? <><Check className="w-4 h-4 mr-2" />Invitación enviada</> : <><Send className="w-4 h-4 mr-2" />{isInviting ? 'Enviando...' : 'Enviar invitación'}</>}
          </Button>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs text-blue-800">El usuario recibirá un correo con instrucciones para crear su cuenta.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}