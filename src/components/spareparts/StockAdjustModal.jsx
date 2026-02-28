import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, Minus } from 'lucide-react';
import { registerStockMovement } from './stockMovementHelpers';

export default function StockAdjustModal({ part, onSave, onCancel, isLoading }) {
  const [mode, setMode] = useState('entrada'); // 'entrada' | 'salida' | 'ajuste'
  const [cantidad, setCantidad] = useState(1);
  const [nota, setNota] = useState('');

  const newStock = mode === 'entrada'
    ? part.stock_actual + cantidad
    : mode === 'salida'
    ? Math.max(0, part.stock_actual - cantidad)
    : cantidad;

  const handleSave = () => {
    onSave({ stock_actual: newStock });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-base font-bold text-slate-900">Ajustar Stock</h2>
            <p className="text-xs text-slate-500 mt-0.5">{part.name}</p>
          </div>
          <button onClick={onCancel} className="p-2 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Current stock */}
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-500">Stock actual</div>
            <div className="text-3xl font-bold text-slate-900">{part.stock_actual}</div>
            <div className="text-xs text-slate-500">{part.unit}</div>
          </div>

          {/* Mode selector */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'entrada', label: 'Entrada', color: 'bg-green-100 text-green-700 border-green-300' },
              { key: 'salida', label: 'Salida', color: 'bg-red-100 text-red-700 border-red-300' },
              { key: 'ajuste', label: 'Ajuste', color: 'bg-blue-100 text-blue-700 border-blue-300' },
            ].map(m => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${mode === m.key ? m.color : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <Label>{mode === 'ajuste' ? 'Nuevo stock total' : 'Cantidad'}</Label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCantidad(Math.max(0, cantidad - 1))}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"
              >
                <Minus className="w-4 h-4 text-slate-600" />
              </button>
              <Input
                type="number"
                min="0"
                value={cantidad}
                onChange={e => setCantidad(Number(e.target.value))}
                className="text-center font-semibold"
              />
              <button
                onClick={() => setCantidad(cantidad + 1)}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"
              >
                <Plus className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-indigo-50 rounded-xl p-3 text-center border border-indigo-100">
            <div className="text-xs text-indigo-500">Nuevo stock</div>
            <div className={`text-2xl font-bold ${newStock <= part.stock_minimo ? 'text-orange-600' : 'text-indigo-700'}`}>
              {newStock}
            </div>
            {newStock <= part.stock_minimo && (
              <div className="text-xs text-orange-500 mt-0.5">⚠ Por debajo del mínimo ({part.stock_minimo})</div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button
            size="sm"
            disabled={isLoading}
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isLoading ? 'Guardando...' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </div>
  );
}