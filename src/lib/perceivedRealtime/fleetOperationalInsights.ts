import type { FleetSite, FleetSummary } from '@/types/fleet';
import type { OperationalInsight } from './operationalInsights';

type FleetInput = {
  summary: FleetSummary;
  sites: FleetSite[];
  liveCount: number;
  streaming: boolean;
};

/** Fleet-scoped operational insights — concise, enterprise tone. */
export function generateFleetOperationalInsights(input: FleetInput): OperationalInsight[] {
  const { summary, sites, liveCount, streaming } = input;

  if (!streaming || summary.siteCount === 0) {
    return [
      {
        id: 'fleet-awaiting',
        level: 'info',
        message: 'Awaiting fleet sync',
        context: 'Telemetry stream paused',
      },
    ];
  }

  const insights: OperationalInsight[] = [];
  const staleCount = sites.filter((s) => s.status === 'degraded').length;
  const offlineCount = sites.filter((s) => s.status === 'offline').length;

  if (liveCount === summary.siteCount && summary.siteCount > 0) {
    insights.push({
      id: 'fleet-all-live',
      level: 'info',
      message: 'All sites reporting live',
      context: `${summary.siteCount} sites · ${Math.round(summary.totalLoadKw)} kW aggregate`,
    });
  }

  if (staleCount > 0) {
    insights.push({
      id: 'fleet-stale-sites',
      level: 'watch',
      message: `${staleCount} site${staleCount === 1 ? '' : 's'} telemetry stale`,
      context: 'Review connectivity and last sync',
    });
  }

  if (offlineCount > 0) {
    insights.push({
      id: 'fleet-offline-sites',
      level: 'watch',
      message: `${offlineCount} site${offlineCount === 1 ? '' : 's'} offline`,
      context: 'Field inspection may be required',
    });
  }

  if (summary.avgBatteryPct <= 20 && liveCount > 0) {
    insights.push({
      id: 'fleet-low-soc',
      level: 'watch',
      message: 'Fleet average SOC below reserve',
      context: `Avg ${summary.avgBatteryPct}% · load balancing active`,
    });
  } else if (summary.avgBatteryPct >= 40) {
    insights.push({
      id: 'fleet-charging',
      level: 'info',
      message: 'Fleet battery reserves healthy',
      context: `Avg SOC ${summary.avgBatteryPct}%`,
    });
  }

  if (summary.activeAlerts > 0) {
    insights.push({
      id: 'fleet-alerts',
      level: 'watch',
      message: `${summary.activeAlerts} open fleet alert${summary.activeAlerts === 1 ? '' : 's'}`,
      context: 'Review operations guard on dashboard',
    });
  }

  if (summary.totalLoadKw > 0 && liveCount > 0) {
    insights.push({
      id: 'fleet-load-balancing',
      level: 'info',
      message: 'Load balancing active across fleet',
      context: `${Math.round(summary.totalLoadKw)} kW total draw`,
    });
  }

  insights.push({
    id: 'fleet-sync-healthy',
    level: 'info',
    message: 'Inverter synchronization healthy',
    context: `${liveCount}/${summary.siteCount} sites live`,
  });

  const priority: Record<OperationalInsight['level'], number> = { critical: 0, watch: 1, info: 2 };
  return insights.sort((a, b) => priority[a.level] - priority[b.level]).slice(0, 4);
}
