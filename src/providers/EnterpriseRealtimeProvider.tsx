import { useEffect, useRef } from 'react';
import { usePathname, useSegments } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { useCompanyId } from '@/hooks/useCompanyId';
import { useEnodeToast } from '@/providers/EnodeToastProvider';
import { enodeDeviceKey } from '@/hooks/useEnodeDevice';
import { FLEET_POWER_KEY } from '@/hooks/useFleetPower';
import {
  removeEnodeDeviceFromCache,
  upsertEnodeDeviceInCache,
} from '@/lib/enodeDeviceCache';
import type { EnodeDevice } from '@/services/enode.types';

type EnodeEventRow = {
  event_type?: string;
  payload?: Record<string, unknown>;
};

/**
 * One Realtime channel per company. All `.on()` handlers are chained before `.subscribe()`.
 * Channel name changes when companyId resolves — prevents "callbacks after subscribe" errors.
 */
export function EnterpriseRealtimeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = useSegments();
  const onLanding = pathname === '/' || pathname === '/index';
  const { isAuthenticated } = useSupabaseSession();
  const { data: companyId, isLoading: companyLoading } = useCompanyId();
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);
  queryClientRef.current = queryClient;
  const toast = useEnodeToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    if (!supabaseConfigured || !isAuthenticated || companyLoading || onLanding) return;

    const scope = companyId ?? 'unscoped';
    const channelName = `realtime:enode-mobile-${scope}`;
    const companyFilter = companyId ? `company_id=eq.${companyId}` : undefined;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enode_devices',
          ...(companyFilter ? { filter: companyFilter } : {}),
        },
        (payload: RealtimePostgresChangesPayload<EnodeDevice>) => {
          if (__DEV__) {
            console.log('Realtime change captured:', payload);
          }
          const row = payload.new as EnodeDevice | null;
          const removed = payload.old as EnodeDevice | null;

          if (payload.eventType === 'DELETE' && removed?.id) {
            removeEnodeDeviceFromCache(queryClientRef.current, removed.id);
            return;
          }

          if (row?.id) {
            queryClientRef.current.setQueryData(enodeDeviceKey(row.id), row);
            upsertEnodeDeviceInCache(queryClientRef.current, row);
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'enode_events',
          ...(companyFilter ? { filter: companyFilter } : {}),
        },
        (payload: RealtimePostgresChangesPayload<EnodeEventRow>) => {
          if (__DEV__) {
            console.log('Realtime change captured:', payload);
          }
          const row = payload.new as EnodeEventRow | null;
          if (!row?.event_type) return;

          if (row.event_type.includes('device')) {
            toastRef.current.show('Device status updated', 'info');
          }
          if (row.event_type === 'charger:action:updated') {
            toastRef.current.show('Charger action completed', 'success');
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'enode_telemetry_snapshots',
          ...(companyFilter ? { filter: companyFilter } : {}),
        },
        (payload) => {
          if (__DEV__) {
            console.log('Realtime change captured:', payload);
          }
          const row = payload.new as { device_id?: string } | null;
          if (row?.device_id) {
            void queryClientRef.current.invalidateQueries({
              queryKey: ['enode', 'telemetry', row.device_id],
            });
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'energy_metrics',
        },
        (payload) => {
          if (__DEV__) {
            console.log('Realtime change captured:', payload);
          }
          void queryClientRef.current.invalidateQueries({ queryKey: FLEET_POWER_KEY });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, companyId, companyLoading, onLanding]);

  return <>{children}</>;
}
