import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Grid, SlidersHorizontal } from 'lucide-react';

export default function CourseFilters({ 
  sortBy, 
  onSortChange, 
  statusFilter, 
  onStatusChange,
  viewMode,
  onViewModeChange 
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="font-medium">Filtros y ordenamiento</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="enrolled">Pendiente</SelectItem>
              <SelectItem value="in_progress">En progreso</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Más recientes</SelectItem>
              <SelectItem value="oldest">Más antiguos</SelectItem>
              <SelectItem value="progress">Mayor progreso</SelectItem>
              <SelectItem value="title">Título (A-Z)</SelectItem>
              <SelectItem value="completion">Fecha de finalización</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => onViewModeChange('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="icon"
            onClick={() => onViewModeChange('calendar')}
          >
            <Calendar className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}