import { useQuery } from '@tanstack/react-query';
import { supabaseConfigured } from '@/lib/supabase';
import { useAuthStore, selectTenantId } from '@/stores/authStore';
import { fetchAiInsights, type AiInsight } from '@/services/supabase/aiInsights';
import { CacheTier, defaultQueryOptions } from '@/lib/cachePolicy';
import { getDemoAiInsights } from '@/lib/monitoring/demoAiInsights';
import { useDemoModeActive } from '@/providers/DemoModeProvider';

export function useAiInsights(deviceIds?: string[]) {
  const companyId = useAuthStore(selectTenantId);
  const isDemoMode = useDemoModeActive();

  return useQuery({
    queryKey: ['ai-insights', companyId, deviceIds, isDemoMode],
    queryFn: async (): Promise<AiInsight[]> => {
      if (isDemoMode) return getDemoAiInsights(deviceIds);
      if (!supabaseConfigured || !companyId) return [];
      return fetchAiInsights(companyId, deviceIds);
    },
    enabled: Boolean(companyId) || isDemoMode,
    staleTime: CacheTier.ambient.staleTime,
    gcTime: CacheTier.ambient.gcTime,
    placeholderData: defaultQueryOptions.placeholderData,
    refetchInterval: isDemoMode ? false : 10 * 60_000,
    refetchOnMount: !isDemoMode,
  });
}
