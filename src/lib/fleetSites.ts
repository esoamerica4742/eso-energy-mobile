import type { BranchRow } from '@/lib/aura';
import type { FleetFilter, FleetSite, FleetSummary } from '@/types/fleet';
import type { Site } from '@/stores/siteStore';
import { filterEnodeDevicesForSite } from '@/lib/enodeTelemetryAdapter';
import { buildSparklineTrend, resolveSiteCoordinates } from '@/lib/siteCoordinates';
import { formatLastSeen, STALE_THRESHOLD_MS } from '@/lib/telemetryStatus';
import type { EnodeDevice, EnodeTelemetryLatestPoint } from '@/services/enode.types';

export function branchRowsToFleetSites(
  rows: BranchRow[],
  sites: Site[],
  devices: EnodeDevice[] = [],
  latestPoints: EnodeTelemetryLatestPoint[] = [],
): FleetSite[] {
  const siteById = new Map(sites.map((s) => [s.id, s]));
  const telemetrySiteByDevice = new Map(latestPoints.map((p) => [p.device_id, p.site_id]));

  return rows.map((row) => {
    const site = siteById.get(row.id);
    const siteDevices = filterEnodeDevicesForSite(devices, row.id, telemetrySiteByDevice);
    const onlineInverters = siteDevices.filter(
      (d) => d.is_reachable && d.connection_status !== 'offline',
    ).length;

    const siteLatest = latestPoints
      .filter((point) => point.site_id === row.id || siteDevices.some((d) => d.id === point.device_id))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

    const lastSeenAt = siteLatest?.updated_at ?? null;
    const lastSeenAgeMs = lastSeenAt ? Date.now() - new Date(lastSeenAt).getTime() : Number.POSITIVE_INFINITY;
    const hasFault = siteDevices.some((d) => d.connection_status === 'error');
    const allOffline =
      siteDevices.length > 0 &&
      siteDevices.every((d) => !d.is_reachable || d.connection_status === 'offline');

    let status: FleetSite['status'] = 'live';
    if (row.source === 'offline' || allOffline || siteDevices.length === 0) {
      status = 'offline';
    } else if (row.source === 'warning' || hasFault) {
      status = 'degraded';
    } else if (lastSeenAgeMs > STALE_THRESHOLD_MS) {
      status = 'degraded';
    }

    const coords = resolveSiteCoordinates(
      row.id,
      site?.location,
      row.city,
      site?.latitude,
      site?.longitude,
    );

    return {
      ...row,
      status,
      inverterCount: site?.device_count ?? siteDevices.length,
      onlineInverters,
      alerts: status === 'degraded' ? 1 : 0,
      lastSeenAt,
      lastSeenLabel: lastSeenAt ? formatLastSeen(lastSeenAt) : undefined,
      latitude: coords?.latitude ?? 9.082,
      longitude: coords?.longitude ?? 8.6753,
      sparklineTrend: buildSparklineTrend(row.id, row.load),
    };
  });
}

export function filterFleetSites(
  sites: FleetSite[],
  filter: FleetFilter,
  query: string,
): FleetSite[] {
  const normalized = query.trim().toLowerCase();
  return sites.filter((site) => {
    if (filter === 'live' && site.status !== 'live') return false;
    if (filter === 'stale' && site.status !== 'degraded') return false;
    if (filter === 'offline' && site.status !== 'offline') return false;
    if (filter === 'alerts' && site.alerts <= 0) return false;
    if (!normalized) return true;
    return (
      site.name.toLowerCase().includes(normalized) ||
      site.city.toLowerCase().includes(normalized)
    );
  });
}

export function buildFleetSummary(sites: FleetSite[]): FleetSummary {
  const totalLoadKw = sites.reduce((sum, s) => sum + s.load, 0);
  const avgBatteryPct =
    sites.length === 0 ? 0 : Math.round(sites.reduce((sum, s) => sum + s.battery, 0) / sites.length);
  const healthySites = sites.filter((s) => s.status === 'live').length;

  return {
    totalLoadKw,
    avgBatteryPct,
    healthySites,
    siteCount: sites.length,
    activeAlerts: sites.reduce((sum, s) => sum + s.alerts, 0),
    lastSyncedLabel: '30s',
  };
}
