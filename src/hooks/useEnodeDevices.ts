import { useQuery } from '@tanstack/react-query';
import { enodeClient } from '@/services/enode';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { supabaseConfigured } from '@/lib/supabase';
import { CacheTier, defaultQueryOptions } from '@/lib/cachePolicy';
import { useDemoModeActive } from '@/providers/DemoModeProvider';
import { getDemoDevices } from '@/lib/demoFleet';
import { ENODE_DEVICES_KEY } from '@/lib/enodeQueryKeys';

export { ENODE_DEVICES_KEY };

export function useEnodeDevices(options?: { syncOnMount?: boolean; enabled?: boolean }) {
  const { isAuthenticated } = useSupabaseSession();
  const isDemoMode = useDemoModeActive();
  const enabled =
    options?.enabled !== false &&
    (isDemoMode || (supabaseConfigured && isAuthenticated));

  return useQuery({
    queryKey: ENODE_DEVICES_KEY,
    queryFn: async () => {
      if (isDemoMode) return getDemoDevices();
      const res = await enodeClient.listDevices(options?.syncOnMount ?? false);
      return res.devices;
    },
    enabled,
    staleTime: CacheTier.live.staleTime,
    gcTime: CacheTier.live.gcTime,
    placeholderData: defaultQueryOptions.placeholderData,
    refetchInterval: enabled && !isDemoMode ? 30_000 : false,
    retry: isDemoMode ? 0 : 2,
  });
}
