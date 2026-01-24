import React, { useEffect, useState } from 'react';
import InterferenceDetector from './InterferenceDetector';

export default function SafeModeWrapper({ children }) {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar que React puede montar correctamente
    const checkInitialization = () => {
      try {
        console.log('🛡️ SafeModeWrapper: Verificando inicialización...');
        
        // Verificar que el root element existe
        const root = document.getElementById('root');
        if (!root) {
          throw new Error('Root element no encontrado');
        }

        // Verificar que React está disponible
        if (typeof React === 'undefined') {
          throw new Error('React no está disponible');
        }

        console.log('✅ SafeModeWrapper: Inicialización exitosa');
        setInitialized(true);
      } catch (err) {
        console.error('❌ SafeModeWrapper: Error de inicialización:', err);
        setError(err);
      }
    };

    // Dar tiempo para que scripts externos se inyecten
    const timer = setTimeout(checkInitialization, 100);
    return () => clearTimeout(timer);
  }, []);

  // Si hay error crítico, mostrar fallback
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white rounded-xl shadow-xl p-6 border-2 border-red-200">
          <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-red-900 mb-2">
            Error de Inicialización
          </h1>
          <p className="text-sm text-red-700 mb-4">
            La aplicación no pudo inicializarse correctamente. Esto suele ocurrir por:
          </p>
          <ul className="text-sm text-red-600 space-y-2 mb-4 list-disc list-inside">
            <li>Extensiones del navegador interfiriendo</li>
            <li>Bloqueadores de contenido</li>
            <li>Scripts de terceros</li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Reintentar
          </button>
          <p className="text-xs text-red-500 mt-4">
            💡 Intenta desactivar extensiones o usar modo incógnito
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <InterferenceDetector />
      {children}
    </>
  );
}