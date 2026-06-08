/**
 * Warms critical caches after sign-in so tab switches feel instant.
 */
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore, selectTenantId } from '@/stores/authStore';
import { useSiteStore, selectActiveSite } from '@/stores/siteStore';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { prefetchCoreAfterAuth } from '@/lib/prefetch';

export function DataPrefetchBootstrap() {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useSupabaseSession();
  const companyId = useAuthStore(selectTenantId);
  const authLoading = useAuthStore((s) => s.loading);
  const activeSite = useSiteStore(selectActiveSite);
  const warmedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || authLoading || !companyId) return;

    const warmKey = `${user?.id ?? 'anon'}:${companyId}:${activeSite?.id ?? 'none'}`;
    if (warmedRef.current === warmKey) return;
    warmedRef.current = warmKey;

    void prefetchCoreAfterAuth(queryClient, {
      companyId,
      siteId: activeSite?.id,
      userId: user?.id,
    }).catch(() => {
      // Prefetch is best-effort — never crash the app shell.
    });
  }, [
    activeSite?.id,
    authLoading,
    companyId,
    isAuthenticated,
    queryClient,
    user?.id,
  ]);

  return null;
}
