import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  Wrench, BookOpen, BarChart3, Zap, Shield, ChevronRight,
  Menu, X, Hexagon, CheckCircle2, Clock, TrendingUp, Users,
  AlertTriangle, ClipboardList, Star, ArrowRight, HardHat,
  FileCheck, Award, Mail, Linkedin, Youtube
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

// Promo end date: 15 days from now
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white">

      {/* ── Top announcement bar ── */}
      <div className="bg-cyan-600/20 border-b border-cyan-600/30 py-2 px-4 text-center text-xs text-cyan-300 font-medium">
        🏭 Especialistas en minería y manufactura pesada · +500 empresas industriales confían en Nexus
      </div>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-blue-950/80 backdrop-blur-xl border-b border-cyan-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Hexagon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">Nexus</span>
              <span className="hidden sm:inline text-xs text-cyan-400 ml-1">Mintec</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <button onClick={() => scrollTo('roles')} className="hover:text-cyan-400 transition">Para quién</button>
            <button onClick={() => scrollTo('features')} className="hover:text-cyan-400 transition">Características</button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-cyan-400 transition">Precios</button>
            <button onClick={() => scrollTo('faq')} className="hover:text-cyan-400 transition">FAQ</button>
          </div>

          <div className="hidden md:flex gap-3">
            <Button variant="ghost" className="text-slate-200 hover:text-white hover:bg-blue-900" onClick={handleLogin}>
              Ingresar
            </Button>
            <Button onClick={handleLogin} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold">
              Probar gratis 14 días
            </Button>
          </div>

          <button className="md:hidden p-2 hover:bg-blue-900 rounded-lg" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-cyan-700/30 px-4 py-4 space-y-3 text-sm">
            <button onClick={() => scrollTo('roles')} className="block w-full text-left text-slate-300 hover:text-cyan-400 py-1">Para quién</button>
            <button onClick={() => scrollTo('features')} className="block w-full text-left text-slate-300 hover:text-cyan-400 py-1">Características</button>
            <button onClick={() => scrollTo('pricing')} className="block w-full text-left text-slate-300 hover:text-cyan-400 py-1">Precios</button>
            <button onClick={() => scrollTo('faq')} className="block w-full text-left text-slate-300 hover:text-cyan-400 py-1">FAQ</button>
            <Button onClick={handleLogin} className="w-full bg-cyan-600 hover:bg-cyan-500 mt-2">Comenzar gratis</Button>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Minería · Metalurgia · Cemento · Manufactura pesada · Energía
        </motion.div>

        <motion.h1 {...fadeUp(0.1)} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
          <span className="bg-gradient-to-r from-cyan-300 via-blue-200 to-cyan-300 bg-clip-text text-transparent">
            Cero fallas inesperadas.
          </span>
          <br />
          <span className="text-white">Máxima productividad.</span>
          <br />
          <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
            Cumplimiento normativo garantizado.
          </span>
        </motion.h1>

        <motion.p {...fadeUp(0.2)} className="text-lg text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
          Nexus unifica <span className="text-cyan-300 font-semibold">mantenimiento predictivo</span>, capacitación con <span className="text-cyan-300 font-semibold">certificados válidos</span> y checklists digitales <span className="text-cyan-300 font-semibold">auditables</span> en una sola plataforma. Diseñada para minería, metalurgia y manufactura pesada.
        </motion.p>

        <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl('Trial')}>
            <Button className="h-13 px-8 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white gap-2 shadow-lg shadow-cyan-500/30">
              🚀 Quiero probar Nexus gratis
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
          <Button variant="outline" className="h-13 px-8 text-base border-slate-600 text-slate-200 hover:bg-slate-800 hover:border-slate-400 gap-2" onClick={() => scrollTo('features')}>
            📹 Ver video demo (2 min)
          </Button>
        </motion.div>

        <motion.p {...fadeUp(0.35)} className="text-sm text-slate-500 mt-5">
          14 días gratis · Sin tarjeta · Configuración en 48 horas · Cancela cuando quieras
        </motion.p>

        {/* Stats */}
        <motion.div {...fadeUp(0.4)} className="grid grid-cols-3 gap-4 mt-16 max-w-2xl mx-auto">
          {[
            { value: '40%', label: 'Reducción de paros no planificados' },
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

      {/* ── Para quién es ── */}
      <section id="roles" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-3">Diseñado para los responsables de operación y cumplimiento</h2>
        <p className="text-center text-slate-400 mb-14">Cada rol ve exactamente lo que necesita, cuando lo necesita</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              emoji: '👷‍♂️',
              role: 'Jefe de Mantenimiento',
              headline: 'Predicción de fallas + historial de equipos',
              desc: 'Anticipa averías antes de que paren la planta. Centraliza órdenes de trabajo y mantenciones.',
              color: 'cyan',
              points: ['IA detecta patrones de desgaste en tiempo real', 'Historial completo de cada equipo en un clic', 'Alertas automáticas de mantención vencida', 'Órdenes de trabajo digitales trazables'],
            },
            {
              emoji: '👨‍🏫',
              role: 'Supervisor de Operaciones',
              headline: 'Capacitación + checklists en terreno',
              desc: 'Técnicos certificados sin sacarlos de la faena. Checklists digitales con foto y firma.',
              color: 'blue',
              points: ['Asigna cursos y evalúa avance de cada técnico', 'Checklists con foto, GPS y firma digital', 'Notificaciones ante no conformidades', 'Certificados generados automáticamente'],
            },
            {
              emoji: '📋',
              role: 'Gerente de Seguridad',
              headline: 'Cumplimiento normativo + auditorías',
              desc: 'Certificados con validez legal. Historial completo por técnico. Evita multas de Sernageomin u Osinergmin.',
              color: 'emerald',
              points: ['Historial inalterable y trazable', 'Checklists con evidencia fotográfica', 'Certificaciones válidas ante entidades reguladoras', 'Reportes de auditoría en minutos'],
            },
            {
              emoji: '📊',
              role: 'Gerente de Planta',
              headline: 'KPIs en tiempo real + productividad',
              desc: 'Visibilidad total de disponibilidad de equipos, costos y cumplimiento.',
              color: 'purple',
              points: ['KPIs automáticos: MTBF, disponibilidad, costos', 'Reportes ejecutivos sin planillas', 'Visibilidad de múltiples faenas', 'ROI medible desde el primer mes'],
            },
          ].map((item, i) => {
            const c = { cyan: 'border-cyan-500/40 bg-cyan-500/5', blue: 'border-blue-500/40 bg-blue-500/5', emerald: 'border-emerald-500/40 bg-emerald-500/5', purple: 'border-purple-500/40 bg-purple-500/5' }[item.color];
            const dot = { cyan: 'bg-cyan-400', blue: 'bg-blue-400', emerald: 'bg-emerald-400', purple: 'bg-purple-400' }[item.color];
            return (
              <motion.div key={i} {...fadeUp(i * 0.1)} className={`border ${c} rounded-2xl p-6 flex flex-col gap-4`}>
                <div className="text-3xl">{item.emoji}</div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{item.role}</p>
                  <h3 className="font-bold text-base text-white leading-tight">{item.headline}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
                <ul className="space-y-1.5 flex-1">
                  {item.points.map(p => (
                    <li key={p} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0 mt-1.5`} />{p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Sin Nexus / Con Nexus ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center mb-3">¿Todavía usas Excel, papel o sistemas separados?</h2>
        <p className="text-center text-slate-400 mb-12">La diferencia que Nexus hace en tu operación desde el primer día</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left pb-4 text-red-400 font-bold text-base w-1/2 pr-4">
                  <div className="flex items-center gap-2 bg-red-950/30 border border-red-500/20 rounded-xl px-4 py-2.5">
                    <X className="w-4 h-4" /> Sin Nexus
                  </div>
                </th>
                <th className="text-left pb-4 text-emerald-400 font-bold text-base w-1/2 pl-4">
                  <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-500/20 rounded-xl px-4 py-2.5">
                    <CheckCircle2 className="w-4 h-4" /> Con Nexus
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {[
                ['Fallas inesperadas paralizan la producción horas enteras', 'IA detecta anomalías antes de que provoquen fallas'],
                ['Historial de mantenimiento en planillas desorganizadas', 'Todo el historial centralizado y accesible desde el celular'],
                ['Técnicos sin capacitación actualizada cometen errores', 'Capacitación integrada con certificaciones automáticas y válidas'],
                ['Certificaciones de técnicos desordenadas o vencidas', 'Cada técnico con su historial de cursos y certificados vigentes'],
                ['Checklists en papel que se pierden o falsifican', 'Checklists digitales con foto, GPS y firma en terreno'],
                ['Auditorías encuentran documentación incompleta', 'Auditorías aprueban con todo digitalizado y trazable'],
                ['Sin visibilidad real del estado de los equipos', 'Dashboard en tiempo real con alertas automáticas'],
                ['Informes manuales que toman horas en preparar', 'Informes generados en segundos con un clic'],
              ].map(([bad, good], i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-3 pr-4">
                    <div className="flex items-start gap-2 text-slate-400">
                      <X className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      {bad}
                    </div>
                  </td>
                  <td className="py-3 pl-4">
                    <div className="flex items-start gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      {good}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-3">Todo lo que necesitas para operar sin riesgos y cumplir la normativa</h2>
        <p className="text-center text-slate-400 mb-16">Sin apps separadas, sin integraciones complicadas</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              emoji: '🔮',
              title: 'Mantenimiento predictivo con IA',
              desc: 'IA analiza patrones de uso y predice fallas antes de que ocurran, reduciendo paros no planificados hasta un 40%.',
            },
            {
              emoji: '📋',
              title: 'Checklists inteligentes y auditables',
              desc: 'Plantillas personalizables con validación de IA, fotos, GPS y firma digital desde el celular. Respaldo en la nube con tracking de cambios.',
            },
            {
              emoji: '🎓',
              title: 'Capacitación con certificados válidos',
              desc: 'Cursos, evaluaciones y certificaciones automáticas para tus técnicos. Cada certificado es descargable, firmado digitalmente y con código de verificación.',
            },
            {
              emoji: '📊',
              title: 'KPIs y reportes en tiempo real',
              desc: 'Dashboards automáticos con MTBF, disponibilidad, costos, cumplimiento de mantenciones y estado de certificaciones por técnico.',
            },
            {
              emoji: '🛡️',
              title: 'Cumplimiento normativo garantizado',
              desc: 'Todo lo que necesitas para auditorías de Sernageomin (Chile), Osinergmin (Perú) y otras entidades. Historial inalterable, checklists con evidencia fotográfica, certificaciones trazables.',
            },
            {
              emoji: '⚡',
              title: 'Órdenes de trabajo digitales',
              desc: 'Crea, asigna y aprueba OTs con flujo completo, notificaciones automáticas y trazabilidad total desde cualquier dispositivo.',
            },
            {
              emoji: '🔗',
              title: 'Integración con Power BI',
              desc: 'Conecta Nexus como fuente de datos en Power BI y embebe reportes personalizados directamente en tu dashboard operativo.',
            },
            {
              emoji: '📡',
              title: 'Conectividad IoT y sensores',
              desc: 'Integramos con Modbus, OPC UA, SCADA y APIs abiertas. Si tu equipo ya tiene sensores, los conectamos sin fricción.',
            },
            {
              emoji: '🔒',
              title: 'Seguridad y roles por operación',
              desc: 'Permisos granulares por rol (admin, supervisor, técnico), auditoría de actividad y datos cifrados en la nube con backups automáticos.',
            },
          ].map((f, i) => (
            <motion.div key={i} {...fadeUp(i * 0.06)} className="group bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-white/8 transition-all duration-300 rounded-2xl p-6">
              <div className="text-2xl mb-3">{f.emoji}</div>
              <h3 className="font-semibold text-slate-100 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Testimonios ── */}
      <section id="testimonials" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-3">Lo que dicen quienes ya dejaron los paros inesperados y las auditorías complicadas</h2>
        <p className="text-center text-slate-400 mb-14">Empresas reales, resultados medibles</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              quote: 'Redujimos los paros no planificados en un 35% en el primer trimestre. La visibilidad que tenemos ahora es increíble.',
              name: 'Carlos Mendoza',
              role: 'Jefe de Mantenimiento',
              company: 'Minera Los Andes',
              since: 'Cliente desde 2022',
              badge: '150+ equipos conectados',
            },
            {
              quote: 'La capacitación integrada nos ahorró contratar un proveedor externo. Los técnicos se certifican solos dentro de la misma app. Y los certificados los acepta Sernageomin sin problema.',
              name: 'Andrea Rojas',
              role: 'Supervisora de Operaciones',
              company: 'Planta Norte S.A.',
              since: 'Cliente desde 2023',
              badge: '45 técnicos certificados',
            },
            {
              quote: 'Los checklists digitales nos salvaron en una auditoría. El fiscal pidió ver las inspecciones de los últimos 6 meses y en 2 minutos teníamos todo: fotos, fechas, firmas. El papel ya es historia.',
              name: 'Roberto Méndez',
              role: 'Superintendente de Seguridad',
              company: 'Minera Centinela',
              since: 'Cliente desde 2023',
              badge: '0 observaciones en última auditoría',
            },
            {
              quote: 'En 2 semanas teníamos todo migrado desde planillas Excel. El soporte fue excelente en todo momento.',
              name: 'Felipe Torres',
              role: 'Gerente de Planta',
              company: 'Industrial Cobre',
              since: 'Cliente desde 2024',
              badge: '3 faenas integradas',
            },
          ].map((t, i) => (
            <motion.div key={i} {...fadeUp(i * 0.1)} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic flex-1">"{t.quote}"</p>
              <div>
                <p className="font-semibold text-slate-100 text-sm">{t.name}</p>
                <p className="text-xs text-slate-400">{t.role} · {t.company}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 text-slate-400">📅 {t.since}</span>
                  <span className="text-xs bg-cyan-500/10 border border-cyan-500/20 rounded-full px-2.5 py-0.5 text-cyan-400">{t.badge}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Precios ── */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-3">Sin sorpresas. Elige el plan que cumpla con tu operación</h2>

        {/* Promo banner */}
        <div className="flex items-center justify-center gap-2 text-sm text-yellow-300 font-semibold mb-6">
          <span className="bg-yellow-500/20 border border-yellow-500/30 rounded-full px-4 py-1.5">
            🏷️ Promo lanzamiento: 20% OFF en plan anual + onboarding gratis — Válido hasta el {promoDateStr}
          </span>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-sm font-medium ${!billingAnnual ? 'text-white' : 'text-slate-400'}`}>Mensual</span>
          <button
            onClick={() => setBillingAnnual(!billingAnnual)}
            className={`relative w-12 h-6 rounded-full transition-colors ${billingAnnual ? 'bg-cyan-500' : 'bg-slate-600'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${billingAnnual ? 'left-7' : 'left-1'}`} />
          </button>
          <span className={`text-sm font-medium ${billingAnnual ? 'text-cyan-300' : 'text-slate-400'}`}>
            Anual <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full px-2 py-0.5 ml-1">20% OFF</span>
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {/* Básico */}
          <div className="border border-slate-600/50 rounded-2xl p-6 bg-white/5 backdrop-blur flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Básico</h3>
              <p className="text-sm text-slate-400 mt-1">Para empezar a digitalizar tu operación</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">${billingAnnual ? 39 : 49} <span className="text-base text-slate-400 font-normal">/mes</span></div>
              {billingAnnual && <p className="text-xs text-cyan-400 mt-0.5">Facturado anualmente</p>}
            </div>
            <ul className="space-y-2 text-sm text-slate-300 flex-1">
              {['10 usuarios', '50 registros/mes', 'Gestión de equipos', 'Checklists básicos', 'Órdenes de trabajo', 'Soporte por email'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />{f}</li>
              ))}
            </ul>
            <Button variant="outline" className="border-slate-500 text-slate-300 hover:bg-white/10 w-full" onClick={handleLogin}>Empezar con Básico</Button>
          </div>

          {/* Pro */}
          <div className="relative border-2 border-cyan-400 rounded-2xl p-6 bg-gradient-to-b from-blue-800/60 to-blue-900/60 backdrop-blur flex flex-col gap-4 shadow-2xl shadow-cyan-500/20">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">🔥 MÁS POPULAR</div>
            <div>
              <h3 className="text-lg font-bold text-white">Pro</h3>
              <p className="text-sm text-slate-300 mt-1">Para operaciones en crecimiento</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-300">${billingAnnual ? 119 : 149} <span className="text-base text-slate-400 font-normal">/mes</span></div>
              {billingAnnual && <p className="text-xs text-cyan-400 mt-0.5">Facturado anualmente</p>}
            </div>
            <ul className="space-y-2 text-sm text-slate-200 flex-1">
              {[
                '50 usuarios',
                'Registros ilimitados',
                'Todo lo del plan Básico',
                'Reportes avanzados + KPIs',
                '✅ Módulo de capacitación con certificados válidos',
                '✅ Checklists con foto, GPS y firma digital',
                'Integración Google Sheets',
                'Soporte prioritario',
              ].map(f => (
                <li key={f} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                  <span>{f.replace('✅ ', '')}{f.startsWith('✅') ? <span className="ml-1 text-xs bg-cyan-500/20 text-cyan-300 rounded px-1">Nuevo</span> : null}</span>
                </li>
              ))}
            </ul>
            <Button style={{ background: 'linear-gradient(to right, rgb(6,182,212), rgb(37,99,235))', color: 'white' }} className="w-full font-semibold hover:opacity-90" onClick={handleLogin}>Elegir Pro</Button>
          </div>

          {/* Empresa */}
          <div className="border border-purple-500/50 rounded-2xl p-6 bg-purple-900/20 backdrop-blur flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Empresa</h3>
              <p className="text-sm text-slate-400 mt-1">Operaciones industriales complejas</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">${billingAnnual ? 319 : 399} <span className="text-base text-slate-400 font-normal">/mes</span></div>
              {billingAnnual && <p className="text-xs text-purple-400 mt-0.5">Facturado anualmente</p>}
            </div>
            <ul className="space-y-2 text-sm text-slate-300 flex-1">
              {[
                'Usuarios ilimitados',
                'Todo lo del plan Pro',
                '🤖 IA y mantenimiento predictivo',
                '🎓 Cursos ilimitados + certificaciones personalizadas',
                '📋 Plantillas checklist por tipo de equipo',
                '🛡️ Módulo cumplimiento normativo (Sernageomin/Osinergmin)',
                'Onboarding personalizado',
                'Gestor de cuenta dedicado',
                'Soporte premium 24/7',
                'Integración sensores IoT (Modbus, OPC UA)',
              ].map(f => (
                <li key={f} className="flex items-start gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-1.5" />{f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-900/40 w-full" onClick={handleLogin}>Contactar ventas</Button>
          </div>

          {/* Minería */}
          <div className="relative border border-yellow-500/50 rounded-2xl p-6 bg-gradient-to-b from-yellow-900/20 to-orange-900/10 backdrop-blur flex flex-col gap-4">
            <div className="absolute -top-3.5 right-6">
              <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">🏔️ MINERÍA</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-yellow-300">Minería</h3>
              <p className="text-sm text-slate-400 mt-1">Para faenas mineras de gran escala</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300">${billingAnnual ? 479 : 599} <span className="text-base text-slate-400 font-normal">/mes</span></div>
              {billingAnnual && <p className="text-xs text-yellow-400 mt-0.5">Facturado anualmente</p>}
            </div>
            <ul className="space-y-2 text-sm text-slate-300 flex-1">
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
                <li key={f} className="flex items-start gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0 mt-1.5" />{f}
                </li>
              ))}
            </ul>
            <Button className="w-full font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black" onClick={handleLogin}>Consultar disponibilidad</Button>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          ✅ 14 días gratis en el plan Pro · ✅ Sin permanencia · ✅ Cancela con un clic y exporta toda tu información en 30 días
        </p>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-3">Respuestas a lo que realmente te preocupa</h2>
        <p className="text-center text-slate-400 mb-12">Preguntas frecuentes de equipos de operación y seguridad</p>
        <div className="space-y-4">
          {[
            { q: '🔐 ¿Mis datos están seguros?', a: 'Servidores en AWS con encriptación grado bancario (AES-256 en reposo, TLS en tránsito). Respaldo automático diario. Cumplimos con estándares de seguridad industrial. Tú eres el dueño de tus datos y puedes exportarlos en cualquier momento.' },
            { q: '📊 ¿Puedo seguir usando Excel mientras migro?', a: 'Sí. Importamos tus datos desde CSV/Excel en minutos. No pierdes información histórica. Ya lo hemos hecho con clientes con 10+ años de datos en planillas.' },
            { q: '👷 ¿Mis técnicos necesitan capacitación para usar la app?', a: 'No. La app está diseñada para usarse en terreno con mínima curva de aprendizaje. Si tienes plan Empresa o Minería, incluimos onboarding personalizado en 1 semana.' },
            { q: '🔌 ¿Puedo conectar sensores IoT que ya tengo?', a: 'Sí. Integramos con Modbus, OPC UA, y APIs abiertas. Si tu equipo ya tiene sensores, los conectamos. Plan Empresa y Minería incluyen esta integración.' },
            { q: '📋 ¿Los checklists tienen validez legal?', a: 'Sí. Cada checklist queda con timestamp, geolocalización, foto y firma digital. Es evidencia válida para auditorías y fiscalizaciones de Sernageomin, Osinergmin y otras entidades reguladoras.' },
            { q: '🎓 ¿Los certificados de capacitación son válidos para Sernageomin?', a: 'Sí. Generamos certificados descargables con código de verificación, tracking de horas y contenido del curso. Personalizables según tus requisitos normativos. Varios de nuestros clientes los han presentado en fiscalizaciones sin observaciones.' },
            { q: '💳 ¿Puedo cancelar cuando quiera?', a: 'Sí. Sin permanencia ni penalidades. Cancelas con un clic y te damos 30 días para exportar toda tu información en formato Excel o PDF. Tus datos son tuyos, siempre.' },
            { q: '🚀 ¿En cuánto tiempo empiezo a operar?', a: 'En 48 horas tienes todo configurado con tus equipos, usuarios y checklists básicos. Si eliges plan Empresa o Minería, en 1 semana con onboarding completo y datos migrados.' },
          ].map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-3xl px-8 py-16">
          <Clock className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-4xl font-bold mb-4">Tu próxima falla inesperada se puede evitar hoy</h2>
          <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
            Cada día sin visibilidad es un riesgo operativo y normativo. Empieza con 14 días gratuitos, sin compromisos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('Trial')}>
              <Button className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white gap-2 shadow-lg shadow-cyan-500/30">
                🚀 Comenzar prueba gratuita
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="ghost" className="h-12 px-8 text-slate-300 hover:text-white hover:bg-white/10" onClick={handleLogin}>
              Ya tengo cuenta — Ingresar
            </Button>
          </div>
          <p className="text-sm text-slate-500 mt-5">14 días gratis · Sin tarjeta · Configuración en 48 horas · Cancela cuando quieras</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Hexagon className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-200">NexusMintec</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Mantenimiento inteligente, capacitación integrada y cumplimiento normativo para industria pesada.
              </p>
              <p className="text-xs text-slate-600 mt-3">🏭 Minería · Metalurgia · Cemento · Manufactura · Energía</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 mb-3">Plataforma</p>
              <div className="space-y-2 text-sm text-slate-500">
                <button onClick={() => scrollTo('roles')} className="block hover:text-cyan-400 transition">Para quién es</button>
                <button onClick={() => scrollTo('features')} className="block hover:text-cyan-400 transition">Características</button>
                <button onClick={() => scrollTo('pricing')} className="block hover:text-cyan-400 transition">Precios</button>
                <button onClick={() => scrollTo('faq')} className="block hover:text-cyan-400 transition">Preguntas frecuentes</button>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 mb-3">Contacto</p>
              <div className="space-y-2 text-sm text-slate-500">
                <a href="mailto:hola@nexusmintec.com" className="flex items-center gap-2 hover:text-cyan-400 transition">
                  <Mail className="w-4 h-4" /> hola@nexusmintec.com
                </a>
                <a href="#" className="flex items-center gap-2 hover:text-cyan-400 transition">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
                <a href="#" className="flex items-center gap-2 hover:text-cyan-400 transition">
                  <Youtube className="w-4 h-4" /> YouTube
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 text-center">
            <p className="text-sm text-slate-600">© 2026 NexusMintec. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}