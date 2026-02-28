import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wrench, BookOpen, Users, BarChart3, Zap, Shield, 
  ChevronRight, Menu, X, Sparkles, Gauge, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = async () => {
    await base44.auth.redirectToLogin('/Dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-blue-950/80 backdrop-blur-xl border-b border-cyan-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg">ModulaX</span>
          </div>

          {/* Desktop Menu */}
           <div className="hidden md:flex items-center gap-8">
             <a href="#features" className="hover:text-cyan-400 transition">Características</a>
             <a href="#pricing" className="hover:text-cyan-400 transition">Precios</a>
             <a href="#benefits" className="hover:text-cyan-400 transition">Beneficios</a>
           </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-blue-900 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>

          {/* Desktop CTA */}
          <div className="hidden md:flex gap-3">
            <Button 
               variant="outline" 
               className="border-cyan-600 text-white hover:bg-blue-900"
               onClick={handleLogin}
             >
               Ingresar
             </Button>
             <Button 
               onClick={handleLogin}
               className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
             >
               Comenzar gratis
             </Button>
          </div>
        </div>

        {/* Mobile Menu */}
         {mobileMenuOpen && (
           <div className="md:hidden border-t border-cyan-700/30 p-4 space-y-3">
             <a href="#features" className="block hover:text-cyan-400">Características</a>
             <a href="#pricing" className="block hover:text-cyan-400">Precios</a>
             <a href="#benefits" className="block hover:text-cyan-400">Beneficios</a>
             <Button onClick={handleLogin} className="w-full bg-cyan-600 hover:bg-cyan-700">
               Comenzar
             </Button>
           </div>
         )}
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <motion.h1 
          className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent"
          {...fadeInUp}
        >
          Mantenimiento inteligente para industria minera
        </motion.h1>
        
        <motion.p 
          className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto"
          {...fadeInUp}
        >
          Reduce tiempos de inactividad, optimiza recursos y aumenta la productividad con nuestra plataforma integral de mantenimiento predictivo.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          {...fadeInUp}
        >
          <Button 
            onClick={handleLogin}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white h-12 px-8 text-lg"
          >
            Prueba gratis 14 días
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          <Button 
            variant="outline"
            className="border-cyan-500 text-white hover:bg-blue-900 h-12 px-8 text-lg"
            onClick={() => document.getElementById('features').scrollIntoView()}
          >
            Ver características
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-3 gap-4 mt-16 max-w-2xl mx-auto"
          {...fadeInUp}
        >
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-cyan-600">95%</div>
            <div className="text-sm text-slate-600">Reducción de fallas</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-cyan-600">500+</div>
            <div className="text-sm text-slate-600">Empresas activas</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-cyan-600">24/7</div>
            <div className="text-sm text-slate-600">Soporte técnico</div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-16">Características principales</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Wrench,
              title: 'Mantenimiento predictivo',
              description: 'IA que predice fallas antes de que ocurran, reduciendo tiempos de inactividad'
            },
            {
              icon: Gauge,
              title: 'Monitoreo en tiempo real',
              description: 'Dashboard que muestra estado de equipos y alertas instantáneas'
            },
            {
              icon: BookOpen,
              title: 'Capacitación integrada',
              description: 'Cursos y certificaciones para tus técnicos sin salir de la plataforma'
            },
            {
              icon: BarChart3,
              title: 'Reportes avanzados',
              description: 'Análisis detallado de ROI y métricas de mantenimiento'
            },
            {
              icon: Users,
              title: 'Colaboración en equipo',
              description: 'Gestiona hasta 50+ usuarios con roles y permisos configurables'
            },
            {
              icon: Zap,
              title: 'Integración con Google',
              description: 'Conecta con Sheets y Drive para automatizar tus procesos'
            }
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-white border-slate-200 h-full hover:border-cyan-500 transition">
                  <CardHeader>
                    <Icon className="w-10 h-10 text-cyan-600 mb-4" />
                    <CardTitle className="text-slate-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Pricing Preview */}
       <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-gradient-to-b from-blue-950/50 to-slate-950 rounded-2xl">
        <h2 className="text-4xl font-bold text-center mb-4">Planes simples y transparentes</h2>
        <p className="text-center text-slate-400 mb-12">Sin sorpresas, sin contratos largos</p>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: 'Gratuito', price: '$0', users: '5', maintenance: '10/mes', color: 'border-slate-200' },
            { name: 'PRO', price: '$149', users: '50', maintenance: 'Ilimitado', color: 'border-cyan-500 shadow-lg shadow-cyan-500/30 scale-105' },
            { name: 'Enterprise', price: '$399', users: 'Ilimitado', maintenance: 'Ilimitado', color: 'border-blue-500' }
          ].map((plan, idx) => (
            <div key={idx} className={`border-2 rounded-xl p-6 bg-white ${plan.color}`}>
              <h3 className="text-xl font-bold mb-2 text-slate-900">{plan.name}</h3>
              <div className="text-3xl font-bold mb-4 text-slate-900">{plan.price}<span className="text-lg text-slate-600">/mes</span></div>
              <div className="space-y-2 text-sm text-slate-700 mb-6">
                <p>👥 {plan.users} usuarios</p>
                <p>🔧 {plan.maintenance} registros</p>
              </div>
              <Button className="w-full" onClick={handleLogin}>
                Comenzar
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-4xl font-bold mb-6">¿Listo para optimizar tu mantenimiento?</h2>
        <p className="text-xl text-slate-400 mb-8">Inicia gratis y sin tarjeta de crédito</p>
        <Button 
          onClick={handleLogin}
          size="lg"
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 h-12 px-8 text-lg text-white"
        >
          Comenzar ahora
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-700/30 py-12 text-center text-slate-500">
        <p>© 2026 ModulaX. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}