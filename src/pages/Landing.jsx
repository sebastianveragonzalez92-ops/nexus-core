import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  ChevronRight, Menu, X, Hexagon, CheckCircle2, Clock,
  Star, Mail, Linkedin, Youtube, Wrench, BookOpen, BarChart3,
  Shield, Zap, Cpu, FileCheck, Award, AlertTriangle, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${open ? 'border-slate-600 bg-slate-800/60' : 'border-slate-700/50 bg-slate-800/30'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 hover:bg-slate-700/20 transition"
      >
        <span className="font-medium text-slate-200 text-sm">{question}</span>
        <ChevronRight className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-700/40 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: 'easeOut' }
});

const promoDate = new Date();
promoDate.setDate(promoDate.getDate() + 15);
const promoDateStr = promoDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' });

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingAnnual, setBillingAnnual] = useState(false);

  const handleLogin = async () => {
    await base44.auth.redirectToLogin('/Dashboard');
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Top bar */}
      <div className="bg-cyan-950/60 border-b border-cyan-800/40 py-2 px-4 text-center text-xs text-cyan-400 tracking-wide">
        Especialistas en minería y manufactura pesada &nbsp;·&nbsp; +500 empresas industriales confían en Nexus
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
              <Hexagon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-white tracking-tight">Nexus<span className="text-cyan-400">Mintec</span></span>
          </div>

          <div className="hidden md:flex items-center gap-7 text-sm text-slate-400">
            {['roles', 'features', 'pricing', 'faq'].map(id => (
              <button key={id} onClick={() => scrollTo(id)} className="hover:text-white transition capitalize">
                {{ roles: 'Para quién', features: 'Características', pricing: 'Precios', faq: 'FAQ' }[id]}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800" onClick={handleLogin}>
              Ingresar
            </Button>
            <Button size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold" onClick={handleLogin}>
              Probar gratis 14 días
            </Button>
          </div>

          <button className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 px-6 py-4 space-y-2 text-sm bg-slate-950">
            {['roles', 'features', 'pricing', 'faq'].map(id => (
              <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left text-slate-400 hover:text-white py-2">
                {{ roles: 'Para quién', features: 'Características', pricing: 'Precios', faq: 'FAQ' }[id]}
              </button>
            ))}
            <Button onClick={handleLogin} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold mt-2">Comenzar gratis</Button>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b22_1px,transparent_1px),linear-gradient(to_bottom,#1e293b22_1px,transparent_1px)] bg-[size:64px_64px]" />
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 pt-28 pb-24 text-center">
          <motion.div {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 border border-cyan-800 bg-cyan-950/50 px-4 py-1.5 rounded-full mb-8 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Minería · Metalurgia · Manufactura pesada · Energía
            </span>
          </motion.div>

          <motion.h1 {...fadeUp(0.08)} className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            <span className="text-white">Cero fallas.</span><br />
            <span className="text-white">Máxima productividad.</span><br />
            <span className="text-cyan-400">Normativa garantizada.</span>
          </motion.h1>

          <motion.p {...fadeUp(0.16)} className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            La plataforma que une <strong className="text-slate-200 font-medium">mantenimiento predictivo</strong>,{' '}
            <strong className="text-slate-200 font-medium">certificados válidos</strong> y{' '}
            <strong className="text-slate-200 font-medium">checklists auditables</strong> para industria pesada.
          </motion.p>

          <motion.div {...fadeUp(0.22)} className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to={createPageUrl('Trial')}>
              <Button className="h-11 px-7 text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 gap-2">
                Quiero probar gratis
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="outline" className="h-11 px-7 text-sm border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 gap-2" onClick={() => scrollTo('features')}>
              Ver video demo (2 min)
            </Button>
          </motion.div>

          <motion.p {...fadeUp(0.28)} className="text-xs text-slate-600 mt-4 tracking-wide">
            14 días gratis &nbsp;·&nbsp; Sin tarjeta &nbsp;·&nbsp; Configuración en 48 horas &nbsp;·&nbsp; Cancela cuando quieras
          </motion.p>

          {/* Stats row */}
          <motion.div {...fadeUp(0.34)} className="flex flex-wrap justify-center gap-8 mt-16 pt-12 border-t border-slate-800">
            {[
              { value: '40%', label: 'Reducción de paros no planificados' },
              { value: '500+', label: 'Empresas industriales activas' },
              { value: '48h', label: 'Tiempo de configuración' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black text-white">{s.value}</div>
                <div className="text-xs text-slate-500 mt-1 max-w-[120px]">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PARA QUIÉN ── */}
      <section id="roles" className="bg-slate-900/40 border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-cyan-500 uppercase tracking-widest mb-3">Para quién es Nexus</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Diseñado para los responsables de operación y cumplimiento</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Cada rol tiene exactamente la visibilidad que necesita</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Wrench, role: 'Jefe de Mantenimiento',
                headline: 'Predicción de fallas + historial de equipos',
                desc: 'Anticipa averías antes de que paren la planta.',
                accent: 'cyan',
                points: ['IA detecta patrones de desgaste', 'Historial completo por equipo', 'Alertas de mantención vencida', 'OT digitales trazables'],
              },
              {
                icon: BookOpen, role: 'Supervisor de Operaciones',
                headline: 'Capacitación + checklists en terreno',
                desc: 'Técnicos certificados sin sacarlos de la faena.',
                accent: 'sky',
                points: ['Asigna cursos y evalúa avance', 'Checklists con foto, GPS y firma', 'Alertas ante no conformidades', 'Certificados automáticos'],
              },
              {
                icon: Shield, role: 'Gerente de Seguridad',
                headline: 'Cumplimiento normativo + auditorías',
                desc: 'Evita multas de Sernageomin u Osinergmin.',
                accent: 'emerald',
                points: ['Historial inalterable y trazable', 'Evidencia fotográfica en checklist', 'Certificaciones con validez legal', 'Reportes de auditoría en minutos'],
              },
              {
                icon: BarChart3, role: 'Gerente de Planta',
                headline: 'KPIs en tiempo real + productividad',
                desc: 'Visibilidad total: equipos, costos, cumplimiento.',
                accent: 'violet',
                points: ['MTBF, disponibilidad y costos', 'Reportes ejecutivos automáticos', 'Visibilidad multi-faena', 'ROI medible desde el primer mes'],
              },
            ].map((item, i) => {
              const Icon = item.icon;
              const styles = {
                cyan:   { card: 'border-cyan-800/60 hover:border-cyan-600/70',   icon: 'bg-cyan-950 text-cyan-400',   dot: 'bg-cyan-500' },
                sky:    { card: 'border-sky-800/60 hover:border-sky-600/70',     icon: 'bg-sky-950 text-sky-400',     dot: 'bg-sky-500' },
                emerald:{ card: 'border-emerald-800/60 hover:border-emerald-600/70', icon: 'bg-emerald-950 text-emerald-400', dot: 'bg-emerald-500' },
                violet: { card: 'border-violet-800/60 hover:border-violet-600/70',  icon: 'bg-violet-950 text-violet-400',  dot: 'bg-violet-500' },
              }[item.accent];
              return (
                <motion.div key={i} {...fadeUp(i * 0.08)}
                  className={`border ${styles.card} bg-slate-900/60 rounded-2xl p-5 flex flex-col gap-4 transition-colors duration-200`}
                >
                  <div className={`w-10 h-10 rounded-xl ${styles.icon} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{item.role}</p>
                    <h3 className="font-semibold text-sm text-white leading-snug mb-1">{item.headline}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                  <ul className="space-y-1.5 mt-auto">
                    {item.points.map(p => (
                      <li key={p} className="flex items-start gap-2 text-xs text-slate-400">
                        <span className={`w-1 h-1 rounded-full ${styles.dot} shrink-0 mt-1.5`} />{p}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SIN / CON NEXUS ── */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">El antes y el después</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">¿Todavía usas Excel, papel o sistemas separados?</h2>
          <p className="text-slate-400 mt-3">La diferencia que Nexus hace desde el primer día</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Sin Nexus */}
          <div className="border border-red-900/50 bg-red-950/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-red-900/60 flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-red-400" />
              </div>
              <span className="font-semibold text-red-400 text-sm">Sin Nexus</span>
            </div>
            <ul className="space-y-3">
              {[
                'Fallas inesperadas paralizan la producción horas enteras',
                'Historial de mantenimiento en planillas desorganizadas',
                'Técnicos sin capacitación actualizada cometen errores',
                'Certificaciones desordenadas o vencidas',
                'Checklists en papel que se pierden o falsifican',
                'Auditorías encuentran documentación incompleta',
                'Sin visibilidad real del estado de los equipos',
                'Informes manuales que toman horas en preparar',
              ].map(t => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-slate-400">
                  <X className="w-3.5 h-3.5 text-red-500/70 shrink-0 mt-0.5" />{t}
                </li>
              ))}
            </ul>
          </div>
          {/* Con Nexus */}
          <div className="border border-emerald-800/50 bg-emerald-950/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-emerald-900/60 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="font-semibold text-emerald-400 text-sm">Con Nexus</span>
            </div>
            <ul className="space-y-3">
              {[
                'IA detecta anomalías antes de que provoquen fallas',
                'Todo el historial centralizado y accesible desde el celular',
                'Capacitación integrada con certificaciones automáticas y válidas',
                'Cada técnico con historial de cursos y certificados vigentes',
                'Checklists digitales con foto, GPS y firma en terreno',
                'Auditorías aprueban con todo digitalizado y trazable',
                'Dashboard en tiempo real con alertas automáticas',
                'Informes generados en segundos con un clic',
              ].map(t => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />{t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── CARACTERÍSTICAS ── */}
      <section id="features" className="bg-slate-900/40 border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-cyan-500 uppercase tracking-widest mb-3">Plataforma completa</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Todo lo que necesitas en un solo lugar</h2>
            <p className="text-slate-400 mt-3">Sin apps separadas, sin integraciones complicadas</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Cpu,          title: 'Mantenimiento predictivo con IA',     desc: 'IA analiza patrones de uso y predice fallas antes de que ocurran, reduciendo paros no planificados hasta un 40%.' },
              { icon: FileCheck,    title: 'Checklists inteligentes y auditables', desc: 'Plantillas personalizables con validación de IA, fotos, GPS y firma digital. Respaldo en la nube con tracking de cambios.' },
              { icon: Award,        title: 'Certificados de capacitación válidos', desc: 'Cursos, evaluaciones y certificaciones automáticas. Cada certificado es descargable, firmado digitalmente y con código de verificación.' },
              { icon: BarChart3,    title: 'KPIs y reportes en tiempo real',       desc: 'Dashboards con MTBF, disponibilidad, costos, cumplimiento de mantenciones y estado de certificaciones por técnico.' },
              { icon: Shield,       title: 'Cumplimiento normativo garantizado',   desc: 'Todo lo necesario para auditorías de Sernageomin, Osinergmin y otras entidades. Historial inalterable, certificaciones trazables.' },
              { icon: Zap,          title: 'Órdenes de trabajo digitales',         desc: 'Crea, asigna y aprueba OTs con flujo completo, notificaciones automáticas y trazabilidad desde cualquier dispositivo.' },
              { icon: BarChart3,    title: 'Integración con Power BI',             desc: 'Conecta Nexus como fuente de datos en Power BI y embebe reportes personalizados directamente en tu dashboard.' },
              { icon: AlertTriangle,title: 'Conectividad IoT y sensores',          desc: 'Compatible con Modbus, OPC UA, SCADA y APIs abiertas. Si tu equipo ya tiene sensores, los conectamos sin fricción.' },
              { icon: Shield,       title: 'Seguridad y control de acceso',        desc: 'Permisos granulares por rol, auditoría de actividad y datos cifrados en la nube con backups automáticos diarios.' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i} {...fadeUp(i * 0.05)}
                  className="group border border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900 rounded-2xl p-5 transition-colors duration-200 flex gap-4"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-800 group-hover:bg-cyan-950 flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-200 mb-1">{f.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Casos de éxito</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Resultados reales en operaciones reales</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { quote: 'Redujimos los paros no planificados en un 35% en el primer trimestre. La visibilidad que tenemos ahora es increíble.', name: 'Carlos Mendoza', role: 'Jefe de Mantenimiento', company: 'Minera Los Andes', since: 'Cliente desde 2022', badge: '150+ equipos' },
            { quote: 'La capacitación integrada nos ahorró contratar un proveedor externo. Los técnicos se certifican solos dentro de la app. Los certificados los acepta Sernageomin sin problema.', name: 'Andrea Rojas', role: 'Supervisora de Operaciones', company: 'Planta Norte S.A.', since: 'Cliente desde 2023', badge: '45 técnicos certificados' },
            { quote: 'Los checklists digitales nos salvaron en una auditoría. El fiscal pidió ver las inspecciones de 6 meses y en 2 minutos teníamos todo: fotos, fechas, firmas.', name: 'Roberto Méndez', role: 'Superintendente de Seguridad', company: 'Minera Centinela', since: 'Cliente desde 2023', badge: '0 observaciones en auditoría' },
            { quote: 'En 2 semanas teníamos todo migrado desde planillas Excel. El soporte fue excelente en todo momento.', name: 'Felipe Torres', role: 'Gerente de Planta', company: 'Industrial Cobre', since: 'Cliente desde 2024', badge: '3 faenas integradas' },
          ].map((t, i) => (
            <motion.div key={i} {...fadeUp(i * 0.08)}
              className="border border-slate-800 bg-slate-900/50 rounded-2xl p-5 flex flex-col gap-4"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />)}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed flex-1">"{t.quote}"</p>
              <div className="border-t border-slate-800 pt-4">
                <p className="font-semibold text-white text-sm">{t.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.role} · {t.company}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-[11px] text-slate-500 border border-slate-700 rounded-full px-2.5 py-0.5">{t.since}</span>
                  <span className="text-[11px] text-cyan-400 border border-cyan-900 bg-cyan-950/40 rounded-full px-2.5 py-0.5">{t.badge}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="pricing" className="bg-slate-900/40 border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-cyan-500 uppercase tracking-widest mb-3">Planes y precios</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Sin sorpresas. El plan para tu operación</h2>
            <p className="text-slate-400 mt-3">Promo lanzamiento: 20% OFF en plan anual + onboarding gratis —&nbsp;
              <span className="text-yellow-400">Válido hasta el {promoDateStr}</span>
            </p>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className={`text-sm ${!billingAnnual ? 'text-white font-medium' : 'text-slate-500'}`}>Mensual</span>
            <button onClick={() => setBillingAnnual(!billingAnnual)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${billingAnnual ? 'bg-cyan-500' : 'bg-slate-700'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${billingAnnual ? 'left-6' : 'left-1'}`} />
            </button>
            <span className={`text-sm ${billingAnnual ? 'text-cyan-400 font-medium' : 'text-slate-500'}`}>
              Anual <span className="ml-1 text-[11px] bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-full px-2 py-0.5">−20%</span>
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {/* Básico */}
            <div className="border border-slate-700 rounded-2xl p-6 bg-slate-900/60 flex flex-col gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Básico</p>
                <h3 className="font-semibold text-slate-200">Para empezar a digitalizar tu operación</h3>
              </div>
              <div>
                <span className="text-4xl font-black text-white">${billingAnnual ? 39 : 49}</span>
                <span className="text-slate-500 text-sm ml-1">/mes</span>
                {billingAnnual && <p className="text-xs text-cyan-500 mt-1">Facturado anualmente</p>}
              </div>
              <ul className="space-y-2 flex-1">
                {['10 usuarios', '50 registros/mes', 'Gestión de equipos', 'Checklists básicos', 'Órdenes de trabajo', 'Soporte por email'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white w-full text-sm" onClick={handleLogin}>Empezar con Básico</Button>
            </div>

            {/* Pro — destacado */}
            <div className="relative border-2 border-cyan-500 rounded-2xl p-6 bg-gradient-to-b from-cyan-950/50 to-slate-900 flex flex-col gap-5 shadow-2xl shadow-cyan-500/10">
              <div className="absolute -top-3 left-6">
                <span className="bg-cyan-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full">Más popular</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-1">Pro</p>
                <h3 className="font-semibold text-white">Para operaciones en crecimiento</h3>
              </div>
              <div>
                <span className="text-4xl font-black text-cyan-400">${billingAnnual ? 119 : 149}</span>
                <span className="text-slate-500 text-sm ml-1">/mes</span>
                {billingAnnual && <p className="text-xs text-cyan-500 mt-1">Facturado anualmente</p>}
              </div>
              <ul className="space-y-2 flex-1">
                {[
                  '50 usuarios', 'Registros ilimitados', 'Todo lo del plan Básico',
                  'Reportes avanzados + KPIs',
                  'Módulo de capacitación con certificados válidos',
                  'Checklists con foto, GPS y firma digital',
                  'Integración Google Sheets', 'Soporte prioritario',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="w-1 h-1 rounded-full bg-cyan-500 shrink-0 mt-1.5" />{f}
                  </li>
                ))}
              </ul>
              <Button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold w-full text-sm" onClick={handleLogin}>Elegir Pro</Button>
            </div>

            {/* Empresa */}
            <div className="border border-slate-700 rounded-2xl p-6 bg-slate-900/60 flex flex-col gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-1">Empresa</p>
                <h3 className="font-semibold text-slate-200">Operaciones industriales complejas</h3>
              </div>
              <div>
                <span className="text-4xl font-black text-white">${billingAnnual ? 319 : 399}</span>
                <span className="text-slate-500 text-sm ml-1">/mes</span>
                {billingAnnual && <p className="text-xs text-violet-400 mt-1">Facturado anualmente</p>}
              </div>
              <ul className="space-y-2 flex-1">
                {[
                  'Usuarios ilimitados', 'Todo lo del plan Pro',
                  'IA y mantenimiento predictivo',
                  'Cursos ilimitados + certificaciones personalizadas',
                  'Plantillas checklist por tipo de equipo',
                  'Módulo cumplimiento normativo (Sernageomin/Osinergmin)',
                  'Onboarding personalizado', 'Gestor de cuenta dedicado',
                  'Soporte premium 24/7', 'Integración IoT (Modbus, OPC UA)',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="w-1 h-1 rounded-full bg-violet-500 shrink-0 mt-1.5" />{f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="border-violet-700 text-violet-400 hover:bg-violet-950/40 hover:text-violet-300 w-full text-sm" onClick={handleLogin}>Contactar ventas</Button>
            </div>

            {/* Minería */}
            <div className="border border-yellow-800/60 rounded-2xl p-6 bg-gradient-to-b from-yellow-950/30 to-slate-900/60 flex flex-col gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1">Minería</p>
                <h3 className="font-semibold text-slate-200">Para faenas mineras de gran escala</h3>
              </div>
              <div>
                <span className="text-4xl font-black text-yellow-400">${billingAnnual ? 479 : 599}</span>
                <span className="text-slate-500 text-sm ml-1">/mes</span>
                {billingAnnual && <p className="text-xs text-yellow-500 mt-1">Facturado anualmente</p>}
              </div>
              <ul className="space-y-2 flex-1">
                {[
                  'Todo lo del plan Empresa',
                  'Integración sistemas SCADA existentes',
                  'Reportes personalizados para fiscalizaciones',
                  'Capacitación específica por normativa minera',
                  'Integración Power BI (embed + API)',
                  'Conectores SAP / ERP nativos',
                  'Soporte en terreno disponible',
                  'SLA garantizado 99.9% uptime',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="w-1 h-1 rounded-full bg-yellow-500 shrink-0 mt-1.5" />{f}
                  </li>
                ))}
              </ul>
              <Button className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-semibold w-full text-sm" onClick={handleLogin}>Consultar disponibilidad</Button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-600 mt-6 tracking-wide">
            14 días gratis en el plan Pro &nbsp;·&nbsp; Sin permanencia &nbsp;·&nbsp; Cancela cuando quieras y exporta toda tu información en 30 días
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="max-w-3xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Preguntas frecuentes</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Respuestas a lo que realmente te preocupa</h2>
        </div>
        <div className="space-y-3">
          {[
            { q: '¿Mis datos están seguros?', a: 'Servidores en AWS con encriptación AES-256 en reposo y TLS en tránsito. Respaldo automático diario. Tú eres el dueño de tus datos y puedes exportarlos en cualquier momento.' },
            { q: '¿Puedo seguir usando Excel mientras migro?', a: 'Sí. Importamos tus datos desde CSV/Excel en minutos. No pierdes información histórica, incluso con 10+ años de datos en planillas.' },
            { q: '¿Mis técnicos necesitan capacitación para usar la app?', a: 'No. Está diseñada para usarse en terreno con mínima curva de aprendizaje. Plan Empresa y Minería incluyen onboarding personalizado en 1 semana.' },
            { q: '¿Puedo conectar sensores IoT que ya tengo?', a: 'Sí. Integramos con Modbus, OPC UA y APIs abiertas. Si tu equipo ya tiene sensores, los conectamos. Disponible en plan Empresa y Minería.' },
            { q: '¿Los checklists tienen validez legal?', a: 'Sí. Cada checklist queda con timestamp, geolocalización, foto y firma digital. Es evidencia válida para auditorías de Sernageomin, Osinergmin y otras entidades reguladoras.' },
            { q: '¿Los certificados son válidos para Sernageomin?', a: 'Sí. Generamos certificados descargables con código de verificación, tracking de horas y contenido del curso. Varios clientes los han presentado en fiscalizaciones sin observaciones.' },
            { q: '¿Puedo cancelar cuando quiera?', a: 'Sí. Sin permanencia ni penalidades. Cancelas con un clic y tienes 30 días para exportar toda tu información. Tus datos son tuyos, siempre.' },
            { q: '¿En cuánto tiempo empiezo a operar?', a: 'En 48 horas con equipos, usuarios y checklists configurados. Plan Empresa o Minería: 1 semana con onboarding completo y datos migrados.' },
          ].map((f, i) => <FAQItem key={i} question={f.q} answer={f.a} />)}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 py-24 text-center">
          <p className="text-xs font-semibold text-cyan-500 uppercase tracking-widest mb-4">Empieza hoy</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Tu próxima falla inesperada<br className="hidden sm:block" /> se puede evitar hoy
          </h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
            Cada día sin visibilidad es un riesgo operativo y normativo. 14 días gratuitos, sin compromisos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to={createPageUrl('Trial')}>
              <Button className="h-11 px-8 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold gap-2 text-sm">
                Comenzar prueba gratuita
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="ghost" className="h-11 px-6 text-slate-400 hover:text-white hover:bg-slate-800 text-sm" onClick={handleLogin}>
              Ya tengo cuenta — Ingresar
            </Button>
          </div>
          <p className="text-xs text-slate-600 mt-5 tracking-wide">14 días gratis · Sin tarjeta · Cancela cuando quieras</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-md bg-cyan-500 flex items-center justify-center">
                  <Hexagon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-slate-200">NexusMintec</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Mantenimiento inteligente, capacitación integrada y cumplimiento normativo para industria pesada.
              </p>
              <p className="text-xs text-slate-600 mt-4">Minería · Metalurgia · Cemento · Manufactura · Energía</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Plataforma</p>
              <div className="space-y-2.5 text-sm text-slate-500">
                {['roles', 'features', 'pricing', 'faq'].map(id => (
                  <button key={id} onClick={() => scrollTo(id)} className="block hover:text-slate-300 transition capitalize">
                    {{ roles: 'Para quién es', features: 'Características', pricing: 'Precios', faq: 'Preguntas frecuentes' }[id]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Contacto</p>
              <div className="space-y-2.5 text-sm text-slate-500">
                <a href="mailto:hola@nexusmintec.com" className="flex items-center gap-2 hover:text-slate-300 transition">
                  <Mail className="w-4 h-4" /> hola@nexusmintec.com
                </a>
                <a href="#" className="flex items-center gap-2 hover:text-slate-300 transition">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
                <a href="#" className="flex items-center gap-2 hover:text-slate-300 transition">
                  <Youtube className="w-4 h-4" /> YouTube
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center">
            <p className="text-xs text-slate-700">© 2026 NexusMintec. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}