import { formatDistanceToNowStrict } from 'date-fns';
import type { SiteConnectionStatus, DeviceLinkStatus } from '@/types/siteTelemetry';

export const STALE_THRESHOLD_MS = 5 * 60 * 1000;

type ResolveInput = {
  hasDevice: boolean;
  hasTelemetry: boolean;
  deviceStatus?: DeviceLinkStatus;
  updatedAt?: string | null;
  batteryPct?: number;
  temperatureC?: number;
};

export function resolveSiteConnectionStatus(input: ResolveInput): SiteConnectionStatus {
  if (!input.hasDevice || !input.hasTelemetry) return 'offline';

  if (input.deviceStatus === 'fault' || input.deviceStatus === 'maintenance') {
    return 'fault';
  }

  if (input.deviceStatus === 'offline') return 'offline';

  if (input.batteryPct != null && input.batteryPct <= 5) return 'fault';
  if (input.temperatureC != null && input.temperatureC >= 75) return 'fault';

  if (input.updatedAt) {
    const ageMs = Date.now() - new Date(input.updatedAt).getTime();
    if (!Number.isNaN(ageMs) && ageMs > STALE_THRESHOLD_MS) return 'stale';
  }

  return 'live';
}

export function formatLastSeen(updatedAt: string): string {
  const parsed = new Date(updatedAt);
  if (Number.isNaN(parsed.getTime())) return 'unknown';
  return formatDistanceToNowStrict(parsed, { addSuffix: true });
}

export function statusMessage(status: SiteConnectionStatus, updatedAt?: string | null): string {
  switch (status) {
    case 'live':
      return 'Live telemetry';
    case 'offline':
      return updatedAt ? `Last seen ${formatLastSeen(updatedAt)}` : 'Site offline';
    case 'stale':
      return updatedAt ? `Stale data · last seen ${formatLastSeen(updatedAt)}` : 'Data may be stale';
    case 'fault':
      return 'Inverter fault — check alerts';
    default:
      return 'Status unknown';
  }
}

export function statusAccessibilityLabel(
  status: SiteConnectionStatus,
  siteName: string,
  updatedAt?: string | null,
): string {
  return `${siteName}: ${statusMessage(status, updatedAt)}`;
}

export function isLiveConnection(status: SiteConnectionStatus): boolean {
  return status === 'live';
}

export function showStaleBorder(status: SiteConnectionStatus): boolean {
  return status === 'stale';
}
