import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Award, Layout, Eye, Check, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import CertificateTemplate from '../components/certificates/CertificateGenerator';
import TemplateEditor from '../components/certificates/TemplateEditor';
import CustomCertificateRenderer from '../components/certificates/CustomCertificateRenderer';

const builtInTemplates = [
  {
    id: 'modern',
    name: 'Moderno',
    description: 'Diseño contemporáneo con gradientes y elementos minimalistas',
    isBuiltIn: true
  },
  {
    id: 'default',
    name: 'Clásico',
    description: 'Certificado tradicional con bordes dorados y estilo formal',
    isBuiltIn: true
  },
];

export default function CertificateTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: customTemplates = [] } = useQuery({
    queryKey: ['certificateTemplates'],
    queryFn: () => base44.entities.CertificateTemplate.list(),
  });

  const mockCertificate = {
    certificate_number: 'CERT-2026-DEMO123',
    issued_date: new Date().toISOString(),
    score: 95,
  };

  const mockCourse = {
    title: 'Operación Segura de Maquinaria Pesada',
  };

  const saveTemplateMutation = useMutation({
    mutationFn: (data) => {
      if (editingTemplate?.id) {
        return base44.entities.CertificateTemplate.update(editingTemplate.id, data);
      }
      return base44.entities.CertificateTemplate.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['certificateTemplates']);
      setShowEditor(false);
      setEditingTemplate(null);
      toast.success('Plantilla guardada correctamente');
    },
    onError: () => {
      toast.error('Error al guardar la plantilla');
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.CertificateTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['certificateTemplates']);
      toast.success('Plantilla eliminada');
    },
    onError: () => {
      toast.error('Error al eliminar la plantilla');
    }
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (templateId) => {
      // Unset all other defaults
      const allTemplates = customTemplates;
      for (const t of allTemplates) {
        if (t.is_default && t.id !== templateId) {
          await base44.entities.CertificateTemplate.update(t.id, { is_default: false });
        }
      }
      
      // Set new default
      const template = customTemplates.find(t => t.id === templateId);
      if (template) {
        await base44.entities.CertificateTemplate.update(templateId, { is_default: true });
      } else {
        // It's a built-in template, save in user
        await base44.auth.updateMe({ certificate_template: templateId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['certificateTemplates']);
      queryClient.invalidateQueries(['user']);
      toast.success('Plantilla establecida como predeterminada');
    }
  });

  const handleSaveEditor = (data) => {
    saveTemplateMutation.mutate(data);
  };

  const handleDelete = (template) => {
    if (confirm('¿Estás seguro de eliminar esta plantilla?')) {
      deleteTemplateMutation.mutate(template.id);
    }
  };

  React.useEffect(() => {
    const defaultCustom = customTemplates.find(t => t.is_default);
    if (defaultCustom) {
      setSelectedTemplate(defaultCustom.id);
    } else if (user?.certificate_template) {
      setSelectedTemplate(user.certificate_template);
    } else {
      setSelectedTemplate('modern');
    }
  }, [user, customTemplates]);

  const allTemplates = [...builtInTemplates, ...customTemplates];
  const getTemplate = (id) => allTemplates.find(t => t.id === id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
              <Layout className="w-7 h-7 text-white" />
            </div>
            Plantillas de Certificados
          </h1>
          <p className="text-slate-600 mt-1">Personaliza el diseño de los certificados generados</p>
        </div>

        {/* Add Template Button */}
        {user?.role === 'admin' && (
          <Button
            onClick={() => {
              setEditingTemplate(null);
              setShowEditor(true);
            }}
            className="bg-gradient-to-r from-indigo-500 to-violet-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Plantilla Personalizada
          </Button>
        )}

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {allTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`hover:shadow-lg transition-all ${
                selectedTemplate === template.id ? 'border-2 border-indigo-500 shadow-lg' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {template.name}
                        {selectedTemplate === template.id && (
                          <Badge className="bg-indigo-500">
                            <Check className="w-3 h-3 mr-1" />
                            Activa
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">{template.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Preview thumbnail */}
                  <div className="relative aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="transform scale-[0.15] origin-center">
                        {template.isBuiltIn ? (
                          <CertificateTemplate
                            certificate={mockCertificate}
                            user={user}
                            course={mockCourse}
                            template={template.id}
                          />
                        ) : (
                          <CustomCertificateRenderer
                            certificate={mockCertificate}
                            user={user}
                            course={mockCourse}
                            template={template}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPreviewTemplate(template)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Vista Previa
                    </Button>
                    
                    {!template.isBuiltIn && user?.role === 'admin' && (
                      <>
                        <Button
                          onClick={() => {
                            setEditingTemplate(template);
                            setShowEditor(true);
                          }}
                          variant="outline"
                          size="icon"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(template)}
                          variant="outline"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    <Button
                      onClick={() => setDefaultMutation.mutate(template.id || template.id)}
                      disabled={selectedTemplate === template.id}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-500"
                    >
                      {selectedTemplate === template.id ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Activa
                        </>
                      ) : (
                        'Activar'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Generación Automática
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 text-sm">
              Los certificados se generan automáticamente cuando un estudiante completa un curso marcado 
              para certificación. La plantilla seleccionada se aplicará a todos los certificados nuevos.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Vista Previa - {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="flex justify-center p-4 bg-slate-50 rounded-lg overflow-auto">
              <div className="transform scale-75 origin-top">
                {previewTemplate.isBuiltIn ? (
                  <CertificateTemplate
                    certificate={mockCertificate}
                    user={user}
                    course={mockCourse}
                    template={previewTemplate.id}
                  />
                ) : (
                  <CustomCertificateRenderer
                    certificate={mockCertificate}
                    user={user}
                    course={mockCourse}
                    template={previewTemplate}
                  />
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={(open) => {
        if (!open) {
          setShowEditor(false);
          setEditingTemplate(null);
        }
      }}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla Personalizada'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Editor */}
            <div>
              <TemplateEditor
                template={editingTemplate}
                onSave={handleSaveEditor}
                onCancel={() => {
                  setShowEditor(false);
                  setEditingTemplate(null);
                }}
              />
            </div>

            {/* Live Preview */}
            <div className="sticky top-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Vista Previa en Vivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-100 rounded-lg p-4 overflow-auto">
                    <div className="transform scale-[0.35] origin-top-left">
                      <CustomCertificateRenderer
                        certificate={mockCertificate}
                        user={user}
                        course={mockCourse}
                        template={{
                          ...editingTemplate,
                          config: editingTemplate?.config
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}