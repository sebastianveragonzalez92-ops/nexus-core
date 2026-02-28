import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clipboard } from 'lucide-react';
import ChecklistTemplateManager from '@/components/checklists/ChecklistTemplateManager';
import ChecklistExecutor from '@/components/checklists/ChecklistExecutor';
import ChecklistHistory from '@/components/checklists/ChecklistHistory';

export default function Checklists() {
  const [user, setUser] = useState(null);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [activeTab, setActiveTab] = useState('execute');

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(console.error);
  }, []);

  const { data: templates = [] } = useQuery({
    queryKey: ['checklistTemplates'],
    queryFn: () => base44.entities.ChecklistTemplate.list('-created_date'),
  });

  const { data: executions = [] } = useQuery({
    queryKey: ['checklistExecutions'],
    queryFn: () => base44.entities.ChecklistExecution.list('-execution_date'),
  });

  const isAdmin = user?.role === 'admin';
  const isSupervisor = user?.role === 'supervisor';
  const canManageTemplates = isAdmin || isSupervisor;

  // Filtrar templates aplicables al usuario
  const applicableTemplates = templates.filter(t => 
    t.status === 'active' && 
    (t.applicable_roles?.includes(user?.role) || !t.applicable_roles?.length)
  );

  const userExecutions = executions.filter(e => e.user_email === user?.email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Clipboard className="w-8 h-8 text-blue-600" />
                Checklists Dinámicos
              </h1>
              <p className="text-slate-600 mt-2">Gestiona checklists de EPP, inicio de turno y más</p>
            </div>
            {canManageTemplates && (
              <Button
                onClick={() => setShowNewTemplate(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Template
              </Button>
            )}
          </div>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="execute">Ejecutar Checklist</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
            {canManageTemplates && <TabsTrigger value="templates">Gestionar Templates</TabsTrigger>}
          </TabsList>

          {/* Execute Tab */}
          <TabsContent value="execute" className="space-y-6">
            {applicableTemplates.length > 0 ? (
              <div className="grid gap-6">
                {applicableTemplates.map(template => (
                  <ChecklistExecutor
                    key={template.id}
                    template={template}
                    user={user}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-slate-500">No hay checklists disponibles para tu rol</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <ChecklistHistory
              executions={userExecutions}
              canReview={canManageTemplates}
            />
          </TabsContent>

          {/* Templates Tab */}
          {canManageTemplates && (
            <TabsContent value="templates" className="space-y-6">
              <ChecklistTemplateManager
                templates={templates}
                user={user}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}