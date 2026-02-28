import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, Package, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function StockAlertsBanner({ user }) {
  const [dismissed, setDismissed] = React.useState(false);

  const { data: parts = [] } = useQuery({
    queryKey: ['sparePartsAlerts'],
    queryFn: () => base44.entities.SparePart.filter({ activo: true }),
    staleTime: 5 * 60 * 1000,
  });

  const outOfStock = parts.filter(p => p.stock_actual === 0);
  const lowStock = parts.filter(p => p.stock_actual > 0 && p.stock_actual <= p.stock_minimo);
  const total = outOfStock.length + lowStock.length;

  if (total === 0 || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: outOfStock.length > 0 ? '#fca5a5' : '#fed7aa' }}
      >
        <div
          className="flex items-start gap-3 p-4"
          style={{ background: outOfStock.length > 0 ? '#fff5f5' : '#fff7ed' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: outOfStock.length > 0 ? '#fee2e2' : '#ffedd5' }}
          >
            <AlertTriangle
              className="w-4 h-4"
              style={{ color: outOfStock.length > 0 ? '#dc2626' : '#ea580c' }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              {outOfStock.length > 0 && lowStock.length > 0
                ? `${outOfStock.length} sin stock y ${lowStock.length} con stock bajo`
                : outOfStock.length > 0
                ? `${outOfStock.length} repuesto${outOfStock.length > 1 ? 's' : ''} sin stock`
                : `${lowStock.length} repuesto${lowStock.length > 1 ? 's' : ''} con stock bajo el mínimo`}
            </p>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {[...outOfStock.slice(0, 3), ...lowStock.slice(0, 2)].map(p => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium"
                  style={{
                    background: p.stock_actual === 0 ? '#fee2e2' : '#ffedd5',
                    borderColor: p.stock_actual === 0 ? '#fca5a5' : '#fed7aa',
                    color: p.stock_actual === 0 ? '#dc2626' : '#c2410c',
                  }}
                >
                  <Package className="w-3 h-3" />
                  {p.name} ({p.stock_actual})
                </span>
              ))}
              {total > 5 && (
                <span className="text-xs text-slate-500 self-center">+{total - 5} más</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to={createPageUrl('SpareParts')}>
              <button
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all hover:shadow-sm"
                style={{ borderColor: outOfStock.length > 0 ? '#fca5a5' : '#fed7aa', color: outOfStock.length > 0 ? '#dc2626' : '#ea580c', background: 'white' }}
              >
                Ver repuestos
                <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg hover:bg-white/60 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}