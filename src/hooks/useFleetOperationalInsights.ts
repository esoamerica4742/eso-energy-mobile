import { useMemo } from 'react';
import type { FleetSite, FleetSummary } from '@/types/fleet';
import { generateFleetOperationalInsights } from '@/lib/perceivedRealtime/fleetOperationalInsights';
import type { OperationalInsight } from '@/lib/perceivedRealtime';

type Options = {
  summary: FleetSummary;
  sites: FleetSite[];
  liveCount: number;
  streaming: boolean;
};

export function useFleetOperationalInsights({
  summary,
  sites,
  liveCount,
  streaming,
}: Options): OperationalInsight[] {
  return useMemo(
    () => generateFleetOperationalInsights({ summary, sites, liveCount, streaming }),
    [
      summary.totalLoadKw,
      summary.avgBatteryPct,
      summary.siteCount,
      summary.activeAlerts,
      liveCount,
      streaming,
      sites.map((s) => `${s.id}:${s.status}`).join('|'),
    ],
  );
}
