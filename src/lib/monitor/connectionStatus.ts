import {
  TELEMETRY_OFFLINE_MS,
  TELEMETRY_STALE_MS,
} from '@/lib/monitor/telemetryConfig';
import type { DbDevice } from '@/services/supabase/types';

export type MonitorConnectionState =
  | 'live'
  | 'warning'
  | 'fault'
  | 'stale'
  | 'offline';

export type MonitorConnectionPresentation = {
  state: MonitorConnectionState;
  label: string;
  tone: 'live' | 'degraded' | 'offline' | 'fault';
};

export type SyncDotTone = 'live' | 'stale' | 'offline';

function ageMs(updatedAt: string | null | undefined): number | null {
  if (!updatedAt) return null;
  const t = new Date(updatedAt).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Date.now() - t);
}

export function resolveSyncDotTone(updatedAt: string | null | undefined): SyncDotTone {
  const age = ageMs(updatedAt);
  if (age == null) return 'offline';
  if (age > TELEMETRY_OFFLINE_MS) return 'offline';
  if (age > TELEMETRY_STALE_MS) return 'stale';
  return 'live';
}

export function formatRelativeSyncLabel(updatedAt: string | null | undefined): string {
  const age = ageMs(updatedAt);
  if (age == null) return 'Awaiting sync';
  if (age < 60) return `${age}s ago`;
  if (age < 3600) return `${Math.floor(age / 60)}m ago`;
  return `${Math.floor(age / 3600)}h ago`;
}

function deviceHasFault(device: DbDevice): boolean {
  return device.status === 'fault';
}

function deviceHasWarning(device: DbDevice): boolean {
  return device.status === 'maintenance';
}

export function resolveMonitorConnectionStatus(input: {
  devices: DbDevice[];
  lastTelemetryAt: string | null | undefined;
  streamPaused?: boolean;
}): MonitorConnectionPresentation {
  const { devices, lastTelemetryAt, streamPaused = false } = input;
  const age = ageMs(lastTelemetryAt);

  if (devices.some(deviceHasFault)) {
    return { state: 'fault', label: 'FAULT', tone: 'fault' };
  }

  if (devices.some(deviceHasWarning)) {
    return { state: 'warning', label: 'WARNING', tone: 'degraded' };
  }

  if (age == null || age > TELEMETRY_OFFLINE_MS) {
    return { state: 'offline', label: 'OFFLINE', tone: 'offline' };
  }

  if (streamPaused || age > TELEMETRY_STALE_MS) {
    return { state: 'stale', label: 'STALE', tone: 'degraded' };
  }

  return { state: 'live', label: 'LIVE', tone: 'live' };
}
