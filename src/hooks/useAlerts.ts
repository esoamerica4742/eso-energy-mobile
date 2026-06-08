import { useCallback, useMemo, useState } from 'react';
import { useAuthStore, selectTenantId } from '@/stores/authStore';
import { sortAlerts, useAlertStore } from '@/stores/alertStore';
import { fetchAlerts } from '@/services/supabase/alerts';

export function useAlerts() {
  const companyId = useAuthStore(selectTenantId);
  const authLoading = useAuthStore((s) => s.loading);
  const rawAlerts = useAlertStore((s) => s.alerts);
  const unreadCount = useAlertStore((s) => s.unreadCount);
  const seed = useAlertStore((s) => s.seed);
  const [isFetching, setIsFetching] = useState(false);

  const alerts = useMemo(
    () => sortAlerts(rawAlerts.filter((alert) => !alert.acknowledged)),
    [rawAlerts],
  );

  const refetch = useCallback(async () => {
    if (!companyId?.trim()) {
      seed([]);
      return;
    }
    setIsFetching(true);
    try {
      const rows = await fetchAlerts(companyId);
      seed(rows);
    } catch {
      seed([]);
    } finally {
      setIsFetching(false);
    }
  }, [companyId, seed]);

  return {
    alerts,
    unreadCount,
    isPending: authLoading && rawAlerts.length === 0,
    isFetching,
    refetch,
  };
}
