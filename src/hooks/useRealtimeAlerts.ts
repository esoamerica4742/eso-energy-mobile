/**
 * Realtime alerts hook.
 * Seeds the alertStore from Supabase, then subscribes to live Enode alert events.
 */
import { useEffect, useRef } from 'react';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { presentLocalMonitoringAlert } from '@/lib/monitoring/localAlertNotification';
import { useAuthStore, selectTenantId } from '@/stores/authStore';
import { useAlertStore } from '@/stores/alertStore';
import { AlertsFetchError, fetchAlerts, subscribeToAlerts } from '@/services/supabase/alerts';
import { useDemoModeActive } from '@/providers/DemoModeProvider';

const RETRY_BASE_MS = 1500;
const MAX_RETRIES = 5;

export function useRealtimeAlerts() {
  const companyId = useAuthStore(selectTenantId);
  const isDemoMode = useDemoModeActive();
  const seed = useAlertStore((s) => s.seed);
  const prepend = useAlertStore((s) => s.prepend);
  const acknowledge = useAlertStore((s) => s.acknowledge);
  const setSyncError = useAlertStore((s) => s.setSyncError);
  const setRealtimeStatus = useAlertStore((s) => s.setRealtimeStatus);
  const retryRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isDemoMode) return;

    if (!supabaseConfigured || !companyId) {
      seed([]);
      setSyncError(null);
      setRealtimeStatus('idle');
      return;
    }

    let cancelled = false;
    let channel: ReturnType<typeof subscribeToAlerts> | null = null;

    const bootstrap = async () => {
      try {
        const alerts = await fetchAlerts(companyId);
        if (!cancelled) {
          seed(alerts);
          setSyncError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof AlertsFetchError
              ? err.message
              : err instanceof Error
                ? err.message
                : 'Could not load alerts';
          setSyncError(message);
        }
      }
    };

    const attachSubscription = () => {
      if (channel) supabase.removeChannel(channel);
      channel = subscribeToAlerts(companyId, {
        onInsert: (alert) => {
          if (cancelled) return;
          prepend(alert);
          void presentLocalMonitoringAlert(alert);
        },
        onResolve: (alertId) => {
          if (!cancelled) acknowledge(alertId);
        },
        onStatus: (status) => {
          if (cancelled) return;
          if (status === 'SUBSCRIBED') {
            retryRef.current = 0;
            setRealtimeStatus('connected');
            setSyncError(null);
            return;
          }
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setRealtimeStatus('error');
            const attempt = retryRef.current + 1;
            retryRef.current = attempt;
            if (attempt <= MAX_RETRIES) {
              retryTimerRef.current = setTimeout(attachSubscription, RETRY_BASE_MS * attempt);
            }
          }
        },
      });
    };

    void bootstrap();
    attachSubscription();

    return () => {
      cancelled = true;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (channel) supabase.removeChannel(channel);
    };
  }, [
    acknowledge,
    companyId,
    isDemoMode,
    prepend,
    seed,
    setRealtimeStatus,
    setSyncError,
  ]);
}
