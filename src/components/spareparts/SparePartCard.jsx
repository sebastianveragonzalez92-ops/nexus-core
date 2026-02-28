import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, Edit, Trash2, MapPin } from 'lucide-react';

const categoryLabels = {
  electrico: 'Eléctrico',
  mecanico: 'Mecánico',
  hidraulico: 'Hidráulico',
  neumatico: 'Neumático',
  consumible: 'Consumible',
  otro: 'Otro',
};

const categoryColors = {
  electrico: 'bg-yellow-100 text-yellow-800',
  mecanico: 'bg-blue-100 text-blue-800',
  hidraulico: 'bg-cyan-100 text-cyan-800',
  neumatico: 'bg-purple-100 text-purple-800',
  consumible: 'bg-green-100 text-green-800',
  otro: 'bg-slate-100 text-slate-700',
};

export default function SparePartCard({ part, onEdit, onDelete, onAdjustStock }) {
  const isLowStock = part.stock_actual <= part.stock_minimo;
  const isOutOfStock = part.stock_actual === 0;

  const stockStatus = isOutOfStock
    ? { label: 'Sin stock', color: 'bg-red-100 text-red-700 border-red-200' }
    : isLowStock
    ? { label: 'Stock bajo', color: 'bg-orange-100 text-orange-700 border-orange-200' }
    : { label: 'Disponible', color: 'bg-green-100 text-green-700 border-green-200' };

  return (
    <div className={`bg-white rounded-xl border shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow ${isLowStock ? 'border-orange-300' : 'border-slate-200'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-500">{part.code}</span>
            {isLowStock && (
              <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
            )}
          </div>
          <h3 className="font-semibold text-slate-900 mt-0.5 truncate">{part.name}</h3>
        </div>
        <Badge className={`${categoryColors[part.category]} border-transparent shrink-0 text-xs`}>
          {categoryLabels[part.category] || part.category}
        </Badge>
      </div>

      {/* Stock */}
      <div className="flex items-center gap-3">
        <div className={`flex-1 rounded-lg border px-3 py-2 ${stockStatus.color}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">{stockStatus.label}</span>
            <span className="text-lg font-bold">{part.stock_actual} <span className="text-xs font-normal">{part.unit}</span></span>
          </div>
          <div className="text-xs opacity-75 mt-0.5">Mínimo: {part.stock_minimo} {part.unit}</div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1 text-xs text-slate-500">
        {part.ubicacion && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{part.ubicacion}</span>
          </div>
        )}
        {part.proveedor && (
          <div className="flex items-center gap-1.5">
            <Package className="w-3 h-3 shrink-0" />
            <span className="truncate">{part.proveedor}</span>
          </div>
        )}
        {part.precio_unitario && (
          <div className="text-slate-600 font-medium">
            ${part.precio_unitario.toLocaleString('es-CL')} / {part.unit}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => onAdjustStock(part)}>
          Ajustar stock
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(part)}>
          <Edit className="w-3.5 h-3.5 text-slate-500" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(part)}>
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
        </Button>
      </div>
    </div>
  );
}