import type { DashboardData } from '@/types/dashboard';
import {
  formatRelativeSyncLabel,
  resolveSyncDotTone,
  type MonitorConnectionPresentation,
  type SyncDotTone,
} from '@/lib/monitor/connectionStatus';

export type DashboardCommandSnapshot = {
  siteName: string;
  tierLabel: string;
  statusLabel: string;
  statusTone: 'live' | 'degraded' | 'offline' | 'fault' | 'warning';
  batteryPct: number;
  loadLabel: string;
  solarOutputLabel: string;
  deviceCount: number;
  alertCount: number;
  lastSyncLabel: string;
  syncDotTone: SyncDotTone;
  isDemoMode: boolean;
};

function formatLoad(loadKw: number) {
  if (loadKw >= 1000) return `${(loadKw / 1000).toFixed(1)} MW`;
  return `${Math.round(loadKw)} kW`;
}

function toneFromConnection(connection: MonitorConnectionPresentation): DashboardCommandSnapshot['statusTone'] {
  if (connection.state === 'fault') return 'fault';
  if (connection.state === 'warning') return 'warning';
  if (connection.state === 'live') return 'live';
  if (connection.tone === 'offline') return 'offline';
  return 'degraded';
}

function statusMeta(status: DashboardData['health']['status']) {
  if (status === 'live') return { label: 'LIVE', tone: 'live' as const };
  if (status === 'stale') return { label: 'STALE', tone: 'degraded' as const };
  if (status === 'fault') return { label: 'FAULT', tone: 'fault' as const };
  return { label: 'OFFLINE', tone: 'offline' as const };
}

export function buildDashboardCommandSnapshot(input: {
  data: DashboardData;
  loadKw?: number | null;
  solarKw?: number | null;
  deviceCount: number;
  alertCount: number;
  connection?: MonitorConnectionPresentation;
  lastSyncAt?: string | null;
  isDemoMode?: boolean;
}): DashboardCommandSnapshot {
  const { data, deviceCount, alertCount } = input;
  const loadKw = input.loadKw ?? 0;
  const solarKw = input.solarKw ?? 0;
  const syncAt = input.lastSyncAt ?? data.health.updatedAt;
  const connection = input.connection;
  const meta = connection
    ? { label: connection.label, tone: toneFromConnection(connection) }
    : statusMeta(data.health.status);
  const metricsLive = meta.tone === 'live' || meta.tone === 'warning';

  return {
    siteName: data.site.name,
    tierLabel: data.site.tier,
    statusLabel: meta.label,
    statusTone: meta.tone,
    batteryPct: data.battery.soc,
    loadLabel: metricsLive ? formatLoad(loadKw) : '—',
    solarOutputLabel: metricsLive ? formatLoad(solarKw) : '—',
    deviceCount,
    alertCount,
    lastSyncLabel: formatRelativeSyncLabel(syncAt),
    syncDotTone: resolveSyncDotTone(syncAt),
    isDemoMode: input.isDemoMode ?? false,
  };
}
