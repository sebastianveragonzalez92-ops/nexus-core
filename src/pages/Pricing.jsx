import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

export default function Pricing() {
  const [selectedBilling, setSelectedBilling] = useState('monthly');

  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      badge: null,
      price: selectedBilling === 'monthly' ? 49 : 470,
      billingPeriod: selectedBilling === 'monthly' ? '/mes' : '/año (-20%)',
      description: 'Para equipos pequeños que quieren empezar a digitalizar su mantenimiento.',
      color: 'border-slate-200',
      featured: false,
      features: [
        { label: 'Hasta 10 usuarios', included: true },
        { label: '50 registros de mantenimiento/mes', included: true },
        { label: 'Gestión de equipos', included: true },
        { label: 'Checklists básicos', included: true },
        { label: 'Órdenes de trabajo', included: true },
        { label: 'Reportes básicos', included: false },
        { label: 'KPIs y análisis avanzado', included: false },
        { label: 'Módulo de capacitación', included: false },
        { label: 'Integración Google Sheets', included: false },
        { label: 'IA y mantenimiento predictivo', included: false },
        { label: 'Soporte por email', included: true },
        { label: 'Soporte prioritario 24/7', included: false },
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      badge: 'Más popular',
      price: selectedBilling === 'monthly' ? 149 : 1430,
      billingPeriod: selectedBilling === 'monthly' ? '/mes' : '/año (-20%)',
      description: 'Para empresas en crecimiento que necesitan control total de sus operaciones.',
      color: 'border-indigo-500 shadow-xl shadow-indigo-500/20 scale-105',
      featured: true,
      features: [
        { label: 'Hasta 50 usuarios', included: true },
        { label: 'Registros ilimitados', included: true },
        { label: 'Gestión de equipos + inventario', included: true },
        { label: 'Checklists avanzados con IA', included: true },
        { label: 'Órdenes de trabajo + aprobaciones', included: true },
        { label: 'Reportes avanzados y exportación', included: true },
        { label: 'KPIs y análisis avanzado', included: true },
        { label: 'Módulo de capacitación (10 cursos)', included: true },
        { label: 'Integración Google Sheets', included: true },
        { label: 'IA y mantenimiento predictivo', included: false },
        { label: 'Soporte prioritario por email', included: true },
        { label: 'Soporte 24/7 dedicado', included: false },
      ]
    },
    {
      id: 'enterprise',
      name: 'Empresa',
      badge: 'Soporte premium',
      price: selectedBilling === 'monthly' ? 399 : 3830,
      billingPeriod: selectedBilling === 'monthly' ? '/mes' : '/año (-20%)',
      description: 'Para operaciones industriales complejas que exigen máxima confiabilidad.',
      color: 'border-purple-500',
      featured: false,
      features: [
        { label: 'Usuarios ilimitados', included: true },
        { label: 'Registros ilimitados', included: true },
        { label: 'Todo lo del plan Pro', included: true },
        { label: 'Checklists avanzados con IA', included: true },
        { label: 'Órdenes de trabajo + aprobaciones', included: true },
        { label: 'Reportes avanzados y exportación', included: true },
        { label: 'KPIs y análisis avanzado', included: true },
        { label: 'Cursos ilimitados + certificaciones', included: true },
        { label: 'Integración Google Sheets/Drive', included: true },
        { label: 'IA y mantenimiento predictivo', included: true },
        { label: 'Soporte prioritario por email', included: true },
        { label: 'Soporte premium 24/7 + onboarding', included: true },
      ]
    }
  ];

  const handleSelectPlan = async (planId) => {
    if (planId === 'basic') {
      await base44.auth.redirectToLogin('/Trial');
      return;
    }
    
    try {
      const response = await base44.functions.invoke('createMercadoPagoPreference', {
        plan: planId,
        billingCycle: selectedBilling
      });

      if (response.data.init_point) {
        window.location.href = response.data.init_point;
      }
    } catch (error) {
      alert('Error al procesar el pago. Intenta nuevamente.');
      console.error('Payment error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Planes de Precios</h1>
          <p className="text-lg text-slate-600 mb-8">
            Elige el plan perfecto para tu operación de mantenimiento
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setSelectedBilling('monthly')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedBilling === 'monthly'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setSelectedBilling('annual')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedBilling === 'annual'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Anual <span className="text-xs ml-1">(-20%)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 items-start">
          {plans.map((plan) => (
            <div key={plan.id} className={`transition-all duration-300 ${plan.featured ? 'scale-105' : ''}`}>
              <Card className={`border-2 h-full flex flex-col relative ${plan.color}`}>
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white ${plan.featured ? 'bg-indigo-600' : 'bg-purple-600'}`}>
                    {plan.badge}
                  </div>
                )}
                <CardHeader className="pt-6">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-slate-900">${plan.price.toLocaleString()}</span>
                    <span className="text-sm text-slate-500 ml-2">{plan.billingPeriod}</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full mb-6 ${
                      plan.featured
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : plan.id === 'enterprise'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-slate-800 hover:bg-slate-900 text-white'
                    }`}
                  >
                    {plan.id === 'basic' ? 'Empezar con Básico' : plan.id === 'pro' ? 'Elegir Pro' : 'Contactar ventas'}
                  </Button>

                  <div className="space-y-2.5 flex-1">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm leading-snug ${feature.included ? 'text-slate-700' : 'text-slate-400'}`}>
                          {feature.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader>
            <CardTitle>¿Necesitas ayuda para elegir?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <p>✅ <strong>Trial de 14 días:</strong> Prueba el plan Pro sin costo para nuevos usuarios</p>
            <p>✅ <strong>Descuento anual:</strong> 20% de descuento pagando 12 meses adelantado</p>
            <p>✅ <strong>Plan Empresa:</strong> Incluye onboarding personalizado y gestor de cuenta dedicado</p>
            <p className="mt-4">¿Preguntas? <a href="mailto:ventas@nexus.com" className="text-indigo-600 font-medium">Habla con nuestro equipo</a></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}