import type {
  EnodeConnectionStatus,
  EnodeDevice,
  EnodeDeviceType,
  EnodeTelemetryLatestPoint,
  EnodeTelemetryPoint,
} from '@/services/enode.types';
import type { DbDevice } from '@/services/supabase/types';
import type { TelemetryPoint } from '@/stores/telemetryStore';

function mapConnectionStatus(
  status: EnodeConnectionStatus,
  reachable: boolean,
): DbDevice['status'] {
  if (!reachable || status === 'offline') return 'offline';
  if (status === 'error') return 'fault';
  if (status === 'syncing') return 'maintenance';
  return 'online';
}

function mapDeviceType(type: EnodeDeviceType): DbDevice['type'] {
  if (type === 'battery') return 'battery';
  if (type === 'meter') return 'meter';
  if (type === 'charger') return 'inverter';
  return 'inverter';
}

export function filterEnodeDevicesForSite(
  devices: EnodeDevice[],
  siteId: string | null | undefined,
  telemetrySiteByDevice: Map<string, string | null> = new Map(),
): EnodeDevice[] {
  if (!devices.length) return [];
  if (!siteId) return devices;

  const matched = devices.filter((device) => {
    if (device.branch_id === siteId) return true;
    const telemetrySiteId = telemetrySiteByDevice.get(device.id);
    return Boolean(telemetrySiteId && telemetrySiteId === siteId);
  });

  if (matched.length > 0) return matched;

  const unassigned = devices.filter((device) => !device.branch_id);
  if (unassigned.length > 0) return unassigned;

  return [];
}

export function mapEnodeDeviceToDb(device: EnodeDevice, fallbackSiteId: string): DbDevice {
  return {
    id: device.id,
    site_id: device.branch_id ?? fallbackSiteId,
    company_id: device.company_id,
    name: device.display_name ?? device.vendor ?? 'Inverter',
    type: mapDeviceType(device.device_type),
    status: mapConnectionStatus(device.connection_status, device.is_reachable),
    model: device.vendor,
    serial: device.enode_device_id,
    installed_at: device.created_at,
    metadata: device.raw_state ?? null,
  };
}

export function enodeLatestToTelemetryPoint(row: EnodeTelemetryLatestPoint): TelemetryPoint {
  const timestamp = row.updated_at ?? row.system_timestamp;
  return {
    id: `${row.device_id}-${timestamp}`,
    device_id: row.device_id,
    voltage: 0,
    current: 0,
    power_kw: Number(row.solar_output_kw ?? 0),
    battery_pct: Number(row.battery_soc_percent ?? 0),
    load_kw: Number(row.load_draw_kw ?? 0),
    temperature_c: 0,
    timestamp,
  };
}

export function enodeDeviceToTelemetryPoint(device: EnodeDevice): TelemetryPoint | null {
  const timestamp = device.updated_at ?? device.last_seen_at;
  if (!timestamp) return null;

  return {
    id: `${device.id}-${timestamp}`,
    device_id: device.id,
    voltage: 0,
    current: 0,
    power_kw: Number(device.production_rate_kw ?? 0),
    battery_pct: Number(device.battery_level_pct ?? 0),
    load_kw: Math.abs(Number(device.grid_power_kw ?? 0)),
    temperature_c: 0,
    timestamp,
  };
}

export function enodeHistoryToTelemetryPoint(
  deviceId: string,
  point: EnodeTelemetryPoint,
): TelemetryPoint {
  return {
    id: `${deviceId}-${point.recorded_at}`,
    device_id: deviceId,
    voltage: 0,
    current: 0,
    power_kw: Number(point.production_kw ?? 0),
    battery_pct: 0,
    load_kw: Math.abs(Number(point.grid_kw ?? 0)),
    temperature_c: 0,
    timestamp: point.recorded_at,
  };
}

export function enodeRealtimeToTelemetryPoint(
  deviceId: string,
  point: { solarKw: number; loadKw: number; batterySoc: number | null; updatedAt: string },
): TelemetryPoint {
  return {
    id: `${deviceId}-${point.updatedAt}`,
    device_id: deviceId,
    voltage: 0,
    current: 0,
    power_kw: Number(point.solarKw ?? 0),
    battery_pct: Number(point.batterySoc ?? 0),
    load_kw: Number(point.loadKw ?? 0),
    temperature_c: 0,
    timestamp: point.updatedAt,
  };
}
