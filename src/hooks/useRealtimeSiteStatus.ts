import { useEffect, useMemo } from 'react';
import { supabaseConfigured } from '@/lib/supabase';
import { fetchSites } from '@/services/supabase/tenant';
import { useAuthStore, selectTenantId } from '@/stores/authStore';
import { useSiteStore } from '@/stores/siteStore';
import { useDemoModeActive } from '@/providers/DemoModeProvider';
import { DEMO_SITES } from '@/lib/demoFleet';
import { useRealtimeTelemetryStore } from '@/stores/realtimeTelemetryStore';

export type FleetSiteStatus = {
  id: string;
  name: string;
  status: 'live' | 'stale' | 'offline';
};

/**
 * Fleet sites with live status — sites table + realtime reconnect signal.
 */
export function useRealtimeSiteStatus() {
  const companyId = useAuthStore(selectTenantId);
  const isDemoMode = useDemoModeActive();
  const sites = useSiteStore((s) => s.sites);
  const setSites = useSiteStore((s) => s.setSites);
  const isConnected = useRealtimeTelemetryStore((s) => s.wsConnected);

  useEffect(() => {
    if (isDemoMode) {
      setSites(DEMO_SITES);
      return;
    }
    if (!supabaseConfigured || !companyId) return;
    void fetchSites(companyId)
      .then((rows) =>
        setSites(
          rows.map((row) => ({
            id: row.id,
            name: row.name,
            company_id: row.company_id,
            location: row.location ?? undefined,
            latitude: row.latitude,
            longitude: row.longitude,
          })),
        ),
      )
      .catch(() => {});
  }, [companyId, isDemoMode, setSites]);

  const fleetSites: FleetSiteStatus[] = useMemo(
    () =>
      sites.map((site) => ({
        id: site.id,
        name: site.name,
        status: isConnected ? 'live' : 'stale',
      })),
    [isConnected, sites],
  );

  const healthySiteCount = useMemo(
    () => fleetSites.filter((s) => s.status === 'live').length,
    [fleetSites],
  );

  return {
    sites: fleetSites,
    aggregateKw: 0,
    healthySiteCount,
    isReconnecting: !isDemoMode && !isConnected,
  };
}
