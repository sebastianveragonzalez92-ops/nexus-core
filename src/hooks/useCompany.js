import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { DEFAULT_TICKET_CONFIG } from '@/lib/ticketConfigDefaults';

export function useCompany() {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [config, setConfig] = useState(DEFAULT_TICKET_CONFIG);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      setUser(me);
      if (me.company_id) {
        const c = await base44.entities.Company.get(me.company_id);
        setCompany(c);
        const configs = await base44.entities.TicketConfig.filter({ company_id: me.company_id });
        const raw = configs[0] || {};
        setConfig({
          ...DEFAULT_TICKET_CONFIG,
          ...raw,
          categories: raw.categories?.length ? raw.categories : DEFAULT_TICKET_CONFIG.categories,
          priorities: raw.priorities?.length ? raw.priorities : DEFAULT_TICKET_CONFIG.priorities,
          statuses: raw.statuses?.length ? raw.statuses : DEFAULT_TICKET_CONFIG.statuses,
          tipos: raw.tipos?.length ? raw.tipos : DEFAULT_TICKET_CONFIG.tipos,
          soluciones: raw.soluciones?.length ? raw.soluciones : DEFAULT_TICKET_CONFIG.soluciones,
          _id: raw.id,
        });
      }
    } catch (e) {
      // not logged in or error
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isPlatformAdmin = user?.is_platform_admin === true || (user?.role === 'admin' && !user?.company_id);

  return {
    user,
    company,
    config,
    loading,
    isPlatformAdmin,
    isCompanyAdmin: user?.role === 'admin' || isPlatformAdmin,
    reload: load,
  };
}