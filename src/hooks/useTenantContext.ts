/**
 * Bootstraps tenant context once after sign-in.
 * Loads user profile → company → sites → seeds Zustand stores.
 */
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabaseConfigured } from '@/lib/supabase';
import { CacheTier, defaultQueryOptions } from '@/lib/cachePolicy';
import { useAuthStore } from '@/stores/authStore';
import { useSiteStore } from '@/stores/siteStore';
import { fetchUserProfile, fetchCompany, fetchSites } from '@/services/supabase/tenant';
import type { TenantProfile } from '@/stores/authStore';
import type { Site } from '@/stores/siteStore';
import { useDemoModeActive } from '@/providers/DemoModeProvider';

export function useTenantContext() {
  const isDemoMode = useDemoModeActive();
  const session = useAuthStore((s) => s.session);
  const setTenant = useAuthStore((s) => s.setTenant);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setSites = useSiteStore((s) => s.setSites);
  const userId = session?.user?.id;

  const profileQuery = useQuery({
    queryKey: ['tenant', 'profile', userId],
    queryFn: () => fetchUserProfile(userId!),
    enabled: supabaseConfigured && Boolean(userId),
    staleTime: CacheTier.structural.staleTime,
    gcTime: CacheTier.structural.gcTime,
    placeholderData: defaultQueryOptions.placeholderData,
    refetchOnMount: false,
  });

  const companyId = profileQuery.data?.company_id;

  const companyQuery = useQuery({
    queryKey: ['tenant', 'company', companyId],
    queryFn: () => fetchCompany(companyId!),
    enabled: Boolean(companyId),
    staleTime: CacheTier.structural.staleTime,
    gcTime: CacheTier.ambient.gcTime,
    placeholderData: defaultQueryOptions.placeholderData,
    refetchOnMount: false,
  });

  const sitesQuery = useQuery({
    queryKey: ['tenant', 'sites', companyId],
    queryFn: () => fetchSites(companyId!),
    enabled: Boolean(companyId),
    staleTime: CacheTier.structural.staleTime,
    gcTime: CacheTier.structural.gcTime,
    placeholderData: defaultQueryOptions.placeholderData,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (isDemoMode) return;

    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }

    if (!userId) {
      setTenant(null);
      setSites([]);
      setLoading(false);
      return;
    }

    if (profileQuery.isPending && !profileQuery.data) return;

    const profile = profileQuery.data;
    if (!profile) {
      setTenant(null);
      setSites([]);
      setLoading(false);
      return;
    }

    if (companyId && companyQuery.isPending && !companyQuery.data) return;

    const company = companyQuery.data;
    if (companyId && !company) {
      setTenant(null);
      setSites([]);
      setLoading(false);
      return;
    }

    if (companyId && sitesQuery.isPending && !sitesQuery.data) return;

    const sites = sitesQuery.data ?? [];

    if (company) {
      const tenant: TenantProfile = {
        company_id: profile.company_id,
        company_name: company.name,
        role: profile.role,
        site_ids: sites.map((s) => s.id),
      };
      setTenant(tenant);
    } else {
      setTenant(null);
    }

    const siteList: Site[] = sites.map((s) => ({
      id: s.id,
      name: s.name,
      company_id: s.company_id,
      location: s.location ?? undefined,
      latitude: s.latitude ?? undefined,
      longitude: s.longitude ?? undefined,
    }));
    setSites(siteList);
    setLoading(false);
  }, [
    userId,
    companyId,
    profileQuery.data,
    profileQuery.isPending,
    companyQuery.data,
    companyQuery.isPending,
    sitesQuery.data,
    sitesQuery.isPending,
    setTenant,
    setSites,
    setLoading,
    isDemoMode,
  ]);

  return {
    loading:
      (profileQuery.isPending && !profileQuery.data) ||
      (Boolean(companyId) &&
        ((companyQuery.isPending && !companyQuery.data) ||
          (sitesQuery.isPending && !sitesQuery.data))),
    companyName: companyQuery.data?.name ?? null,
  };
}
