import { useQuery } from '@tanstack/react-query';
import { fetchLatestPowerLogs } from '@/lib/aura';
import type { FleetPowerTotals } from '@/lib/inverterMetrics';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { supabaseConfigured } from '@/lib/supabase';

export const FLEET_POWER_KEY = ['fleet-power'] as const;

function aggregateFleet(
  rows: Awaited<ReturnType<typeof fetchLatestPowerLogs>>,
): FleetPowerTotals {
  return rows.reduce(
    (acc, { log }) => {
      if (!log) return acc;
      acc.solarKw += Number(log.solar_generation_kw ?? 0);
      acc.loadKw += Number(log.load_consumption_kw ?? 0);
      return acc;
    },
    { solarKw: 0, loadKw: 0 },
  );
}

export function useFleetPower(enabled: boolean) {
  const { isAuthenticated } = useSupabaseSession();

  return useQuery({
    queryKey: FLEET_POWER_KEY,
    queryFn: async () => {
      try {
        return aggregateFleet(await fetchLatestPowerLogs());
      } catch {
        return { solarKw: 0, loadKw: 0 };
      }
    },
    enabled: enabled && supabaseConfigured && isAuthenticated,
    staleTime: 30_000,
    retry: 1,
  });
}
