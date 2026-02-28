import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const ROLES = [
  'admin',
  'supervisor',
  'tecnico',
  'inspector',
  'especialista',
  'capacitador',
  'operador',
];

export default function UserGroupManager() {
  const queryClient = useQueryClient();
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [showAddMembersDialog, setShowAddMembersDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    role: 'tecnico',
    department: '',
  });
  const [selectedMembers, setSelectedMembers] = useState(new Set());

  const { data: groups = [] } = useQuery({
    queryKey: ['userGroups'],
    queryFn: () => base44.entities.UserGroup.list('-created_date'),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['usersForGrouping'],
    queryFn: () => base44.asServiceRole.entities.User.list('-created_date'),
  });

  const { data: groupMembers = [] } = useQuery({
    queryKey: ['groupMembers', selectedGroup?.id],
    queryFn: () =>
      selectedGroup ? base44.entities.UserGroupMember.filter({ group_id: selectedGroup.id }) : [],
    enabled: !!selectedGroup,
  });

  const createGroupMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.UserGroup.create({
        ...data,
        created_by: base44.auth.me().then((u) => u.email),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGroups'] });
      setFormData({ name: '', description: '', role: 'tecnico', department: '' });
      setShowNewGroupDialog(false);
      toast.success('Grupo creado correctamente');
    },
    onError: () => toast.error('Error al crear grupo'),
  });

  const addMembersMutation = useMutation({
    mutationFn: async (memberEmails) => {
      const currentUser = await base44.auth.me();
      return Promise.all(
        Array.from(memberEmails).map((email) =>
          base44.entities.UserGroupMember.create({
            group_id: selectedGroup.id,
            user_email: email,
            user_name: users.find((u) => u.email === email)?.full_name || email,
            role: selectedGroup.role,
            added_by: currentUser.email,
            added_date: new Date().toISOString(),
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers'] });
      setSelectedMembers(new Set());
      setShowAddMembersDialog(false);
      toast.success('Miembros agregados correctamente');
    },
    onError: () => toast.error('Error al agregar miembros'),
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (groupId) => base44.entities.UserGroup.delete(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGroups'] });
      toast.success('Grupo eliminado');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId) => base44.entities.UserGroupMember.delete(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers'] });
      toast.success('Miembro eliminado del grupo');
    },
  });

  const memberEmails = new Set(groupMembers.map((m) => m.user_email));
  const availableUsers = users.filter((u) => !memberEmails.has(u.email));

  return (
    <div className="space-y-6">
      {/* New Group Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowNewGroupDialog(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Nuevo Grupo
        </Button>
      </div>

      {/* Groups List */}
      <div className="grid gap-4">
        <AnimatePresence>
          {groups.map((group) => (
            <motion.div key={group.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1 }}>
              <Card className="border-slate-200 cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        {group.name}
                      </CardTitle>
                      {group.description && (
                        <p className="text-sm text-slate-600 mt-2">{group.description}</p>
                      )}
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">{group.role}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      {groupMembers.filter((m) => m.group_id === group.id).length} miembros
                    </span>
                    {group.department && (
                      <span className="text-slate-600">Depto: {group.department}</span>
                    )}
                  </div>

                  {selectedGroup?.id === group.id && (
                    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-sm">Miembros del Grupo</h4>
                        <Button
                          size="sm"
                          onClick={() => setShowAddMembersDialog(true)}
                          variant="outline"
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Agregar
                        </Button>
                      </div>

                      {groupMembers.length > 0 ? (
                        <div className="space-y-2">
                          {groupMembers.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-2 bg-white rounded border border-slate-200"
                            >
                              <div>
                                <p className="text-sm font-medium">{member.user_name}</p>
                                <p className="text-xs text-slate-500">{member.user_email}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeMemberMutation.mutate(member.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 text-center py-4">
                          Sin miembros en este grupo
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant={selectedGroup?.id === group.id ? 'default' : 'outline'}
                      onClick={() =>
                        setSelectedGroup(selectedGroup?.id === group.id ? null : group)
                      }
                    >
                      {selectedGroup?.id === group.id ? 'Ocultar Miembros' : 'Ver Miembros'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteGroupMutation.mutate(group.id)}
                      className="text-red-600 hover:text-red-700 ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {groups.length === 0 && (
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="text-center py-8 text-slate-500">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No hay grupos creados aún</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Group Dialog */}
      <Dialog open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Grupo de Usuarios</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nombre del grupo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              placeholder="Descripción (opcional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <div>
              <label className="text-sm font-medium block mb-2">Rol predeterminado</label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Departamento (opcional)"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
            <Button
              onClick={() => createGroupMutation.mutate(formData)}
              disabled={!formData.name || createGroupMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              Crear Grupo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Members Dialog */}
      {selectedGroup && (
        <Dialog open={showAddMembersDialog} onOpenChange={setShowAddMembersDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agregar Miembros a {selectedGroup.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availableUsers.map((user) => (
                <label
                  key={user.email}
                  className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedMembers.has(user.email)}
                    onCheckedChange={(checked) => {
                      const newMembers = new Set(selectedMembers);
                      if (checked) {
                        newMembers.add(user.email);
                      } else {
                        newMembers.delete(user.email);
                      }
                      setSelectedMembers(newMembers);
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{user.full_name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </label>
              ))}

              {availableUsers.length === 0 && (
                <p className="text-center text-slate-500 py-8">Todos los usuarios ya están en el grupo</p>
              )}
            </div>

            <Button
              onClick={() => addMembersMutation.mutate(selectedMembers)}
              disabled={selectedMembers.size === 0 || addMembersMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              Agregar {selectedMembers.size} Miembro{selectedMembers.size !== 1 ? 's' : ''}
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}