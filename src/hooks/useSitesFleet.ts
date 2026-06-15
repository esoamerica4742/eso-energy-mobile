import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { BranchRow } from '@/lib/aura';
import { buildSiteFleetRows } from '@/lib/siteFleet';
import { useEnodeDevices } from '@/hooks/useEnodeDevices';
import { useEnodeTelemetryLatest } from '@/hooks/useEnodeTelemetryLatest';
import { enodeClient } from '@/services/enode';
import { useAuthStore, selectTenantId } from '@/stores/authStore';
import { useSiteStore } from '@/stores/siteStore';

export function useSitesFleet() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore(selectTenantId);
  const authLoading = useAuthStore((s) => s.loading);
  const sites = useSiteStore((s) => s.sites);

  const devicesQuery = useEnodeDevices();
  const latestQuery = useEnodeTelemetryLatest();

  const data = useMemo(
    (): BranchRow[] =>
      buildSiteFleetRows(sites, devicesQuery.data ?? [], latestQuery.data ?? []),
    [sites, devicesQuery.data, latestQuery.data],
  );

  const refetch = useCallback(async () => {
    if (companyId) {
      await queryClient.refetchQueries({ queryKey: ['tenant', 'sites', companyId] });
    }

    try {
      await enodeClient.syncAll();
    } catch {
      // Keep cached fleet rows if sync fails.
    }

    await Promise.all([
      devicesQuery.refetch(),
      latestQuery.refetch(),
    ]);
  }, [companyId, devicesQuery, latestQuery, queryClient]);

  return {
    data,
    sites,
    isPending: authLoading,
    isFetching: devicesQuery.isFetching || latestQuery.isFetching,
    refetch,
  };
}
