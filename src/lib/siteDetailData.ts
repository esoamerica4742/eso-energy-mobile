import type { EnodeDevice, EnodeTelemetryLatestPoint, EnodeTelemetryPoint } from '@/services/enode.types';
import { buildSparklineTrend } from '@/lib/siteCoordinates';
import type { FleetSite } from '@/types/fleet';

export type SiteChartPoint = {
  hour: number;
  solar: number;
  grid: number;
};

export type SiteInverterRow = {
  id: string;
  name: string;
  vendor: string | null;
  status: 'live' | 'degraded' | 'offline';
  solarKw: number;
  loadKw: number;
  batteryPct: number | null;
  lastSeenLabel?: string;
};

export function buildSiteChartData(
  points: EnodeTelemetryPoint[],
  fleetSite: FleetSite | null,
): SiteChartPoint[] {
  if (points.length >= 2) {
    return points
      .map((point) => {
        const date = new Date(point.recorded_at);
        return {
          hour: date.getHours() + date.getMinutes() / 60,
          solar: Number(point.production_kw ?? 0),
          grid: Math.abs(Number(point.grid_kw ?? 0)),
        };
      })
      .sort((a, b) => a.hour - b.hour);
  }

  if (!fleetSite) return [];

  const trend = fleetSite.sparklineTrend.length
    ? fleetSite.sparklineTrend
    : buildSparklineTrend(fleetSite.id, fleetSite.load);

  return trend.map((solar, index) => ({
    hour: index,
    solar,
    grid: Math.max(fleetSite.load - solar, 0),
  }));
}

function inverterStatus(
  device: EnodeDevice,
  latest?: EnodeTelemetryLatestPoint,
): SiteInverterRow['status'] {
  if (!device.is_reachable || device.connection_status === 'offline') return 'offline';
  if (device.connection_status === 'error') return 'degraded';
  if (latest?.fault_code || latest?.warning_code) return 'degraded';
  return 'live';
}

export function buildSiteInverterRows(
  devices: EnodeDevice[],
  latestPoints: EnodeTelemetryLatestPoint[],
): SiteInverterRow[] {
  const latestByDevice = new Map(latestPoints.map((point) => [point.device_id, point]));

  return devices.map((device) => {
    const latest = latestByDevice.get(device.id);
    return {
      id: device.id,
      name: device.display_name ?? device.vendor ?? 'Inverter',
      vendor: device.vendor,
      status: inverterStatus(device, latest),
      solarKw: Number(latest?.solar_output_kw ?? device.production_rate_kw ?? 0),
      loadKw: Number(latest?.load_draw_kw ?? Math.abs(device.grid_power_kw ?? 0)),
      batteryPct: latest?.battery_soc_percent ?? device.battery_level_pct,
    };
  });
}

export function sourceLabel(source: FleetSite['source']): string {
  switch (source) {
    case 'solar':
      return 'Solar primary';
    case 'grid':
      return 'Grid assist';
    case 'diesel':
      return 'Diesel backup';
    case 'warning':
      return 'Needs attention';
    case 'offline':
      return 'Offline';
    default:
      return 'Mixed source';
  }
}
