import { useQuery } from '@tanstack/react-query';
import { solarmanClient } from '@/services/solarman';
import { CacheTier, defaultQueryOptions } from '@/lib/cachePolicy';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { supabaseConfigured } from '@/lib/supabase';

export const SOLARMAN_CONNECTION_KEY = ['solarman', 'connection'] as const;

export function useSolarmanConnection() {
  const { isAuthenticated } = useSupabaseSession();

  return useQuery({
    queryKey: SOLARMAN_CONNECTION_KEY,
    queryFn: () => solarmanClient.getConnection(),
    enabled: supabaseConfigured && isAuthenticated,
    staleTime: CacheTier.structural.staleTime,
    gcTime: CacheTier.structural.gcTime,
    placeholderData: defaultQueryOptions.placeholderData,
  });
}
