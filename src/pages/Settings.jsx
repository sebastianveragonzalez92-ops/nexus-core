import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Shield, Bell, Database, Globe, Save, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const settingsSections = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'security', label: 'Seguridad', icon: Shield },
  { id: 'data', label: 'Datos', icon: Database },
];

export default function Settings() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    notifications_enabled: true,
    email_alerts: true,
    auto_sync: true,
    offline_mode: true,
  });

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setFormData(prev => ({
        ...prev,
        full_name: u.full_name || '',
        email: u.email || '',
        notifications_enabled: u.notifications_enabled ?? true,
        email_alerts: u.email_alerts ?? true,
        auto_sync: u.auto_sync ?? true,
        offline_mode: u.offline_mode ?? true,
      }));
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await base44.auth.updateMe({
      notifications_enabled: formData.notifications_enabled,
      email_alerts: formData.email_alerts,
      auto_sync: formData.auto_sync,
      offline_mode: formData.offline_mode,
    });
    setIsSaving(false);
    toast.success('Configuración guardada');
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Configuración</h1>
          <p className="text-slate-500 mt-1">Gestiona las preferencias de tu cuenta y plataforma</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:w-64 shrink-0"
          >
            <nav className="bg-white rounded-2xl border border-slate-200 p-2 space-y-1">
              {settingsSections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                    activeSection === id
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5",
                    activeSection === id ? "text-indigo-600" : "text-slate-400"
                  )} />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </nav>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full mt-4 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
          </motion.aside>

          {/* Content */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            {activeSection === 'profile' && (
              <Card className="rounded-2xl border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-50">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    Información del perfil
                  </CardTitle>
                  <CardDescription>
                    Actualiza tu información personal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        value={formData.full_name}
                        disabled
                        className="rounded-xl bg-slate-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input
                        id="email"
                        value={formData.email}
                        disabled
                        className="rounded-xl bg-slate-50"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-slate-500">
                    Para cambiar tu nombre o correo, contacta al administrador.
                  </p>
                </CardContent>
              </Card>
            )}

            {activeSection === 'notifications' && (
              <Card className="rounded-2xl border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-50">
                      <Bell className="w-5 h-5 text-amber-600" />
                    </div>
                    Notificaciones
                  </CardTitle>
                  <CardDescription>
                    Configura cómo recibes las alertas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-900">Notificaciones push</p>
                      <p className="text-sm text-slate-500">Recibe alertas en tiempo real</p>
                    </div>
                    <Switch
                      checked={formData.notifications_enabled}
                      onCheckedChange={(v) => setFormData({ ...formData, notifications_enabled: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-900">Alertas por correo</p>
                      <p className="text-sm text-slate-500">Recibe resúmenes diarios</p>
                    </div>
                    <Switch
                      checked={formData.email_alerts}
                      onCheckedChange={(v) => setFormData({ ...formData, email_alerts: v })}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'security' && (
              <Card className="rounded-2xl border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-50">
                      <Shield className="w-5 h-5 text-emerald-600" />
                    </div>
                    Seguridad
                  </CardTitle>
                  <CardDescription>
                    Protege tu cuenta y datos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="font-medium text-emerald-900">Cuenta protegida</p>
                        <p className="text-sm text-emerald-700">Tu sesión está autenticada de forma segura</p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Sesiones activas</h4>
                    <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="font-medium text-slate-900">Navegador actual</p>
                          <p className="text-sm text-slate-500">Sesión activa ahora</p>
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'data' && (
              <Card className="rounded-2xl border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-violet-50">
                      <Database className="w-5 h-5 text-violet-600" />
                    </div>
                    Sincronización de datos
                  </CardTitle>
                  <CardDescription>
                    Configura el comportamiento offline
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-900">Sincronización automática</p>
                      <p className="text-sm text-slate-500">Sincroniza datos al conectar</p>
                    </div>
                    <Switch
                      checked={formData.auto_sync}
                      onCheckedChange={(v) => setFormData({ ...formData, auto_sync: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-900">Modo offline</p>
                      <p className="text-sm text-slate-500">Permite trabajar sin conexión</p>
                    </div>
                    <Switch
                      checked={formData.offline_mode}
                      onCheckedChange={(v) => setFormData({ ...formData, offline_mode: v })}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-lg shadow-indigo-200"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}