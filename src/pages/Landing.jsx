import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  Wrench, BookOpen, BarChart3, Zap, Shield, ChevronRight,
  Menu, X, Hexagon, CheckCircle2, Clock, TrendingUp, Users,
  AlertTriangle, ClipboardList, Star, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay }
});

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = async () => {
    await base44.auth.redirectToLogin('/Dashboard');
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-blue-950/80 backdrop-blur-xl border-b border-cyan-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Hexagon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Nexus</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <button onClick={() => scrollTo('how')} className="hover:text-cyan-400 transition">Cómo funciona</button>
            <button onClick={() => scrollTo('features')} className="hover:text-cyan-400 transition">Características</button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-cyan-400 transition">Precios</button>
            <button onClick={() => scrollTo('testimonials')} className="hover:text-cyan-400 transition">Clientes</button>
          </div>

          <div className="hidden md:flex gap-3">
            <Button variant="ghost" className="text-slate-200 hover:text-white hover:bg-blue-900" onClick={handleLogin}>
              Ingresar
            </Button>
            <Button onClick={handleLogin} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold">
              Prueba gratis 14 días
            </Button>
          </div>

          <button className="md:hidden p-2 hover:bg-blue-900 rounded-lg" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-cyan-700/30 px-4 py-4 space-y-3 text-sm">
            <button onClick={() => scrollTo('how')} className="block w-full text-left text-slate-300 hover:text-cyan-400 py-1">Cómo funciona</button>
            <button onClick={() => scrollTo('features')} className="block w-full text-left text-slate-300 hover:text-cyan-400 py-1">Características</button>
            <button onClick={() => scrollTo('pricing')} className="block w-full text-left text-slate-300 hover:text-cyan-400 py-1">Precios</button>
            <Button onClick={handleLogin} className="w-full bg-cyan-600 hover:bg-cyan-500 mt-2">Comenzar gratis</Button>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Plataforma de mantenimiento industrial con IA
        </motion.div>

        <motion.h1 {...fadeUp(0.1)} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-cyan-300 via-blue-200 to-cyan-300 bg-clip-text text-transparent">
            Cero fallas inesperadas.
          </span>
          <br />
          <span className="text-white">Máxima productividad.</span>
        </motion.h1>

        <motion.p {...fadeUp(0.2)} className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Nexus unifica mantenimiento predictivo, capacitación técnica y gestión de equipos en una sola plataforma. Diseñada para la industria minera y manufactura.
        </motion.p>

        <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl('Trial')}>
            <Button className="h-13 px-8 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white gap-2 shadow-lg shadow-cyan-500/30">
              Prueba gratis 14 días — sin tarjeta
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
          <Button variant="outline" className="h-13 px-8 text-base border-slate-600 text-slate-200 hover:bg-slate-800 hover:border-slate-400 gap-2" onClick={() => scrollTo('how')}>
            Ver cómo funciona
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp(0.4)} className="grid grid-cols-3 gap-4 mt-16 max-w-2xl mx-auto">
          {[
            { value: '40%', label: 'Reducción de tiempos muertos' },
            { value: '500+', label: 'Empresas industriales' },
            { value: '24/7', label: 'Monitoreo continuo' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur">
              <div className="text-2xl font-bold text-cyan-400">{s.value}</div>
              <div className="text-xs text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Problema / Solución ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-red-950/30 border border-red-500/20 rounded-2xl p-7">
            <div className="flex items-center gap-2 text-red-400 font-semibold mb-4">
              <AlertTriangle className="w-5 h-5" /> Sin Nexus
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              {[
                'Fallas inesperadas paralizan la producción horas enteras',
                'Historial de mantenimiento en planillas desorganizadas',
                'Técnicos sin capacitación actualizada cometen errores',
                'Sin visibilidad real del estado de los equipos',
                'Informes manuales que toman horas en preparar',
              ].map(t => (
                <li key={t} className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-7">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-4">
              <CheckCircle2 className="w-5 h-5" /> Con Nexus
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              {[
                'IA detecta anomalías antes de que provoquen fallas',
                'Todo el historial centralizado y accesible desde el celular',
                'Capacitación integrada con certificaciones validadas',
                'Dashboard en tiempo real con alertas automáticas',
                'Informes generados en segundos con un clic',
              ].map(t => (
                <li key={t} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section id="how" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-4">Funciona en 3 pasos simples</h2>
        <p className="text-center text-slate-400 mb-16">Desde el registro hasta la operación plena en menos de 48 horas</p>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {[
            { step: '01', icon: Users, title: 'Configura tu equipo', desc: 'Registra tus equipos, crea usuarios y define roles en minutos. Importa desde Excel o CSV.' },
            { step: '02', icon: ClipboardList, title: 'Digitaliza el mantenimiento', desc: 'Crea checklists, órdenes de trabajo y programa mantenciones preventivas con alertas automáticas.' },
            { step: '03', icon: TrendingUp, title: 'Optimiza con datos reales', desc: 'Analiza KPIs, detecta patrones de fallo con IA y toma decisiones basadas en datos, no intuición.' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} {...fadeUp(i * 0.15)} className="relative text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="text-xs font-bold text-cyan-500 mb-2">PASO {s.step}</div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                {i < 2 && <ArrowRight className="hidden md:block absolute -right-4 top-6 w-8 h-8 text-cyan-700/50" />}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-4">Todo lo que necesitas, en una plataforma</h2>
        <p className="text-center text-slate-400 mb-16">Sin apps separadas, sin integraciones complicadas</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Wrench, title: 'Mantenimiento predictivo', desc: 'IA analiza patrones de uso y predice fallas antes de que ocurran, reduciendo paros no planificados.' },
            { icon: BarChart3, title: 'KPIs y reportes en tiempo real', desc: 'Dashboards automáticos con MTBF, disponibilidad, costos y cumplimiento de mantenciones.' },
            { icon: BookOpen, title: 'Capacitación integrada', desc: 'Cursos, evaluaciones y certificaciones para tus técnicos directamente en la plataforma.' },
            { icon: ClipboardList, title: 'Checklists inteligentes', desc: 'Plantillas personalizables con validación de IA, fotos y firma digital desde el celular.' },
            { icon: Zap, title: 'Órdenes de trabajo digitales', desc: 'Crea, asigna y aprueba OTs con flujo completo, notificaciones y trazabilidad total.' },
            { icon: Shield, title: 'Seguridad y roles', desc: 'Permisos por rol (admin, supervisor, técnico), auditoría de actividad y datos en la nube.' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={i} {...fadeUp(i * 0.08)} className="group bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-white/8 transition-all duration-300 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Testimonios ── */}
      <section id="testimonials" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-4">Lo que dicen nuestros clientes</h2>
        <p className="text-center text-slate-400 mb-16">Empresas que ya transformaron su mantenimiento</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Carlos Mendoza', role: 'Jefe de Mantenimiento', company: 'Minera Los Andes', quote: 'Redujimos los paros no planificados en un 35% en el primer trimestre. La visibilidad que tenemos ahora es increíble.' },
            { name: 'Andrea Rojas', role: 'Supervisora de Operaciones', company: 'Planta Norte S.A.', quote: 'La capacitación integrada nos ahorró contratar un proveedor externo. Los técnicos se certifican solos dentro de la misma app.' },
            { name: 'Felipe Torres', role: 'Gerente de Planta', company: 'Industrial Cobre', quote: 'En 2 semanas teníamos todo migrado desde planillas Excel. El soporte fue excelente en todo momento.' },
          ].map((t, i) => (
            <motion.div key={i} {...fadeUp(i * 0.1)} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic">"{t.quote}"</p>
              <div className="mt-auto">
                <p className="font-semibold text-slate-100 text-sm">{t.name}</p>
                <p className="text-xs text-slate-400">{t.role} · {t.company}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-4">Planes simples y transparentes</h2>
        <p className="text-center text-slate-400 mb-16">Sin sorpresas. Cancela cuando quieras.</p>

        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Básico */}
          <div className="border border-cyan-600/30 rounded-2xl p-7 bg-blue-900/30 backdrop-blur flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Básico</h3>
              <p className="text-sm text-slate-400 mt-1">Para empezar a digitalizar tu operación</p>
            </div>
            <div className="text-4xl font-bold text-white">$49 <span className="text-lg text-slate-400 font-normal">/mes</span></div>
            <ul className="space-y-2 text-sm text-slate-300 flex-1">
              {['10 usuarios', '50 registros/mes', 'Gestión de equipos', 'Checklists básicos', 'Órdenes de trabajo', 'Soporte por email'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />{f}</li>
              ))}
            </ul>
            <Button variant="outline" className="border-cyan-600 text-cyan-300 hover:bg-blue-900 w-full" onClick={handleLogin}>Empezar con Básico</Button>
          </div>

          {/* Pro */}
          <div className="relative border-2 border-cyan-400 rounded-2xl p-7 bg-gradient-to-b from-blue-800/60 to-blue-900/60 backdrop-blur flex flex-col gap-4 shadow-2xl shadow-cyan-500/20 scale-105">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full">MÁS POPULAR</div>
            <div>
              <h3 className="text-lg font-bold text-white">Pro</h3>
              <p className="text-sm text-slate-300 mt-1">Para operaciones en crecimiento</p>
            </div>
            <div className="text-4xl font-bold text-cyan-300">$149 <span className="text-lg text-slate-400 font-normal">/mes</span></div>
            <ul className="space-y-2 text-sm text-slate-200 flex-1">
              {['50 usuarios', 'Registros ilimitados', 'Todo lo del plan Básico', 'Reportes avanzados + KPIs', 'Módulo de capacitación', 'Integración Google Sheets', 'Soporte prioritario'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />{f}</li>
              ))}
            </ul>
            <Button style={{ background: 'linear-gradient(to right, rgb(6,182,212), rgb(37,99,235))', color: 'white' }} className="w-full font-semibold hover:opacity-90" onClick={handleLogin}>Elegir Pro</Button>
          </div>

          {/* Empresa */}
          <div className="border border-purple-500/50 rounded-2xl p-7 bg-purple-900/20 backdrop-blur flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Empresa</h3>
              <p className="text-sm text-slate-400 mt-1">Operaciones industriales complejas</p>
            </div>
            <div className="text-4xl font-bold text-white">$399 <span className="text-lg text-slate-400 font-normal">/mes</span></div>
            <ul className="space-y-2 text-sm text-slate-300 flex-1">
              {['Usuarios ilimitados', 'Todo lo del plan Pro', 'IA y mantenimiento predictivo', 'Cursos ilimitados + certificaciones', 'Onboarding personalizado', 'Gestor de cuenta dedicado', 'Soporte premium 24/7'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />{f}</li>
              ))}
            </ul>
            <Button variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-900/40 w-full" onClick={handleLogin}>Contactar ventas</Button>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          ✅ 14 días gratis en el plan Pro · ✅ 20% descuento anual · ✅ Sin permanencia
        </p>
      </section>

      {/* ── CTA Final ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-3xl px-8 py-16">
          <Clock className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-4xl font-bold mb-4">Tu próxima falla inesperada se puede evitar</h2>
          <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
            Cada día sin visibilidad es un riesgo. Empieza hoy con 14 días gratuitos y sin compromisos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('Trial')}>
              <Button className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white gap-2 shadow-lg shadow-cyan-500/30">
                Comenzar prueba gratuita
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="ghost" className="h-12 px-8 text-slate-300 hover:text-white hover:bg-white/10" onClick={handleLogin}>
              Ya tengo cuenta — Ingresar
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Hexagon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-300">Nexus</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 Nexus. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="mailto:ventas@nexus.com" className="hover:text-cyan-400 transition">Contacto</a>
            <button onClick={() => scrollTo('pricing')} className="hover:text-cyan-400 transition">Precios</button>
          </div>
        </div>
      </footer>
    </div>
  );
}