import React, { useEffect, useState } from 'react';
import { AlertTriangle, Shield, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InterferenceDetector() {
  const [interference, setInterference] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const detectInterference = () => {
      const issues = [];

      // Detectar scripts externos inyectados
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const externalScripts = scripts.filter(script => {
        const src = script.getAttribute('src');
        // Ignorar scripts legítimos de la app
        return src && 
               !src.includes('base44.app') && 
               !src.includes('localhost') &&
               !src.includes('assets') &&
               !src.includes('chunk') &&
               !src.includes('vite');
      });

      if (externalScripts.length > 0) {
        issues.push({
          type: 'external_scripts',
          count: externalScripts.length,
          message: `${externalScripts.length} script(s) externo(s) detectado(s)`,
          details: externalScripts.map(s => s.src).join(', ')
        });
      }

      // Detectar modificaciones sospechosas en el DOM
      const suspiciousElements = document.querySelectorAll('[data-extension], [class*="extension-"], [id*="extension-"]');
      if (suspiciousElements.length > 0) {
        issues.push({
          type: 'dom_modifications',
          count: suspiciousElements.length,
          message: `${suspiciousElements.length} modificación(es) del DOM detectada(s)`,
          details: 'Elementos inyectados por extensiones'
        });
      }

      // Detectar sobrescritura de objetos globales críticos
      const criticalGlobals = ['fetch', 'XMLHttpRequest', 'addEventListener'];
      const modifiedGlobals = criticalGlobals.filter(name => {
        const obj = window[name];
        return obj && obj.toString().includes('native') === false;
      });

      if (modifiedGlobals.length > 0) {
        issues.push({
          type: 'global_modifications',
          count: modifiedGlobals.length,
          message: `${modifiedGlobals.length} API(s) global(es) modificada(s)`,
          details: modifiedGlobals.join(', ')
        });
      }

      // Verificar integridad de React
      if (!window.React && !window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        issues.push({
          type: 'react_missing',
          message: 'React no se detecta correctamente',
          details: 'La aplicación podría no inicializarse'
        });
      }

      if (issues.length > 0) {
        console.warn('🛡️ Interferencia detectada:', issues);
        setInterference({
          detected: true,
          issues,
          timestamp: new Date().toISOString()
        });
      }
    };

    // Ejecutar detección después de que el DOM esté listo
    const timer = setTimeout(detectInterference, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!interference || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 right-4 z-[9999] max-w-md"
      >
        <div className="bg-amber-50 border-2 border-amber-400 rounded-xl shadow-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-amber-900">
                  ⚠️ Interferencia Detectada
                </h3>
                <button
                  onClick={() => setDismissed(true)}
                  className="p-1 hover:bg-amber-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-amber-700" />
                </button>
              </div>
              <p className="text-sm text-amber-800 mb-3">
                Se detectaron modificaciones externas que podrían afectar la aplicación
              </p>
              <div className="space-y-1.5 mb-4">
                {interference.issues.map((issue, idx) => (
                  <div key={idx} className="text-xs text-amber-700 bg-amber-100/50 rounded px-2 py-1">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    {issue.message}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Recargar en Modo Seguro
                </button>
                <button
                  onClick={() => setDismissed(true)}
                  className="w-full px-4 py-2 bg-white hover:bg-amber-50 text-amber-800 rounded-lg text-sm font-medium transition-colors border border-amber-200"
                >
                  Continuar de Todos Modos
                </button>
              </div>
              <p className="text-xs text-amber-600 mt-3">
                💡 Sugerencia: Desactiva extensiones del navegador o usa modo incógnito
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}