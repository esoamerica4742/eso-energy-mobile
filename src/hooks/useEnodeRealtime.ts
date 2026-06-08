import { useEffect, useRef } from 'react';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import type { EnodeDevice } from '@/services/enode.types';

type DevicePatch = Partial<EnodeDevice>;

type Options = {
  /** Prefer EnterpriseRealtimeProvider for app-wide updates. */
  enabled?: boolean;
  deviceId?: string;
  companyId?: string;
  onDevicePatch?: (patch: DevicePatch) => void;
  onEvent?: (eventType: string, payload: Record<string, unknown>) => void;
};

/**
 * Scoped Realtime — all `.on()` before `.subscribe()`; unique channel per scope.
 */
export function useEnodeRealtime({
  enabled = true,
  deviceId,
  companyId,
  onDevicePatch,
  onEvent,
}: Options) {
  const onDeviceRef = useRef(onDevicePatch);
  const onEventRef = useRef(onEvent);
  onDeviceRef.current = onDevicePatch;
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!supabaseConfigured || !enabled) return;

    const scope = deviceId ?? companyId ?? 'pending';
    const channelName = `realtime:enode-mobile-${scope}`;

    const deviceFilter = deviceId
      ? `id=eq.${deviceId}`
      : companyId
        ? `company_id=eq.${companyId}`
        : undefined;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enode_devices',
          ...(deviceFilter ? { filter: deviceFilter } : {}),
        },
        (payload) => {
          const row = payload.new as EnodeDevice | null;
          if (row && onDeviceRef.current) {
            onDeviceRef.current(row);
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'enode_events',
          ...(companyId ? { filter: `company_id=eq.${companyId}` } : {}),
        },
        (payload) => {
          const row = payload.new as {
            event_type?: string;
            payload?: Record<string, unknown>;
          };
          if (row?.event_type && onEventRef.current) {
            onEventRef.current(row.event_type, row.payload ?? {});
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, deviceId, companyId]);
}
