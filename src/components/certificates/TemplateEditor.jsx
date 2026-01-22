import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Palette, Type, Layout as LayoutIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function TemplateEditor({ template, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    background_image_url: template?.background_image_url || '',
    logo_url: template?.logo_url || '',
    config: template?.config || {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        text: '#1e293b',
        accent: '#f59e0b'
      },
      fonts: {
        title: 'serif',
        body: 'sans-serif'
      },
      layout: {
        userName: { fontSize: '48px', textAlign: 'center', marginTop: '80px' },
        courseTitle: { fontSize: '32px', textAlign: 'center', marginTop: '40px' },
        certificateNumber: { position: 'bottom-right', fontSize: '14px' },
        date: { position: 'bottom-left', fontSize: '14px' }
      },
      border: {
        style: 'solid',
        width: '4px',
        color: '#6366f1'
      }
    }
  });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file, field) => {
    try {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, [field]: file_url }));
      toast.success('Imagen subida correctamente');
    } catch (error) {
      toast.error('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const updateConfig = (path, value) => {
    setFormData(prev => {
      const newConfig = { ...prev.config };
      const keys = path.split('.');
      let current = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      
      return { ...prev, config: newConfig };
    });
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error('El nombre es requerido');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutIcon className="w-5 h-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nombre de la Plantilla</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Plantilla Corporativa"
            />
          </div>
          <div>
            <Label>Descripción</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Breve descripción del estilo"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customization Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="images" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="images">
                <Upload className="w-4 h-4 mr-2" />
                Imágenes
              </TabsTrigger>
              <TabsTrigger value="colors">
                <Palette className="w-4 h-4 mr-2" />
                Colores
              </TabsTrigger>
              <TabsTrigger value="fonts">
                <Type className="w-4 h-4 mr-2" />
                Fuentes
              </TabsTrigger>
              <TabsTrigger value="layout">
                <LayoutIcon className="w-4 h-4 mr-2" />
                Posición
              </TabsTrigger>
            </TabsList>

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-4 pt-4">
              <div>
                <Label>Imagen de Fondo</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'background_image_url')}
                    disabled={uploading}
                  />
                </div>
                {formData.background_image_url && (
                  <img src={formData.background_image_url} alt="Background" className="mt-2 h-24 object-cover rounded border" />
                )}
              </div>

              <div>
                <Label>Logo</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'logo_url')}
                    disabled={uploading}
                  />
                </div>
                {formData.logo_url && (
                  <img src={formData.logo_url} alt="Logo" className="mt-2 h-16 object-contain rounded border bg-white p-2" />
                )}
              </div>
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Color Primario</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.config.colors.primary}
                      onChange={(e) => updateConfig('colors.primary', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.config.colors.primary}
                      onChange={(e) => updateConfig('colors.primary', e.target.value)}
                      placeholder="#6366f1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Color Secundario</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.config.colors.secondary}
                      onChange={(e) => updateConfig('colors.secondary', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.config.colors.secondary}
                      onChange={(e) => updateConfig('colors.secondary', e.target.value)}
                      placeholder="#8b5cf6"
                    />
                  </div>
                </div>

                <div>
                  <Label>Color de Texto</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.config.colors.text}
                      onChange={(e) => updateConfig('colors.text', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.config.colors.text}
                      onChange={(e) => updateConfig('colors.text', e.target.value)}
                      placeholder="#1e293b"
                    />
                  </div>
                </div>

                <div>
                  <Label>Color de Acento</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.config.colors.accent}
                      onChange={(e) => updateConfig('colors.accent', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.config.colors.accent}
                      onChange={(e) => updateConfig('colors.accent', e.target.value)}
                      placeholder="#f59e0b"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Fonts Tab */}
            <TabsContent value="fonts" className="space-y-4 pt-4">
              <div>
                <Label>Fuente de Títulos</Label>
                <Select
                  value={formData.config.fonts.title}
                  onValueChange={(value) => updateConfig('fonts.title', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="serif">Serif (Clásica)</SelectItem>
                    <SelectItem value="sans-serif">Sans-serif (Moderna)</SelectItem>
                    <SelectItem value="monospace">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Fuente del Cuerpo</Label>
                <Select
                  value={formData.config.fonts.body}
                  onValueChange={(value) => updateConfig('fonts.body', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="serif">Serif (Clásica)</SelectItem>
                    <SelectItem value="sans-serif">Sans-serif (Moderna)</SelectItem>
                    <SelectItem value="monospace">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tamaño - Nombre Usuario</Label>
                  <Input
                    value={formData.config.layout.userName.fontSize}
                    onChange={(e) => updateConfig('layout.userName.fontSize', e.target.value)}
                    placeholder="48px"
                  />
                </div>

                <div>
                  <Label>Tamaño - Título del Curso</Label>
                  <Input
                    value={formData.config.layout.courseTitle.fontSize}
                    onChange={(e) => updateConfig('layout.courseTitle.fontSize', e.target.value)}
                    placeholder="32px"
                  />
                </div>

                <div>
                  <Label>Posición - N° Certificado</Label>
                  <Select
                    value={formData.config.layout.certificateNumber.position}
                    onValueChange={(value) => updateConfig('layout.certificateNumber.position', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-left">Abajo Izquierda</SelectItem>
                      <SelectItem value="bottom-right">Abajo Derecha</SelectItem>
                      <SelectItem value="bottom-center">Abajo Centro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Posición - Fecha</Label>
                  <Select
                    value={formData.config.layout.date.position}
                    onValueChange={(value) => updateConfig('layout.date.position', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-left">Abajo Izquierda</SelectItem>
                      <SelectItem value="bottom-right">Abajo Derecha</SelectItem>
                      <SelectItem value="bottom-center">Abajo Centro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label className="mb-3 block">Estilo del Borde</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Estilo</Label>
                    <Select
                      value={formData.config.border.style}
                      onValueChange={(value) => updateConfig('border.style', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Sólido</SelectItem>
                        <SelectItem value="double">Doble</SelectItem>
                        <SelectItem value="dashed">Punteado</SelectItem>
                        <SelectItem value="none">Sin borde</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Grosor</Label>
                    <Input
                      value={formData.config.border.width}
                      onChange={(e) => updateConfig('border.width', e.target.value)}
                      placeholder="4px"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Color</Label>
                    <Input
                      type="color"
                      value={formData.config.border.color}
                      onChange={(e) => updateConfig('border.color', e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button onClick={onCancel} variant="outline">
          Cancelar
        </Button>
        <Button onClick={handleSave} className="bg-gradient-to-r from-indigo-500 to-violet-500">
          Guardar Plantilla
        </Button>
      </div>
    </div>
  );
}