import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPageUrl } from '@/utils';
import { ChevronRight, Check, Clock, Zap, BookOpen, Users, BarChart3, Lock, Wrench, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Trial() {
  const [user, setUser] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);

  useEffect(() => {
    base44.auth.me().then((userData) => {
      setUser(userData);
    });
  }, []);

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: () => user?.email ? base44.entities.Subscription.filter({ user_email: user.email }) : Promise.resolve([]),
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (subscription?.length > 0) {
      const sub = subscription[0];
      if (sub.trial_ends_at) {
        const endDate = new Date(sub.trial_ends_at);
        const today = new Date();
        const days = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        setDaysRemaining(Math.max(0, days));
      }
    }
  }, [subscription]);

  const trialFeatures = [
    { icon: Wrench, label: 'Mantenimiento predictivo', included: true },
    { icon: Gauge, label: 'Monitoreo en tiempo real', included: true },
    { icon: Users, label: 'Colaboración de equipo (5 usuarios)', included: true },
    { icon: BookOpen, label: 'Acceso limitado a capacitación', included: true },
    { icon: BarChart3, label: 'Reportes avanzados', included: false },
    { icon: Zap, label: 'Integración con Google', included: false },
  ];

  const pricingPlans = [
    {
      name: 'PRO',
      price: '$149',
      period: '/mes',
      features: ['50 usuarios', 'Registros ilimitados', 'Reportes avanzados'],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: '$399',
      period: '/mes',
      features: ['Usuarios ilimitados', 'Registros ilimitados', 'Soporte prioritario'],
      highlighted: false,
    },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div className="text-center mb-12" {...fadeInUp}>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Prueba gratuita de 14 días
          </h1>
          <p className="text-xl text-slate-600">
            Explora todas las características de Nexus sin compromiso
          </p>
        </motion.div>

        {/* Trial Status Card */}
        <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
          <Card className="mb-12 border-2 border-cyan-500 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Tu período de prueba
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <p className="text-slate-600 text-sm mb-2">Días restantes</p>
                  <p className="text-5xl font-bold text-slate-900">{daysRemaining ?? '-'}</p>
                </div>
                <div className="flex-1">
                  <div className="bg-slate-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all"
                      style={{ width: `${Math.max(0, Math.min(100, (daysRemaining / 14) * 100))}%` }}
                    />
                  </div>
                  <p className="text-slate-600 text-sm mt-2">
                    {daysRemaining !== null && daysRemaining > 0
                      ? `Finaliza el ${new Date(subscription?.[0]?.trial_ends_at).toLocaleDateString('es-ES')}`
                      : 'Prueba finalizada'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Grid */}
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Características disponibles</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {trialFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={idx}
                  className={`${
                    feature.included
                      ? 'bg-white border-green-200'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        feature.included
                          ? 'bg-green-100'
                          : 'bg-slate-200'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          feature.included ? 'text-green-600' : 'text-slate-400'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{feature.label}</p>
                    </div>
                    {feature.included && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                    {!feature.included && (
                      <Lock className="w-5 h-5 text-slate-300" />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Pricing Plans */}
        <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Planes disponibles</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {pricingPlans.map((plan, idx) => (
              <Card
                key={idx}
                className={`${
                  plan.highlighted
                    ? 'border-2 border-cyan-500 shadow-lg scale-105'
                    : 'border-2 border-slate-200'
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    {plan.highlighted && (
                      <span className="bg-cyan-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Recomendado
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-4xl font-bold text-slate-900">
                      {plan.price}
                      <span className="text-lg text-slate-600">{plan.period}</span>
                    </p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-center gap-2 text-slate-600">
                        <Check className="w-4 h-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full h-11 ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white'
                        : 'bg-white border-2 border-slate-300 text-slate-900 hover:bg-slate-50'
                    }`}
                    onClick={() => window.location.href = createPageUrl('Pricing')}
                  >
                    Suscribirse ahora
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">¿Necesitas más tiempo para decidir?</h3>
          <p className="text-cyan-100 mb-6">
            Contacta a nuestro equipo de soporte para conocer más opciones personalizadas
          </p>
          <Button
            className="bg-white text-cyan-600 hover:bg-cyan-50"
            onClick={() => {
              const email = `mailto:soporte@nexus.cl?subject=Consulta sobre prueba gratis`;
              window.location.href = email;
            }}
          >
            Contactar soporte
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}