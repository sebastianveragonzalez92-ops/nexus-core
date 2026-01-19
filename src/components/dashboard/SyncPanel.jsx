import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SyncQueueItem from '@/components/ui/SyncQueueItem';
import { Skeleton } from '@/components/ui/skeleton';

export default function SyncPanel({ items, isLoading, isOpen, onClose, onRetryAll, onClearCompleted }) {
  const pendingCount = items.filter(i => i.status === 'pending').length;
  const failedCount = items.filter(i => i.status === 'failed').length;
  const completedCount = items.filter(i => i.status === 'completed').length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-violet-50">
                    <RefreshCw className="w-5 h-5 text-violet-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">Cola de sincronización</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-slate-600">{pendingCount} pendientes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-600">{completedCount} completados</span>
                </div>
                {failedCount > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="text-slate-600">{failedCount} fallidos</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                ))
              ) : items.length > 0 ? (
                items.map((item, index) => (
                  <SyncQueueItem key={item.id} item={item} index={index} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-700 mb-1">Todo sincronizado</h3>
                  <p className="text-sm text-slate-500">No hay operaciones pendientes</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {items.length > 0 && (
              <div className="p-4 border-t border-slate-100 flex gap-3">
                {failedCount > 0 && (
                  <Button
                    onClick={onRetryAll}
                    variant="outline"
                    className="flex-1 rounded-xl"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Reintentar fallidos
                  </Button>
                )}
                {completedCount > 0 && (
                  <Button
                    onClick={onClearCompleted}
                    variant="ghost"
                    className="flex-1 rounded-xl"
                  >
                    Limpiar completados
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}