import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Advanced search and filter component
 * @param {string} searchPlaceholder - Placeholder for search input
 * @param {object[]} filters - Array of filter configs: { key, label, options: [{ value, label }] }
 * @param {object} activeFilters - Current active filters state
 * @param {function} onFilterChange - Callback when filters change
 * @param {function} onSearch - Callback when search changes
 * @param {boolean} showAdvanced - Show advanced filter section
 */
export default function AdvancedSearch({
  searchPlaceholder = 'Buscar...',
  filters = [],
  activeFilters = {},
  onFilterChange = () => {},
  onSearch = () => {},
  searchValue = '',
  showAdvanced = true,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActiveFilters = Object.values(activeFilters).some(v => v !== 'all' && v !== '');

  const handleClearFilters = () => {
    filters.forEach(f => onFilterChange(f.key, 'all'));
    onSearch('');
  };

  return (
    <div className="space-y-3">
      {/* Main search bar */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-10 pr-10 rounded-lg"
        />
        {searchValue && (
          <button
            onClick={() => onSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Filter toggles */}
      {showAdvanced && filters.length > 0 && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ChevronDown className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')} />
            Filtros avanzados
            {hasActiveFilters && <span className="ml-auto text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">{Object.values(activeFilters).filter(v => v !== 'all' && v !== '').length} activos</span>}
          </button>

          {/* Expandable filters section */}
          {isExpanded && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              {filters.map(filter => (
                <Select
                  key={filter.key}
                  value={activeFilters[filter.key] || 'all'}
                  onValueChange={(value) => onFilterChange(filter.key, value)}
                >
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span className="text-slate-500">Todos</span>
                    </SelectItem>
                    {filter.options?.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}

              {/* Clear button */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs h-8 col-span-1"
                >
                  Limpiar
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Simple filters (always visible) */}
      {!showAdvanced && filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map(filter => (
            <Select
              key={filter.key}
              value={activeFilters[filter.key] || 'all'}
              onValueChange={(value) => onFilterChange(filter.key, value)}
            >
              <SelectTrigger className="w-auto text-xs h-8">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {filter.options?.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs h-8"
            >
              Limpiar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}