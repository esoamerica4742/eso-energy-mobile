/**
 * Realtime alerts hook.
 * Seeds the alertStore from Supabase, then subscribes to live Enode alert events.
 */
import { useEffect } from 'react';
import { supabaseConfigured } from '@/lib/supabase';
import { useAuthStore, selectTenantId } from '@/stores/authStore';
import { useAlertStore } from '@/stores/alertStore';
import { fetchAlerts, subscribeToAlerts } from '@/services/supabase/alerts';
import { useDemoModeActive } from '@/providers/DemoModeProvider';

export function useRealtimeAlerts() {
  const companyId = useAuthStore(selectTenantId);
  const isDemoMode = useDemoModeActive();
  const seed = useAlertStore((s) => s.seed);
  const prepend = useAlertStore((s) => s.prepend);
  const acknowledge = useAlertStore((s) => s.acknowledge);

  useEffect(() => {
    if (isDemoMode) return;

    if (!supabaseConfigured || !companyId) {
      seed([]);
      return;
    }

    let cancelled = false;

    void fetchAlerts(companyId)
      .then((alerts) => {
        if (!cancelled) seed(alerts);
      })
      .catch(() => {
        if (!cancelled) seed([]);
      });

    const channel = subscribeToAlerts(companyId, {
      onInsert: (alert) => {
        if (!cancelled) prepend(alert);
      },
      onResolve: (alertId) => {
        if (!cancelled) acknowledge(alertId);
      },
    });

    return () => {
      cancelled = true;
      void channel.unsubscribe();
    };
  }, [companyId, isDemoMode, seed, prepend, acknowledge]);
}
