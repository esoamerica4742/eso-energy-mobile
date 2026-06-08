import { useCallback } from 'react';
import { useAlertStore } from '@/stores/alertStore';
import { acknowledgeAlert } from '@/services/supabase/alerts';
import { supabaseConfigured } from '@/lib/supabase';

/**
 * Optimistic alert dismiss — UI updates instantly, rolls back on failure.
 */
export function useAcknowledgeAlert() {
  const acknowledge = useAlertStore((s) => s.acknowledge);
  const setAcknowledged = useAlertStore((s) => s.setAcknowledged);

  return useCallback(
    async (alertId: string) => {
      const target = useAlertStore.getState().alerts.find((a) => a.id === alertId);
      if (!target || target.acknowledged) return;

      acknowledge(alertId);

      if (!supabaseConfigured) return;

      try {
        await acknowledgeAlert(alertId);
      } catch {
        setAcknowledged(alertId, false);
      }
    },
    [acknowledge, setAcknowledged],
  );
}
