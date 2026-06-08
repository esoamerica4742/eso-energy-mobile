import type { BranchRow } from '@/lib/aura';

export type FleetSite = BranchRow & {
  status: 'live' | 'degraded' | 'offline';
  inverterCount: number;
  onlineInverters: number;
  alerts: number;
  lastSeenAt?: string | null;
  lastSeenLabel?: string;
  latitude: number;
  longitude: number;
  sparklineTrend: number[];
};

export type FleetFilter = 'all' | 'live' | 'stale' | 'offline' | 'alerts';

export type FleetViewMode = 'list' | 'overview';

export type FleetSummary = {
  totalLoadKw: number;
  avgBatteryPct: number;
  healthySites: number;
  siteCount: number;
  activeAlerts: number;
  lastSyncedLabel: string;
};

/** @deprecated Use FleetSite */
export type FleetMapSite = FleetSite;
