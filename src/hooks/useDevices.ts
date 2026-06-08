/**
 * Device list hook — TanStack Query fetches + type safety.
 */
import { useQuery } from '@tanstack/react-query';
import { supabaseConfigured } from '@/lib/supabase';
import { useAuthStore, selectTenantId } from '@/stores/authStore';
import { useSiteStore, selectActiveSite } from '@/stores/siteStore';
import { fetchDevices } from '@/services/supabase/devices';
import type { DbDevice } from '@/services/supabase/types';

export const DEVICES_KEY = (siteId: string) => ['devices', siteId] as const;

export function useDevices() {
  const companyId  = useAuthStore(selectTenantId);
  const activeSite = useSiteStore(selectActiveSite);
  const siteId     = activeSite?.id ?? null;

  return useQuery({
    queryKey: DEVICES_KEY(siteId ?? 'none'),
    queryFn: async () => {
      if (!supabaseConfigured || !siteId || !companyId) return [] as DbDevice[];
      return fetchDevices(siteId, companyId);
    },
    enabled: true,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
