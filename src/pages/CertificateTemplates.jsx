import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Award, Layout, Eye, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import CertificateTemplate from '../components/certificates/CertificateGenerator';

const templates = [
  {
    id: 'modern',
    name: 'Moderno',
    description: 'Diseño contemporáneo con gradientes y elementos minimalistas',
    preview: '/images/template-modern.jpg',
  },
  {
    id: 'default',
    name: 'Clásico',
    description: 'Certificado tradicional con bordes dorados y estilo formal',
    preview: '/images/template-classic.jpg',
  },
];

export default function CertificateTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const mockCertificate = {
    certificate_number: 'CERT-2026-DEMO123',
    issued_date: new Date().toISOString(),
    score: 95,
  };

  const mockCourse = {
    title: 'Operación Segura de Maquinaria Pesada',
  };

  const handleSaveTemplate = async (templateId) => {
    try {
      await base44.auth.updateMe({ 
        certificate_template: templateId 
      });
      setSelectedTemplate(templateId);
      toast.success('Plantilla guardada como predeterminada');
    } catch (error) {
      toast.error('Error al guardar la plantilla');
    }
  };

  React.useEffect(() => {
    if (user?.certificate_template) {
      setSelectedTemplate(user.certificate_template);
    } else {
      setSelectedTemplate('modern');
    }
  }, [user]);

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

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {templates.map((template, index) => (
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
                        <CertificateTemplate
                          certificate={mockCertificate}
                          user={user}
                          course={mockCourse}
                          template={template.id}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPreviewTemplate(template.id)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Vista Previa
                    </Button>
                    <Button
                      onClick={() => handleSaveTemplate(template.id)}
                      disabled={selectedTemplate === template.id}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-500"
                    >
                      {selectedTemplate === template.id ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Seleccionada
                        </>
                      ) : (
                        'Seleccionar'
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
            <DialogTitle>Vista Previa - Plantilla {templates.find(t => t.id === previewTemplate)?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="flex justify-center p-4 bg-slate-50 rounded-lg overflow-auto">
              <div className="transform scale-75 origin-top">
                <CertificateTemplate
                  certificate={mockCertificate}
                  user={user}
                  course={mockCourse}
                  template={previewTemplate}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}