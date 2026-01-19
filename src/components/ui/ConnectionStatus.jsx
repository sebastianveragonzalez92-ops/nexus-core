import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ConnectionStatus({ pendingCount = 0, onSync }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    await onSync?.();
    setTimeout(() => setIsSyncing(false), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-2xl backdrop-blur-xl border transition-all duration-500",
        isOnline 
          ? "bg-white/80 border-slate-200/60 shadow-sm" 
          : "bg-amber-50/90 border-amber-200/60 shadow-amber-100/50"
      )}
    >
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ scale: isOnline ? 1 : [1, 1.1, 1] }}
          transition={{ repeat: isOnline ? 0 : Infinity, duration: 2 }}
        >
          {isOnline ? (
            <Cloud className="w-4 h-4 text-emerald-500" />
          ) : (
            <CloudOff className="w-4 h-4 text-amber-500" />
          )}
        </motion.div>
        <span className={cn(
          "text-sm font-medium",
          isOnline ? "text-slate-700" : "text-amber-700"
        )}>
          {isOnline ? 'Conectado' : 'Sin conexión'}
        </span>
      </div>

      <AnimatePresence>
        {pendingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs text-slate-500">
              {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
            </span>
            {isOnline && (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RefreshCw className={cn(
                  "w-3.5 h-3.5 text-slate-500",
                  isSyncing && "animate-spin"
                )} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}