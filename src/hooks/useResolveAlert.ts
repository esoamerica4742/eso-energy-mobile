import { useCallback } from 'react';
import { acknowledgeAlert } from '@/services/supabase/alerts';
import { supabaseConfigured } from '@/lib/supabase';
import { useAlertStore } from '@/stores/alertStore';

/**
 * Optimistic alert resolution — removes from active list immediately.
 */
export function useResolveAlert() {
  const acknowledge = useAlertStore((s) => s.acknowledge);

  return useCallback(
    async (alertId: string) => {
      const target = useAlertStore.getState().alerts.find((a) => a.id === alertId);
      if (!target) return;

      acknowledge(alertId);

      if (!supabaseConfigured) return;

      try {
        await acknowledgeAlert(alertId);
      } catch {
        useAlertStore.getState().prepend(target);
      }
    },
    [acknowledge],
  );
}
