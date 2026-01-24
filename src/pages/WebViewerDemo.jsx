import React, { useState } from 'react';
import { motion } from 'framer-motion';
import WebViewer from '@/components/ui/WebViewer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Globe, Shield, Lock } from 'lucide-react';

export default function WebViewerDemo() {
  const [url, setUrl] = useState('https://www.wikipedia.org');
  const [currentUrl, setCurrentUrl] = useState('https://www.wikipedia.org');
  const [allowScripts, setAllowScripts] = useState(false);
  const [allowForms, setAllowForms] = useState(true);
  const [allowPopups, setAllowPopups] = useState(false);

  const handleLoadUrl = () => {
    setCurrentUrl(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Web Viewer</h1>
              <p className="text-slate-600">Navegador seguro con sandbox</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Configuración
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="text-sm"
                  />
                  <Button 
                    onClick={handleLoadUrl} 
                    className="w-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  >
                    Cargar URL
                  </Button>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Scripts</Label>
                      <p className="text-xs text-slate-500">Permitir JavaScript</p>
                    </div>
                    <Switch
                      checked={allowScripts}
                      onCheckedChange={setAllowScripts}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Formularios</Label>
                      <p className="text-xs text-slate-500">Permitir envío de forms</p>
                    </div>
                    <Switch
                      checked={allowForms}
                      onCheckedChange={setAllowForms}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Popups</Label>
                      <p className="text-xs text-slate-500">Permitir ventanas nuevas</p>
                    </div>
                    <Switch
                      checked={allowPopups}
                      onCheckedChange={setAllowPopups}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-start gap-2 p-3 bg-indigo-50 rounded-lg">
                    <Lock className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-indigo-900">Protección activa</p>
                      <p className="text-xs text-indigo-700 mt-1">
                        El sandbox bloquea extensiones del navegador y scripts externos
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Viewer */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <WebViewer
              url={currentUrl}
              title="Navegador Seguro"
              allowScripts={allowScripts}
              allowForms={allowForms}
              allowPopups={allowPopups}
              onLoad={() => console.log('Contenido cargado')}
              onError={() => console.error('Error al cargar')}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}