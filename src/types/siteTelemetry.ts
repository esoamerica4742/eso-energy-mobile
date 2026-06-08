/** Canonical API contract for site-level telemetry (mobile + BFF). */
export type SiteConnectionStatus = 'live' | 'offline' | 'stale' | 'fault';

export interface SiteTelemetry {
  siteId: string;
  load_kw: number;
  battery_pct: number;
  power_kw: number;
  temperature_c?: number;
  status: SiteConnectionStatus;
  updated_at: string;
}

export type DeviceLinkStatus = 'online' | 'offline' | 'fault' | 'maintenance';

export interface DashboardTelemetryInput {
  siteId?: string;
  load_kw?: number;
  battery_pct?: number;
  power_kw?: number;
  temperature_c?: number;
  timestamp?: string;
  deviceStatus?: DeviceLinkStatus;
}
