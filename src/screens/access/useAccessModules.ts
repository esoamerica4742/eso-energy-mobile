import { useMemo } from 'react';
import { useAuthStore, selectTenantId } from '@/stores/authStore';
import { useSiteStore } from '@/stores/siteStore';
import { useEnodeTelemetryLatest } from '@/hooks/useEnodeTelemetryLatest';
import { buildCommandCenterModules } from '@/screens/access/platformModules';

function formatLastSync(updatedAt: string | null | undefined): string | null {
  if (!updatedAt) return null;
  const deltaMs = Date.now() - new Date(updatedAt).getTime();
  if (!Number.isFinite(deltaMs) || deltaMs < 0) return null;
  const minutes = Math.round(deltaMs / 60_000);
  if (minutes < 1) return 'Last sync just now';
  if (minutes < 60) return `Last sync ${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return `Last sync ${hours}h ago`;
}

export function useAccessModules() {
  const companyId = useAuthStore(selectTenantId);
  const siteCount = useSiteStore((s) => s.sites.length);
  const latestQuery = useEnodeTelemetryLatest();

  const lastSyncAt = useMemo(() => {
    const points = latestQuery.data ?? [];
    if (!points.length) return null;
    return points.reduce<string | null>((max, point) => {
      const ts = point.updated_at;
      if (!ts) return max;
      if (!max || new Date(ts).getTime() > new Date(max).getTime()) return ts;
      return max;
    }, null);
  }, [latestQuery.data]);

  return useMemo(
    () =>
      buildCommandCenterModules({
        signedIn: Boolean(companyId),
        siteCount,
        lastSyncLabel: formatLastSync(lastSyncAt),
      }),
    [companyId, lastSyncAt, siteCount],
  );
}
