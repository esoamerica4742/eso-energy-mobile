import type { QueryClient } from '@tanstack/react-query';
import { enodeClient } from '@/services/enode';
import { fetchAlerts } from '@/services/supabase/alerts';
import { fetchSites } from '@/services/supabase/tenant';
import { ENODE_DEVICES_KEY } from '@/hooks/useEnodeDevices';
import { useAlertStore } from '@/stores/alertStore';
import { CacheTier } from '@/lib/cachePolicy';

type PrefetchContext = {
  companyId?: string | null;
  siteId?: string | null;
  userId?: string | null;
};

function staleOpts(tier: keyof typeof CacheTier) {
  return { staleTime: CacheTier[tier].staleTime };
}

export async function prefetchEnodeDevices(queryClient: QueryClient): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: ENODE_DEVICES_KEY,
    queryFn: async () => {
      const res = await enodeClient.listDevices(false);
      return res.devices;
    },
    ...staleOpts('live'),
  });
}

export async function prefetchTelemetryLatest(
  queryClient: QueryClient,
  siteId?: string | null,
): Promise<void> {
  const key = siteId ?? 'all';
  await queryClient.prefetchQuery({
    queryKey: ['enode', 'telemetry-latest', key],
    queryFn: async () => {
      const res = await enodeClient.getTelemetryLatest(siteId ?? undefined);
      return res.points;
    },
    ...staleOpts('live'),
  });
}

export async function prefetchTenantSites(
  queryClient: QueryClient,
  companyId: string,
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: ['tenant', 'sites', companyId],
    queryFn: () => fetchSites(companyId),
    ...staleOpts('structural'),
  });
}

export async function prefetchAlerts(companyId: string): Promise<void> {
  const rows = await fetchAlerts(companyId);
  useAlertStore.getState().seed(rows);
}

export async function prefetchInverterDashboard(
  queryClient: QueryClient,
  ctx: PrefetchContext,
): Promise<void> {
  const tasks: Promise<unknown>[] = [
    prefetchEnodeDevices(queryClient),
    prefetchTelemetryLatest(queryClient, ctx.siteId),
    prefetchTelemetryLatest(queryClient, 'all'),
  ];
  if (ctx.companyId) {
    tasks.push(prefetchTenantSites(queryClient, ctx.companyId));
    tasks.push(prefetchAlerts(ctx.companyId));
  }
  await Promise.allSettled(tasks);
}

export async function prefetchForTab(
  queryClient: QueryClient,
  routeName: string,
  ctx: PrefetchContext,
): Promise<void> {
  switch (routeName) {
    case 'index':
      await prefetchInverterDashboard(queryClient, ctx);
      break;
    case 'sites':
      await Promise.allSettled([
        prefetchEnodeDevices(queryClient),
        prefetchTelemetryLatest(queryClient, 'all'),
        ctx.companyId ? prefetchTenantSites(queryClient, ctx.companyId) : Promise.resolve(),
      ]);
      break;
    case 'reports':
      await Promise.allSettled([
        prefetchEnodeDevices(queryClient),
        prefetchTelemetryLatest(queryClient, 'all'),
        ctx.companyId ? prefetchTenantSites(queryClient, ctx.companyId) : Promise.resolve(),
      ]);
      break;
    case 'alerts':
      if (ctx.companyId) await prefetchAlerts(ctx.companyId);
      break;
    case 'settings':
      break;
    default:
      break;
  }
}

export async function prefetchCoreAfterAuth(
  queryClient: QueryClient,
  ctx: PrefetchContext,
): Promise<void> {
  await prefetchInverterDashboard(queryClient, ctx);
}
