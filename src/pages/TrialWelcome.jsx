import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, Clock, Zap, BarChart3, Users, Wrench, ChevronRight, AlertCircle 
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function TrialWelcome() {
  const [user, setUser] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(14);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then((userData) => {
        setUser(userData);
        
        // Calculate days remaining (assuming trial_ends_at is set on user or subscription)
        if (userData?.trial_ends_at) {
          const endDate = new Date(userData.trial_ends_at);
          const today = new Date();
          const remaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
          setDaysRemaining(Math.max(0, remaining));
        }
      })
      .catch((error) => {
        console.error('Error loading user:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-blue-950 flex items-center justify-center">
        <div className="text-slate-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-blue-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          {...fadeInUp}
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
            ¡Bienvenido a Nexus!
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Tu plataforma de mantenimiento predictivo está lista
          </p>
        </motion.div>

        {/* Trial Status Card */}
        <motion.div
          className="mb-12"
          {...fadeInUp}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-cyan-500/30 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-100 mb-2">Período de Prueba Activo</CardTitle>
                  <CardDescription className="text-slate-300">
                    Acceso completo a todas las funciones premium
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-cyan-400">{daysRemaining}</div>
                  <div className="text-sm text-slate-400">días restantes</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-slate-700/30 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(daysRemaining / 14) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="mb-12"
          {...fadeInUp}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Explora estas funciones</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: Wrench,
                title: 'Mantenimiento Predictivo',
                description: 'Reduce fallas con IA avanzada',
                page: 'Maintenance'
              },
              {
                icon: BarChart3,
                title: 'Reportes en Tiempo Real',
                description: 'Análisis detallado de tu operación',
                page: 'Dashboard'
              },
              {
                icon: Users,
                title: 'Gestión de Equipo',
                description: 'Colabora con hasta 50+ usuarios',
                page: 'Settings'
              },
              {
                icon: Zap,
                title: 'Integración Google',
                description: 'Conecta Sheets y Drive automáticamente',
                page: 'Maintenance'
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  {...fadeInUp}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                >
                  <Link to={createPageUrl(feature.page)}>
                    <Card className="bg-blue-900/40 border border-cyan-600/30 h-full hover:border-cyan-400 transition cursor-pointer backdrop-blur hover:shadow-lg hover:shadow-cyan-500/20">
                      <CardHeader>
                        <Icon className="w-8 h-8 text-cyan-400 mb-3" />
                        <CardTitle className="text-slate-100 text-lg">{feature.title}</CardTitle>
                        <CardDescription className="text-slate-400">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Getting Started */}
        <motion.div
          className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-cyan-500/30 rounded-2xl p-8 backdrop-blur mb-12"
          {...fadeInUp}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-cyan-400" />
            Próximos pasos
          </h3>
          
          <div className="space-y-4">
            {[
              'Configura tu perfil y empresa en Configuración',
              'Añade tus equipos y crea el primer mantenimiento',
              'Invita a tu equipo para colaborar',
              'Explora reportes y análisis avanzados'
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-cyan-400 mt-1" />
                </div>
                <p className="text-slate-300">{step}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="grid md:grid-cols-2 gap-6"
          {...fadeInUp}
          transition={{ delay: 0.5 }}
        >
          <Link to={createPageUrl('Dashboard')}>
            <Button 
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-lg"
            >
              Ir al Dashboard
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          
          <Link to={createPageUrl('Maintenance')}>
            <Button 
              variant="outline"
              className="w-full h-12 border-cyan-500 text-cyan-400 hover:bg-blue-900/40 text-lg"
            >
              Ver Mantenimiento
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          className="mt-12 p-6 bg-blue-900/20 border border-cyan-600/20 rounded-xl"
          {...fadeInUp}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-200 font-medium mb-1">
                ¿Necesitas ayuda?
              </p>
              <p className="text-slate-400 text-sm">
                Consulta nuestra documentación o contáctanos en soporte@nexus.com
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}