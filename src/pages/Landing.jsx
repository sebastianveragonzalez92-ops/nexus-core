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

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 hover:bg-white/5 transition">
        <span className="font-medium text-slate-100">{question}</span>
        <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}

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
          🏔️ Diseñado específicamente para Minería y Manufactura
        </motion.div>

        <motion.h1 {...fadeUp(0.1)} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-cyan-300 via-blue-200 to-cyan-300 bg-clip-text text-transparent">
            Cero fallas inesperadas.
          </span>
          <br />
          <span className="text-white">Máxima productividad.</span>
        </motion.h1>

        <motion.p {...fadeUp(0.2)} className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Nexus es la plataforma N°1 para <span className="text-cyan-300 font-semibold">minería y manufactura</span> en Latinoamérica. Unifica mantenimiento predictivo con IA, capacitación técnica y KPIs en tiempo real — en una sola herramienta que entiende tu operación.
        </motion.p>

        <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl('Trial')}>
            <Button className="h-13 px-8 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white gap-2 shadow-lg shadow-cyan-500/30">
              Prueba gratis 14 días — sin tarjeta
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
          <Button variant="outline" className="h-13 px-8 text-base border-slate-600 text-slate-200 hover:bg-slate-800 hover:border-slate-400 gap-2" onClick={() => scrollTo('how')}>
            ▶ Ver video demo (2 min)
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

      {/* ── Para quién es ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-4">Hecho para cada rol de tu operación</h2>
        <p className="text-center text-slate-400 mb-16">Cada persona ve exactamente lo que necesita, cuando lo necesita</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: AlertTriangle,
              role: 'Jefe de Mantenimiento',
              color: 'cyan',
              headline: 'Anticipa fallas antes de que ocurran',
              points: [
                'IA detecta patrones de desgaste en tiempo real',
                'Historial completo de cada equipo en un clic',
                'Alertas automáticas de mantención vencida',
                'Órdenes de trabajo digitales con trazabilidad total',
              ],
            },
            {
              icon: Users,
              role: 'Supervisor de Turno',
              color: 'blue',
              headline: 'Capacita y controla tu equipo desde un solo lugar',
              points: [
                'Asigna cursos y evalúa avance de cada técnico',
                'Checklists digitales con validación por foto y firma',
                'Seguimiento de tareas y cumplimiento por turno',
                'Notificaciones instantáneas ante no conformidades',
              ],
            },
            {
              icon: TrendingUp,
              role: 'Gerente de Planta',
              color: 'purple',
              headline: 'Toma decisiones basadas en datos reales',
              points: [
                'KPIs automáticos: MTBF, disponibilidad, costos',
                'Reportes ejecutivos en segundos, sin planillas',
                'Visibilidad de múltiples faenas desde un dashboard',
                'ROI medible desde el primer mes de uso',
              ],
            },
          ].map((item, i) => {
            const Icon = item.icon;
            const c = { cyan: 'border-cyan-500/40 bg-cyan-500/5', blue: 'border-blue-500/40 bg-blue-500/5', purple: 'border-purple-500/40 bg-purple-500/5' }[item.color];
            const ic = { cyan: 'text-cyan-400 bg-cyan-500/10', blue: 'text-blue-400 bg-blue-500/10', purple: 'text-purple-400 bg-purple-500/10' }[item.color];
            const dot = { cyan: 'bg-cyan-400', blue: 'bg-blue-400', purple: 'bg-purple-400' }[item.color];
            return (
              <motion.div key={i} {...fadeUp(i * 0.1)} className={`border ${c} rounded-2xl p-6 flex flex-col gap-4`}>
                <div className={`w-10 h-10 rounded-xl ${ic} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{item.role}</p>
                  <h3 className="font-bold text-lg text-white leading-tight">{item.headline}</h3>
                </div>
                <ul className="space-y-2 flex-1">
                  {item.points.map(p => (
                    <li key={p} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0 mt-1.5`} />{p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
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
            { name: 'Carlos Mendoza', role: 'Jefe de Mantenimiento', company: 'Minera Los Andes', since: '3 años cliente', equipment: '140 equipos conectados', quote: 'Pasamos de 12 paros no planificados al mes a menos de 2. El ROI se recuperó en 4 meses. No volvemos a Excel jamás.' },
            { name: 'Andrea Rojas', role: 'Supervisora de Operaciones', company: 'Planta Norte S.A.', since: '2 años cliente', equipment: '68 técnicos certificados', quote: 'Ahorramos $18.000 USD anuales en capacitación externa. Los técnicos completan cursos en el turno, sin parar la operación.' },
            { name: 'Felipe Torres', role: 'Gerente de Planta', company: 'Industrial Cobre', since: '18 meses cliente', equipment: '3 faenas integradas', quote: 'Migré 5 años de datos desde Excel en 2 días con soporte del equipo. Los KPIs que antes tardaban 1 semana ahora se generan solos.' },
          ].map((t, i) => (
            <motion.div key={i} {...fadeUp(i * 0.1)} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic">"{t.quote}"</p>
              <div className="mt-auto">
                <p className="font-semibold text-slate-100 text-sm">{t.name}</p>
                <p className="text-xs text-slate-400">{t.role} · {t.company}</p>
                <div className="flex gap-3 mt-2">
                  <span className="text-xs bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 text-slate-400">{t.since}</span>
                  <span className="text-xs bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 text-slate-400">{t.equipment}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-4">Preguntas frecuentes</h2>
        <p className="text-center text-slate-400 mb-12">Respondemos las dudas reales antes de que las tengas</p>
        <div className="space-y-4">
          {[
            {
              q: '¿Dónde se guardan mis datos? ¿Son seguros?',
              a: 'Todos los datos se almacenan en servidores en la nube con cifrado AES-256 en reposo y TLS en tránsito. Cumplimos con ISO 27001. Backups automáticos diarios. Tú eres el dueño de tus datos y puedes exportarlos en cualquier momento.',
            },
            {
              q: '¿Cómo migro mis datos desde Excel o planillas actuales?',
              a: 'Importación con un clic desde .CSV o .XLSX. Nuestro equipo de onboarding te ayuda a estructurar y migrar el historial completo en menos de 48 horas. Ya lo hemos hecho con clientes con 10+ años de datos.',
            },
            {
              q: '¿Se puede integrar con los sensores e instrumentos que ya tenemos?',
              a: 'Sí. Nexus tiene API abierta y conectores nativos para los principales fabricantes de sensores (Siemens, ABB, Honeywell). También integramos con Google Sheets, SAP y sistemas SCADA. Contáctanos para una evaluación técnica gratuita.',
            },
            {
              q: '¿Qué pasa si quiero cancelar? ¿Pierdo mis datos?',
              a: 'Cancela en cualquier momento sin penalidades. Antes de cerrar tu cuenta, puedes exportar todo tu historial en formato Excel o PDF. Tus datos son tuyos, siempre.',
            },
            {
              q: '¿Funciona sin conexión a internet en terreno?',
              a: 'Sí. La app móvil tiene modo offline para captura de checklists, fotos y formularios. Se sincroniza automáticamente cuando vuelve la conexión. Ideal para faenas con conectividad limitada.',
            },
          ].map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-4">Planes simples y transparentes</h2>
        <p className="text-center text-slate-400 mb-16">Sin sorpresas. Cancela cuando quieras.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {/* Básico */}
          <div className="border border-cyan-600/30 rounded-2xl p-6 bg-blue-900/30 backdrop-blur flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Básico</h3>
              <p className="text-sm text-slate-400 mt-1">Para digitalizar tu operación</p>
            </div>
            <div className="text-3xl font-bold text-white">$49 <span className="text-base text-slate-400 font-normal">/mes</span></div>
            <ul className="space-y-2 text-sm text-slate-300 flex-1">
              {['10 usuarios', '50 registros/mes', 'Gestión de equipos', 'Checklists básicos', 'Órdenes de trabajo', 'Soporte por email'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />{f}</li>
              ))}
            </ul>
            <Button variant="outline" className="border-cyan-600 text-cyan-300 hover:bg-blue-900 w-full" onClick={handleLogin}>Empezar</Button>
          </div>

          {/* Pro - destacado */}
          <div className="relative border-2 border-cyan-400 rounded-2xl p-6 bg-gradient-to-b from-blue-800/60 to-blue-900/60 backdrop-blur flex flex-col gap-4 shadow-2xl shadow-cyan-500/20">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">MÁS POPULAR</div>
            <div>
              <h3 className="text-lg font-bold text-white">Pro</h3>
              <p className="text-sm text-slate-300 mt-1">Para operaciones en crecimiento</p>
            </div>
            <div className="text-3xl font-bold text-cyan-300">$149 <span className="text-base text-slate-400 font-normal">/mes</span></div>
            <ul className="space-y-2 text-sm text-slate-200 flex-1">
              {['50 usuarios', 'Registros ilimitados', 'Todo lo del plan Básico', 'Reportes + KPIs avanzados', 'Módulo de capacitación', 'Google Sheets integrado', 'Soporte prioritario'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />{f}</li>
              ))}
            </ul>
            <Button style={{ background: 'linear-gradient(to right, rgb(6,182,212), rgb(37,99,235))', color: 'white' }} className="w-full font-semibold hover:opacity-90" onClick={handleLogin}>Elegir Pro</Button>
          </div>

          {/* Empresa */}
          <div className="border border-purple-500/50 rounded-2xl p-6 bg-purple-900/20 backdrop-blur flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Empresa</h3>
              <p className="text-sm text-slate-400 mt-1">Múltiples faenas y plantas</p>
            </div>
            <div className="text-3xl font-bold text-white">$399 <span className="text-base text-slate-400 font-normal">/mes</span></div>
            <ul className="space-y-2 text-sm text-slate-300 flex-1">
              {['Usuarios ilimitados', 'Todo lo del plan Pro', 'IA mantenimiento predictivo', 'Cursos + certificaciones ilimitados', 'Onboarding personalizado', 'Gestor de cuenta dedicado', 'Soporte 24/7'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />{f}</li>
              ))}
            </ul>
            <Button variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-900/40 w-full" onClick={handleLogin}>Elegir Empresa</Button>
          </div>

          {/* Minería Premium */}
          <div className="border border-yellow-500/50 rounded-2xl p-6 bg-gradient-to-b from-yellow-900/20 to-orange-900/10 backdrop-blur flex flex-col gap-4">
            <div className="absolute -top-3.5 right-6">
              <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">🏔️ MINERÍA</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-yellow-300">Minería Premium</h3>
              <p className="text-sm text-slate-400 mt-1">Para operaciones mineras de escala</p>
            </div>
            <div className="text-3xl font-bold text-yellow-300">$599 <span className="text-base text-slate-400 font-normal">/mes</span></div>
            <ul className="space-y-2 text-sm text-slate-300 flex-1">
              {['Todo lo del plan Empresa', 'Integración con sensores (SCADA, IoT)', 'Conectores SAP / ERP nativos', 'Dashboards ejecutivos por faena', 'Informes regulatorios automáticos', 'Análisis de vida útil de componentes', 'SLA garantizado 99.9% uptime'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />{f}</li>
              ))}
            </ul>
            <Button className="w-full font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black" onClick={handleLogin}>Contactar ventas</Button>
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