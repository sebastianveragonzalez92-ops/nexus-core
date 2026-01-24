import React, { useEffect, useState } from 'react';
import { AlertTriangle, Shield, Chrome, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExtensionBlockerGuard({ children }) {
  const [hasInterference, setHasInterference] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Detectar scripts inyectados por extensiones
    const detectInterference = () => {
      const scripts = Array.from(document.querySelectorAll('script'));
      const hasContentScript = scripts.some(script => 
        script.src.includes('content-all.js') || 
        script.src.includes('chrome-extension://') ||
        script.src.includes('moz-extension://') ||
        script.src.includes('extension://') ||
        script.textContent?.includes('__EXTENSION__')
      );

      if (hasContentScript) {
        console.warn('⚠️ Extensión detectada que puede interferir con la app');
        setHasInterference(true);
      }
    };

    // Verificar inmediatamente
    detectInterference();

    // Verificar nuevamente después de un delay
    const timer = setTimeout(detectInterference, 1000);

    // Observer para detectar inyecciones dinámicas
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'SCRIPT') {
            const src = node.src || '';
            if (src.includes('extension://') || src.includes('content-all.js')) {
              setHasInterference(true);
            }
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  if (!hasInterference || isDismissed) {
    return <>{children}</>;
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xl"
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg mb-1">Extensión detectada</h3>
                <p className="text-sm text-white/90 mb-3">
                  Una extensión del navegador está interfiriendo con la aplicación. Para mejor rendimiento:
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm">
                    <Chrome className="w-4 h-4" />
                    <span>Usa modo incógnito</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm">
                    <Shield className="w-4 h-4" />
                    <span>O desactiva extensiones</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDismissed(true)}
                className="text-white hover:bg-white/20 shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="pt-24">
        {children}
      </div>
    </>
  );
}