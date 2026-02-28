import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { registerStockMovement } from '@/components/spareparts/stockMovementHelpers';

export default function WorkOrderPartsPanel({ workOrderId, user }) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState('');

  const { data: usedParts = [] } = useQuery({
    queryKey: ['workOrderParts', workOrderId],
    queryFn: () => base44.entities.WorkOrderPart.filter({ work_order_id: workOrderId }),
  });

  const { data: spareParts = [] } = useQuery({
    queryKey: ['spareParts'],
    queryFn: () => base44.entities.SparePart.list('-name', 200),
  });

  const addMutation = useMutation({
    mutationFn: async ({ partData, cantidadUsada }) => {
      const part = spareParts.find(p => p.id === partData.spare_part_id);
      const stockAnterior = part.stock_actual || 0;
      const nuevoStock = Math.max(0, stockAnterior - cantidadUsada);
      // 1. Registrar uso en la OT
      await base44.entities.WorkOrderPart.create(partData);
      // 2. Descontar stock
      await base44.entities.SparePart.update(partData.spare_part_id, { stock_actual: nuevoStock });
      // 3. Registrar movimiento
      await registerStockMovement({
        part,
        tipo: 'salida',
        cantidad: cantidadUsada,
        stockAnterior,
        stockPosterior: nuevoStock,
        user,
        notas: partData.notas || `Usado en OT`,
        workOrderId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workOrderParts', workOrderId]);
      queryClient.invalidateQueries(['spareParts']);
      setShowAdd(false);
      setSelectedPartId('');
      setCantidad(1);
      setNotas('');
      toast.success('Repuesto registrado y stock descontado');
    },
    onError: () => toast.error('Error al registrar repuesto'),
  });

  const removeMutation = useMutation({
    mutationFn: async (record) => {
      const part = spareParts.find(p => p.id === record.spare_part_id);
      const stockAnterior = part?.stock_actual || 0;
      const nuevoStock = stockAnterior + record.cantidad;
      // 1. Eliminar registro
      await base44.entities.WorkOrderPart.delete(record.id);
      // 2. Restaurar stock
      if (part) {
        await base44.entities.SparePart.update(record.spare_part_id, { stock_actual: nuevoStock });
        // 3. Registrar movimiento de entrada (devolución)
        await registerStockMovement({
          part,
          tipo: 'entrada',
          cantidad: record.cantidad,
          stockAnterior,
          stockPosterior: nuevoStock,
          user,
          notas: `Devolución desde OT`,
          workOrderId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workOrderParts', workOrderId]);
      queryClient.invalidateQueries(['spareParts']);
      toast.success('Repuesto eliminado y stock restaurado');
    },
  });

  const handleAdd = () => {
    const part = spareParts.find(p => p.id === selectedPartId);
    if (!part) return;
    if (cantidad > part.stock_actual) {
      toast.error(`Stock insuficiente. Disponible: ${part.stock_actual} ${part.unit}`);
      return;
    }
    addMutation.mutate({
      partData: {
        work_order_id: workOrderId,
        spare_part_id: part.id,
        spare_part_code: part.code,
        spare_part_name: part.name,
        cantidad,
        unit: part.unit,
        precio_unitario: part.precio_unitario || 0,
        notas,
      },
      cantidadUsada: cantidad,
    });
  };

  const selectedPart = spareParts.find(p => p.id === selectedPartId);
  const totalCosto = usedParts.reduce((acc, p) => acc + (p.cantidad * (p.precio_unitario || 0)), 0);

  return (
    <div className="mt-4 border-t border-slate-100 pt-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">Repuestos utilizados</span>
          {usedParts.length > 0 && (
            <Badge variant="secondary" className="text-xs">{usedParts.length}</Badge>
          )}
        </div>
        <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-3 h-3" />
          Agregar
        </Button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-slate-50 rounded-xl p-3 space-y-3 border border-slate-200">
          <div className="space-y-1.5">
            <Label className="text-xs">Repuesto</Label>
            <Select value={selectedPartId} onValueChange={setSelectedPartId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Seleccionar repuesto..." />
              </SelectTrigger>
              <SelectContent>
                {spareParts.filter(p => p.activo !== false).map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="flex items-center gap-2">
                      <span>[{p.code}] {p.name}</span>
                      <span className={`text-xs ${p.stock_actual <= p.stock_minimo ? 'text-orange-500' : 'text-green-600'}`}>
                        (stock: {p.stock_actual} {p.unit})
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPart && (
            <div className="text-xs text-slate-500 bg-white rounded-lg p-2 border">
              <span className="font-medium">{selectedPart.name}</span>
              {' · '}Stock disponible: <span className={`font-semibold ${selectedPart.stock_actual <= selectedPart.stock_minimo ? 'text-orange-500' : 'text-green-600'}`}>
                {selectedPart.stock_actual} {selectedPart.unit}
              </span>
              {selectedPart.stock_actual <= selectedPart.stock_minimo && (
                <span className="ml-1 text-orange-500">⚠ stock bajo</span>
              )}
            </div>
          )}

          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs">Cantidad</Label>
              <Input
                type="number"
                min="1"
                max={selectedPart?.stock_actual || 999}
                value={cantidad}
                onChange={e => setCantidad(Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs">Notas (opcional)</Label>
              <Input
                placeholder="Ej: instalado en bomba"
                value={notas}
                onChange={e => setNotas(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={!selectedPartId || cantidad < 1 || addMutation.isPending}
              onClick={handleAdd}
            >
              {addMutation.isPending ? 'Guardando...' : 'Confirmar'}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAdd(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Used parts list */}
      {usedParts.length === 0 ? (
        <p className="text-xs text-slate-400 italic">Sin repuestos registrados</p>
      ) : (
        <div className="space-y-2">
          {usedParts.map(record => (
            <div key={record.id} className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-3 py-2">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-mono text-slate-400 mr-1">{record.spare_part_code}</span>
                <span className="text-sm font-medium text-slate-800">{record.spare_part_name}</span>
                <div className="text-xs text-slate-500 mt-0.5">
                  {record.cantidad} {record.unit}
                  {record.precio_unitario > 0 && (
                    <span className="ml-2 text-slate-400">
                      ${(record.cantidad * record.precio_unitario).toLocaleString('es-CL')}
                    </span>
                  )}
                  {record.notas && <span className="ml-2 italic">· {record.notas}</span>}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => removeMutation.mutate(record)}
                disabled={removeMutation.isPending}
              >
                <Trash2 className="w-3 h-3 text-red-400" />
              </Button>
            </div>
          ))}

          {totalCosto > 0 && (
            <div className="text-xs text-right text-slate-500 pt-1 border-t border-slate-100">
              Costo total repuestos: <span className="font-semibold text-slate-700">${totalCosto.toLocaleString('es-CL')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}