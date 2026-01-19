import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Shield, User as UserIcon, Send, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function InviteUserCard({ currentUser }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [isInviting, setIsInviting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInvite = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Ingresa un correo válido');
      return;
    }

    setIsInviting(true);
    try {
      await base44.users.inviteUser(email, role);
      toast.success(`Invitación enviada a ${email}`);
      setSuccess(true);
      setEmail('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      toast.error('Error al enviar invitación');
    } finally {
      setIsInviting(false);
    }
  };

  const canInviteAdmin = currentUser?.role === 'admin';

  return (
    <Card className="rounded-2xl border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50">
            <UserPlus className="w-5 h-5 text-indigo-600" />
          </div>
          Invitar usuarios
        </CardTitle>
        <CardDescription>
          Invita nuevos miembros a la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email input */}
        <div className="space-y-2">
          <Label htmlFor="invite-email" className="text-sm font-medium text-slate-700">
            Correo electrónico
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="invite-email"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 rounded-xl border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            />
          </div>
        </div>

        {/* Role selector */}
        <div className="space-y-2">
          <Label htmlFor="invite-role" className="text-sm font-medium text-slate-700">
            Rol del usuario
          </Label>
          <Select 
            value={role} 
            onValueChange={setRole}
            disabled={!canInviteAdmin}
          >
            <SelectTrigger className="rounded-xl border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="font-medium">Usuario</p>
                    <p className="text-xs text-slate-500">Acceso estándar</p>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="admin" disabled={!canInviteAdmin}>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <div>
                    <p className="font-medium">Administrador</p>
                    <p className="text-xs text-slate-500">Acceso completo</p>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {!canInviteAdmin && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Solo administradores pueden invitar con rol admin
            </p>
          )}
        </div>

        {/* Role info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className={cn(
            "p-4 rounded-xl border-2 transition-all",
            role === 'user' ? "border-indigo-200 bg-indigo-50" : "border-slate-100 bg-slate-50"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <UserIcon className={cn(
                "w-4 h-4",
                role === 'user' ? "text-indigo-600" : "text-slate-400"
              )} />
              <span className={cn(
                "text-sm font-semibold",
                role === 'user' ? "text-indigo-900" : "text-slate-600"
              )}>
                Usuario estándar
              </span>
            </div>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>• Ver y usar módulos</li>
              <li>• Crear contenido propio</li>
              <li>• Acceso limitado</li>
            </ul>
          </div>

          <div className={cn(
            "p-4 rounded-xl border-2 transition-all",
            role === 'admin' ? "border-indigo-200 bg-indigo-50" : "border-slate-100 bg-slate-50",
            !canInviteAdmin && "opacity-50"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className={cn(
                "w-4 h-4",
                role === 'admin' ? "text-indigo-600" : "text-slate-400"
              )} />
              <span className={cn(
                "text-sm font-semibold",
                role === 'admin' ? "text-indigo-900" : "text-slate-600"
              )}>
                Administrador
              </span>
            </div>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>• Gestionar módulos</li>
              <li>• Invitar usuarios</li>
              <li>• Acceso completo</li>
            </ul>
          </div>
        </div>

        {/* Action button */}
        <Button
          onClick={handleInvite}
          disabled={isInviting || !email || success}
          className={cn(
            "w-full rounded-xl transition-all",
            success
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-lg shadow-indigo-200"
          )}
        >
          {success ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Invitación enviada
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {isInviting ? 'Enviando...' : 'Enviar invitación'}
            </>
          )}
        </Button>

        {/* Info */}
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>Nota:</strong> El usuario recibirá un correo con instrucciones para crear su cuenta y acceder a la plataforma.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}