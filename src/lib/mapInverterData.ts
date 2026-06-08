import type { InverterData, MetricStatus } from '@/types/inverter';
import type { ConnectionStatus } from '@/types/dashboard';
import { createEmptyInverterData } from '@/lib/monitoring/emptyInverterData';
import { resolveSiteConnectionStatus } from '@/lib/telemetryStatus';

type TelemetryPoint = {
  power_kw?: number;
  battery_pct?: number;
  load_kw?: number;
  temperature_c?: number;
  timestamp?: string;
};

type DeviceInput = {
  id: string;
  name: string;
  status?: 'online' | 'offline' | 'fault' | 'maintenance';
} | null | undefined;

function batteryStatus(pct: number): MetricStatus {
  if (pct <= 10) return 'critical';
  if (pct <= 30) return 'low';
  return 'normal';
}

function tempStatus(tempC: number): MetricStatus {
  if (tempC <= 0) return 'normal';
  if (tempC >= 75) return 'critical';
  if (tempC >= 55) return 'high';
  return 'normal';
}

function signalLevel(loadKw: number): number {
  if (loadKw >= 400) return 5;
  if (loadKw >= 320) return 4;
  if (loadKw >= 240) return 3;
  if (loadKw >= 160) return 2;
  if (loadKw > 0) return 1;
  return 0;
}

export function buildInverterData(
  device: DeviceInput,
  siteName: string | null | undefined,
  telemetry: TelemetryPoint | null | undefined,
  isLive = true,
): InverterData {
  if (!device) return createEmptyInverterData(siteName);

  const hasTelemetry = Boolean(
    telemetry &&
      (telemetry.power_kw != null ||
        telemetry.load_kw != null ||
        telemetry.battery_pct != null ||
        telemetry.temperature_c != null),
  );

  const connectionStatus = resolveSiteConnectionStatus({
    hasDevice: true,
    hasTelemetry,
    deviceStatus:
      device.status === 'fault'
        ? 'fault'
        : device.status === 'maintenance'
          ? 'maintenance'
          : device.status === 'offline'
            ? 'offline'
            : 'online',
    updatedAt: telemetry?.timestamp ?? null,
    batteryPct: telemetry?.battery_pct,
    temperatureC: telemetry?.temperature_c,
  });

  const live = isLive && connectionStatus === 'live';

  const batteryPct = hasTelemetry ? Math.round(telemetry!.battery_pct ?? 0) : 0;
  const loadKw = hasTelemetry ? Number((telemetry!.load_kw ?? 0).toFixed(1)) : 0;
  const powerKw = hasTelemetry ? Number((telemetry!.power_kw ?? 0).toFixed(2)) : 0;
  const tempC = hasTelemetry ? Math.round(telemetry!.temperature_c ?? 0) : 0;

  return {
    id: device.id,
    name: device.name,
    site: siteName?.trim() || 'Fleet site',
    isLive: live,
    connectionStatus,
    battery: {
      percentage: batteryPct,
      status: batteryStatus(batteryPct),
    },
    load: {
      value: loadKw,
      unit: 'kW',
      label: 'Active draw',
      signalLevel: signalLevel(loadKw),
    },
    power: {
      value: powerKw,
      unit: 'kW',
      label: 'Output',
    },
    temp: {
      value: tempC,
      unit: '°C',
      status: tempStatus(tempC),
    },
  };
}

export { createEmptyInverterData };
