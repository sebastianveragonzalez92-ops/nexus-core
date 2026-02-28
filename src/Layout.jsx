import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Layers, Activity, Settings, 
  Menu, X, ChevronRight, Sparkles, Bot, BookOpen, Bell, Award, Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';
import NotificationCenter from './components/notifications/NotificationCenter';
import ExtensionBlockerGuard from './components/ExtensionBlockerGuard';

const getNavItems = (userRole) => {
        const items = [
          { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard },
          { name: 'Capacitaciones', page: 'Courses', icon: Layers },
          { name: 'Mis Cursos', page: 'MyCourses', icon: BookOpen },
          { name: 'Gamificación', page: 'Gamification', icon: Award },
          { name: 'Certificados', page: 'Certificates', icon: Award },
          { name: 'Mantenimiento', page: 'Maintenance', icon: Activity },
          { name: 'Repuestos', page: 'SpareParts', icon: Wrench },
          { name: 'Notificaciones', page: 'Notifications', icon: Bell },
          { name: 'Tutor IA', page: 'Tutor', icon: Bot },
          { name: 'Actividad', page: 'Activity', icon: Activity },
        ];

  if (userRole === 'admin') {
    items.push({ name: 'Panel Instructor', page: 'InstructorDashboard', icon: Sparkles });
  }

  items.push({ name: 'Configuración', page: 'Settings', icon: Settings });
  
  return items;
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  
  // Determinar la página actual desde la URL
  const getPageNameFromPath = (pathname) => {
    const path = pathname.replace(/^\//, '').split('/')[0];
    return path || 'Dashboard';
  };
  
  const actualPageName = getPageNameFromPath(location.pathname);
  
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    console.log('🔵 Layout: useEffect ejecutándose');
    base44.auth.me()
      .then((userData) => {
        console.log('✅ Layout: Usuario cargado:', userData);
        setUser(userData);
      })
      .catch((error) => {
        console.error('❌ Layout: Error al cargar usuario:', error);
      });
  }, []);



  const brandColor = user?.company_primary_color || '#6366f1';
  const brandName = user?.company_name || 'ModulaX';
  const brandLogo = user?.company_logo;
  const navItems = getNavItems(user?.role);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [actualPageName]);

  return (
    <ExtensionBlockerGuard>
      <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-50 transition-all duration-300",
          "lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-20" : "lg:w-64",
          "w-72"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden"
                style={{ 
                  background: brandLogo ? '#fff' : `linear-gradient(to bottom right, ${brandColor}, ${brandColor}dd)`,
                  boxShadow: `0 10px 15px -3px ${brandColor}33`
                }}
              >
                {brandLogo ? (
                  <img src={brandLogo} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <Sparkles className="w-5 h-5 text-white" />
                )}
              </div>
              {!isCollapsed && (
                <span className="font-bold text-xl text-slate-900 tracking-tight">{brandName}</span>
              )}
            </Link>
            <div className="flex items-center gap-2">
              <div className="hidden lg:block">
                <NotificationCenter user={user} />
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Navigation */}
           <nav className="flex-1 p-4 space-y-1">
             {navItems.map(({ name, page, icon: Icon }) => {
               const isActive = actualPageName === page;
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? "text-white shadow-lg"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    isCollapsed && "justify-center px-3"
                  )}
                  style={isActive ? {
                    background: `linear-gradient(to right, ${brandColor}, ${brandColor}dd)`,
                    boxShadow: `0 10px 15px -3px ${brandColor}33`
                  } : {}}
                >
                  <Icon className={cn("w-5 h-5 shrink-0", isActive && "text-white")} />
                  {!isCollapsed && <span className="font-medium">{name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-slate-100">
            {user && (
              <div className={cn(
                "flex items-center gap-3 p-3 bg-slate-50 rounded-xl",
                isCollapsed && "justify-center"
              )}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-indigo-600">
                    {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                  </span>
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user.full_name || 'Usuario'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className={cn(
              "w-3 h-3 text-slate-500 transition-transform",
              isCollapsed ? "" : "rotate-180"
            )} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={cn(
        "min-h-screen transition-all duration-300",
        isCollapsed ? "lg:pl-20" : "lg:pl-64"
      )}>
        {/* Desktop header */}
        <header className="hidden lg:block sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-end gap-6">
            <NotificationCenter user={user} />
            <Link
              to={createPageUrl('Settings')}
              className="p-2.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900"
            >
              <Settings className="w-6 h-6" />
            </Link>
          </div>
        </header>

        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden"
                style={{ 
                  background: brandLogo ? '#fff' : `linear-gradient(to bottom right, ${brandColor}, ${brandColor}dd)`
                }}
              >
                {brandLogo ? (
                  <img src={brandLogo} alt="Logo" className="w-full h-full object-contain p-0.5" />
                ) : (
                  <Sparkles className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="font-bold text-slate-900">{brandName}</span>
            </div>
            <div className="flex items-center gap-3">
              <NotificationCenter user={user} />
              <Link
                to={createPageUrl('Settings')}
                className="p-2.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900"
              >
                <Settings className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div>
          {children}
        </div>
      </main>
      </div>
      </ExtensionBlockerGuard>
      );
      }