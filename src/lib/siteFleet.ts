import type { BranchRow } from '@/lib/aura';
import { filterEnodeDevicesForSite } from '@/lib/enodeTelemetryAdapter';
import type { EnodeDevice, EnodeTelemetryLatestPoint } from '@/services/enode.types';
import type { Site } from '@/stores/siteStore';

function deriveSource(
  devices: EnodeDevice[],
  latestByDevice: Map<string, EnodeTelemetryLatestPoint>,
  solarTotal: number,
  loadTotal: number,
): BranchRow['source'] {
  if (devices.length === 0) return 'offline';

  const offlineCount = devices.filter(
    (device) => !device.is_reachable || device.connection_status === 'offline',
  ).length;

  if (offlineCount === devices.length) return 'offline';
  if (devices.some((device) => device.connection_status === 'error')) return 'warning';
  if (solarTotal > Math.max(loadTotal, 1) * 0.45) return 'solar';
  if (loadTotal > 0) return 'grid';
  return 'solar';
}

export function buildSiteFleetRows(
  sites: Site[],
  devices: EnodeDevice[],
  latestPoints: EnodeTelemetryLatestPoint[],
): BranchRow[] {
  if (sites.length === 0) return [];

  const latestByDevice = new Map(latestPoints.map((point) => [point.device_id, point]));
  const telemetrySiteByDevice = new Map(
    latestPoints.map((point) => [point.device_id, point.site_id]),
  );

  return sites.map((site) => {
    const siteDevices = filterEnodeDevicesForSite(devices, site.id, telemetrySiteByDevice);

    let loadTotal = 0;
    let solarTotal = 0;
    let batterySum = 0;
    let batteryCount = 0;
    let onlineCount = 0;

    for (const device of siteDevices) {
      const latest = latestByDevice.get(device.id);
      const load = Number(latest?.load_draw_kw ?? device.grid_power_kw ?? 0);
      const solar = Number(latest?.solar_output_kw ?? device.production_rate_kw ?? 0);
      const battery = latest?.battery_soc_percent ?? device.battery_level_pct;

      loadTotal += load;
      solarTotal += solar;

      if (battery != null) {
        batterySum += Number(battery);
        batteryCount += 1;
      }

      if (device.is_reachable && device.connection_status !== 'offline') {
        onlineCount += 1;
      }
    }

    const uptime =
      siteDevices.length === 0 ? 0 : (onlineCount / siteDevices.length) * 100;

    return {
      id: site.id,
      name: site.name,
      city: site.location ?? 'Nigeria',
      source: deriveSource(siteDevices, latestByDevice, solarTotal, loadTotal),
      load: Math.round(loadTotal),
      battery: batteryCount > 0 ? Math.round(batterySum / batteryCount) : 0,
      uptime: Math.round(uptime * 10) / 10,
    };
  });
}
