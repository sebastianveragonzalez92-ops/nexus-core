import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { User, Shield, Filter } from 'lucide-react';
import { toast } from 'sonner';

const ROLES = [
  { value: 'admin', label: 'Administrador', color: 'bg-red-100 text-red-800' },
  { value: 'supervisor', label: 'Supervisor', color: 'bg-blue-100 text-blue-800' },
  { value: 'tecnico', label: 'Técnico', color: 'bg-green-100 text-green-800' },
  { value: 'inspector', label: 'Inspector', color: 'bg-purple-100 text-purple-800' },
  { value: 'especialista', label: 'Especialista', color: 'bg-orange-100 text-orange-800' },
  { value: 'capacitador', label: 'Capacitador', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'operador', label: 'Operador', color: 'bg-slate-100 text-slate-800' },
];

export default function RoleManagement() {
  const queryClient = useQueryClient();
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);

  const { data: users = [] } = useQuery({
    queryKey: ['usersForRoleManagement'],
    queryFn: async () => {
      const allUsers = await base44.asServiceRole.entities.User.list('-created_date');
      return allUsers;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }) => {
      return base44.asServiceRole.entities.User.update(userId, { role: newRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usersForRoleManagement'] });
      setEditingUserId(null);
      toast.success('Rol actualizado correctamente');
    },
    onError: () => toast.error('Error al actualizar rol'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, newStatus }) => {
      return base44.asServiceRole.entities.User.update(userId, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usersForRoleManagement'] });
      toast.success('Estado actualizado correctamente');
    },
    onError: () => toast.error('Error al actualizar estado'),
  });

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
      (user.full_name?.toLowerCase().includes(searchEmail.toLowerCase()) ?? false)
  );

  const getRoleColor = (role) => {
    const roleObj = ROLES.find((r) => r.value === role);
    return roleObj?.color || 'bg-slate-100 text-slate-800';
  };

  const getRoleLabel = (role) => {
    const roleObj = ROLES.find((r) => r.value === role);
    return roleObj?.label || role;
  };

  const getStatusBadge = (status = 'active') => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-amber-100 text-amber-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Gestión Granular de Roles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Buscar por email o nombre..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="mb-4"
          />

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Usuario</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Rol</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900">{user.full_name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {editingUserId === user.id ? (
                        <Select
                          value={selectedRole}
                          onValueChange={(value) => {
                            updateRoleMutation.mutate(
                              { userId: user.id, newRole: value },
                              { onSuccess: () => setSelectedRole('') }
                            );
                          }}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusBadge(user.status)}>
                        {user.status === 'active'
                          ? 'Activo'
                          : user.status === 'inactive'
                            ? 'Inactivo'
                            : 'Suspendido'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {editingUserId === user.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingUserId(null)}
                            >
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingUserId(user.id);
                                setSelectedRole(user.role);
                              }}
                            >
                              Editar
                            </Button>
                            {user.status === 'active' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-amber-600 hover:text-amber-700"
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    userId: user.id,
                                    newStatus: 'inactive',
                                  })
                                }
                              >
                                Desactivar
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    userId: user.id,
                                    newStatus: 'active',
                                  })
                                }
                              >
                                Activar
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <User className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No se encontraron usuarios</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}