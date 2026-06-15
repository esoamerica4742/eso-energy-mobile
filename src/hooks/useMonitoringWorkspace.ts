import { useQuery } from '@tanstack/react-query';
import { useDemoModeActive } from '@/providers/DemoModeProvider';
import { supabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useSiteStore } from '@/stores/siteStore';

/**
 * True while tenant profile / company / sites are still hydrating after sign-in.
 */
export function useMonitoringWorkspace() {
  const isDemoMode = useDemoModeActive();
  const authLoading = useAuthStore((s) => s.loading);
  const userId = useAuthStore((s) => s.session?.user?.id);
  const sites = useSiteStore((s) => s.sites);

  const sitesQueryPending = useQuery({
    queryKey: ['tenant', 'sites', 'pending-check'],
    queryFn: async () => false,
    enabled: false,
  });

  const profilePending = useQuery({
    queryKey: ['tenant', 'profile', userId],
    enabled: false,
  });

  const tenantHydrating =
    !isDemoMode &&
    Boolean(userId) &&
    supabaseConfigured &&
    (authLoading || profilePending.isPending || sitesQueryPending.isPending);

  const sitesLoading =
    !isDemoMode &&
    Boolean(userId) &&
    supabaseConfigured &&
    sites.length === 0 &&
    (authLoading || profilePending.fetchStatus === 'fetching');

  return {
    tenantHydrating,
    sitesLoading,
    hasSites: sites.length > 0,
    siteCount: sites.length,
  };
}
