import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLatestPowerLogs } from '@/lib/aura';
import { supabaseConfigured } from '@/lib/supabase';
import { useDemoModeActive } from '@/providers/DemoModeProvider';
import {
  classifyNepaGridStatus,
  type NepaSiteRow,
} from '@/esopay/lib/nepaGrid';

const DEMO_ROWS: NepaSiteRow[] = [
  {
    id: 'demo-lagos',
    name: 'Lagos HQ',
    location: 'Lagos',
    gridState: 'on_grid',
    loadKw: 420.5,
    gridStatusRaw: 'importing',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-abuja',
    name: 'Abuja Plant',
    location: 'FCT',
    gridState: 'on_generator',
    loadKw: 284.1,
    gridStatusRaw: 'diesel',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-ph',
    name: 'Port Harcourt Depot',
    location: 'Rivers',
    gridState: 'on_grid',
    loadKw: 156.2,
    gridStatusRaw: 'online',
    updatedAt: new Date().toISOString(),
  },
];

function mapPowerLogs(
  rows: Awaited<ReturnType<typeof fetchLatestPowerLogs>>,
): NepaSiteRow[] {
  return rows.map(({ facility, log }) => {
    const gridState = classifyNepaGridStatus(log?.grid_status);
    return {
      id: facility.id,
      name: facility.facility_name,
      location: facility.location_state || '—',
      gridState,
      loadKw: log?.load_consumption_kw ?? 0,
      gridStatusRaw: log?.grid_status ?? 'unknown',
      updatedAt: log?.logged_at ?? null,
    };
  });
}

export function useNepaGridMonitoring() {
  const isDemo = useDemoModeActive();

  const query = useQuery({
    queryKey: ['esopay', 'nepa-grid-monitoring'],
    queryFn: async () => mapPowerLogs(await fetchLatestPowerLogs()),
    enabled: supabaseConfigured && !isDemo,
    staleTime: 30_000,
    retry: 1,
  });

  const sites = useMemo(() => {
    if (isDemo) return DEMO_ROWS;
    return query.data ?? [];
  }, [isDemo, query.data]);

  const summary = useMemo(() => {
    const onGrid = sites.filter((s) => s.gridState === 'on_grid').length;
    const onGenerator = sites.filter((s) => s.gridState === 'on_generator').length;
    const outage = sites.filter((s) => s.gridState === 'outage').length;
    const totalLoadKw = sites.reduce((sum, s) => sum + s.loadKw, 0);
    return {
      onGrid,
      onGenerator,
      outage,
      total: sites.length,
      totalLoadKw,
    };
  }, [sites]);

  return {
    sites,
    summary,
    isLoading: !isDemo && query.isLoading,
    isError: !isDemo && query.isError,
    refetch: query.refetch,
  };
}
