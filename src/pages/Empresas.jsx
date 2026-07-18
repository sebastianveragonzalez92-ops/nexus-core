import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, Search, Users, Ban, CheckCircle2, Loader2 } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_STYLES = {
  activa: 'bg-green-100 text-green-700',
  inactiva: 'bg-slate-100 text-slate-500',
  suspendida: 'bg-red-100 text-red-700',
};

export default function Empresas() {
  const { isPlatformAdmin, loading } = useCompany();
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list('-created_date', 200),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Company.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });

  if (loading) {
    return <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>;
  }

  if (!isPlatformAdmin) {
    return (
      <div className="p-6 text-center">
        <Ban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-slate-700">Acceso restringido</h2>
        <p className="text-sm text-slate-500 mt-1">Solo los administradores de plataforma pueden gestionar empresas.</p>
      </div>
    );
  }

  const filtered = companies.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Empresas</h1>
          <p className="text-sm text-slate-500">{companies.length} empresas registradas en la plataforma</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Buscar por nombre o identificador..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
            <div className="flex items-start gap-3 mb-3">
              {c.logo_url ? (
                <img src={c.logo_url} alt={c.name} className="w-12 h-12 rounded-lg border object-contain p-1" />
              ) : (
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: `${c.primary_color || '#4f46e5'}15` }}>
                  <span className="text-lg font-bold" style={{ color: c.primary_color || '#4f46e5' }}>{c.name?.charAt(0)}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{c.name}</h3>
                <p className="text-xs text-slate-400 truncate">{c.slug}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[c.status] || STATUS_STYLES.inactiva}`}>
                {c.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500 flex-1">
              {c.industry && <p><span className="text-slate-400">Industria:</span> {c.industry}</p>}
              {c.contact_email && <p className="truncate"><span className="text-slate-400">Contacto:</span> {c.contact_email}</p>}
              <p><span className="text-slate-400">Plan:</span> <span className="capitalize">{c.plan}</span></p>
              {c.created_date && <p><span className="text-slate-400">Creada:</span> {format(new Date(c.created_date), 'dd MMM yyyy', { locale: es })}</p>}
            </div>

            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
              {c.status === 'activa' ? (
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate({ id: c.id, status: 'suspendida' })}>
                  <Ban className="w-3.5 h-3.5" /> Suspender
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate({ id: c.id, status: 'activa' })}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Activar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-16 text-slate-400">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No hay empresas registradas</p>
        </div>
      )}
    </div>
  );
}