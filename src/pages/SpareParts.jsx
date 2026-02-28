import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, AlertTriangle, Package, Filter, History } from 'lucide-react';
import SparePartCard from '@/components/spareparts/SparePartCard';
import SparePartForm from '@/components/spareparts/SparePartForm';
import StockAdjustModal from '@/components/spareparts/StockAdjustModal';
import StockMovementHistory from '@/components/spareparts/StockMovementHistory';

export default function SpareParts() {
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);
  React.useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [adjustingPart, setAdjustingPart] = useState(null);

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ['spareParts'],
    queryFn: () => base44.entities.SparePart.list('-created_date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SparePart.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['spareParts']); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SparePart.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['spareParts']);
      setShowForm(false);
      setEditingPart(null);
      setAdjustingPart(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SparePart.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['spareParts']),
  });

  const handleSave = (formData) => {
    if (editingPart?.id) {
      updateMutation.mutate({ id: editingPart.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleStockAdjust = (data) => {
    updateMutation.mutate({ id: adjustingPart.id, data });
  };

  const handleDelete = (part) => {
    if (confirm(`¿Eliminar "${part.name}"?`)) {
      deleteMutation.mutate(part.id);
    }
  };

  // Filtered parts
  const filtered = parts.filter(p => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.code?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchStock = stockFilter === 'all'
      || (stockFilter === 'low' && p.stock_actual <= p.stock_minimo && p.stock_actual > 0)
      || (stockFilter === 'out' && p.stock_actual === 0)
      || (stockFilter === 'ok' && p.stock_actual > p.stock_minimo);
    return matchSearch && matchCategory && matchStock;
  });

  // Stats
  const totalParts = parts.length;
  const lowStock = parts.filter(p => p.stock_actual <= p.stock_minimo && p.stock_actual > 0).length;
  const outOfStock = parts.filter(p => p.stock_actual === 0).length;
  const totalValue = parts.reduce((acc, p) => acc + (p.stock_actual * (p.precio_unitario || 0)), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Repuestos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Inventario y control de stock</p>
        </div>
        <Button
          onClick={() => { setEditingPart(null); setShowForm(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Repuesto
        </Button>
      </div>
    

      <Tabs defaultValue="inventario">
        <TabsList className="mb-2">
          <TabsTrigger value="inventario" className="gap-2"><Package className="w-4 h-4" />Inventario</TabsTrigger>
          <TabsTrigger value="historial" className="gap-2"><History className="w-4 h-4" />Historial de movimientos</TabsTrigger>
        </TabsList>

        <TabsContent value="inventario" className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{totalParts}</div>
              <div className="text-xs text-slate-500">Total repuestos</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{lowStock}</div>
              <div className="text-xs text-slate-500">Stock bajo</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{outOfStock}</div>
              <div className="text-xs text-slate-500">Sin stock</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">$</span>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">${totalValue.toLocaleString('es-CL')}</div>
              <div className="text-xs text-slate-500">Valor total inv.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Low stock alert banner */}
      {(lowStock > 0 || outOfStock > 0) && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-800">
              {outOfStock > 0 && `${outOfStock} repuesto(s) sin stock. `}
              {lowStock > 0 && `${lowStock} repuesto(s) con stock bajo el mínimo.`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-orange-300 text-orange-700 hover:bg-orange-100 text-xs"
            onClick={() => setStockFilter('low')}
          >
            Ver alertas
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44">
            <Filter className="w-4 h-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="electrico">Eléctrico</SelectItem>
            <SelectItem value="mecanico">Mecánico</SelectItem>
            <SelectItem value="hidraulico">Hidráulico</SelectItem>
            <SelectItem value="neumatico">Neumático</SelectItem>
            <SelectItem value="consumible">Consumible</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Estado stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo el stock</SelectItem>
            <SelectItem value="ok">Stock OK</SelectItem>
            <SelectItem value="low">Stock bajo</SelectItem>
            <SelectItem value="out">Sin stock</SelectItem>
          </SelectContent>
        </Select>
        {(categoryFilter !== 'all' || stockFilter !== 'all' || search) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setCategoryFilter('all'); setStockFilter('all'); }}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Parts Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-400">Cargando repuestos...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No hay repuestos registrados</p>
          <p className="text-slate-400 text-sm mt-1">Agrega tu primer repuesto con el botón superior</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(part => (
            <SparePartCard
              key={part.id}
              part={part}
              onEdit={(p) => { setEditingPart(p); setShowForm(true); }}
              onDelete={handleDelete}
              onAdjustStock={setAdjustingPart}
            />
          ))}
        </div>
      )}

        </TabsContent>

        <TabsContent value="historial">
          <StockMovementHistory spareParts={parts} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showForm && (
        <SparePartForm
          part={editingPart}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingPart(null); }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {adjustingPart && (
        <StockAdjustModal
          part={adjustingPart}
          onSave={handleStockAdjust}
          onCancel={() => setAdjustingPart(null)}
          isLoading={updateMutation.isPending}
          user={user}
        />
      )}
    </div>
  );
}