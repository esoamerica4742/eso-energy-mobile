/**
 * Enode API types — mirrored from BFF responses (not raw Enode payloads).
 */

export type EnodeConnectionStatus = 'connected' | 'syncing' | 'error' | 'offline';

export type EnodeLinkStatus = 'pending' | 'linked' | 'error' | 'disconnected';

export type EnodeDeviceType =
  | 'inverter'
  | 'charger'
  | 'battery'
  | 'vehicle'
  | 'hvac'
  | 'meter'
  | 'unknown';

export type EnodeDevice = {
  id: string;
  company_id: string;
  enode_device_id: string;
  enode_user_id: string;
  device_type: EnodeDeviceType;
  vendor: string | null;
  display_name: string | null;
  is_reachable: boolean;
  connection_status: EnodeConnectionStatus;
  production_rate_kw: number | null;
  charge_rate_kw: number | null;
  battery_level_pct: number | null;
  grid_power_kw: number | null;
  raw_state: Record<string, unknown>;
  last_seen_at: string | null;
  branch_id: string | null;
  created_at: string;
  updated_at: string;
};

export type EnodeConnection = {
  id: string;
  company_id: string;
  enode_user_id: string;
  link_status: EnodeLinkStatus;
  last_link_url: string | null;
  linked_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};

export type EnodeLinkSessionResponse = {
  linkUrl: string;
  linkToken: string;
  enodeUserId: string;
  redirectUri: string;
};

export type EnodeDevicesResponse = {
  devices: EnodeDevice[];
};

export type EnodeDeviceResponse = {
  device: EnodeDevice;
  warning?: string;
};

export type EnodeTelemetryPoint = {
  production_kw: number;
  charge_kw: number;
  grid_kw: number;
  recorded_at: string;
};

export type EnodeTelemetryResponse = {
  points: EnodeTelemetryPoint[];
};

export type EnodeTelemetryLatestPoint = {
  device_id: string;
  site_id: string | null;
  solar_output_kw: number;
  load_draw_kw: number;
  battery_soc_percent: number | null;
  inverter_status: string | null;
  grid_status: string | null;
  fault_code: string | null;
  warning_code: string | null;
  system_timestamp: string;
  updated_at: string;
};

export type EnodeTelemetryLatestResponse = {
  points: EnodeTelemetryLatestPoint[];
};

export type EnodeSiteSummary = {
  tenant_id: string;
  site_id: string;
  device_count: number;
  online_count: number;
  fault_count: number;
  total_solar_kw: number;
  total_load_kw: number;
  avg_battery_soc: number | null;
  stale_device_count: number;
  updated_at: string;
};

export type EnodeSiteSummaryResponse = {
  summary: EnodeSiteSummary | null;
};

export type EnodeConnectionResponse = {
  connection: EnodeConnection | null;
};

export type EnodeApiErrorBody = {
  error: string;
};

export type PushTokenRegisterRequest = {
  expoPushToken: string;
  platform: string;
  appVersion: string;
};

export type EnodeRealtimePayload = {
  eventType: 'device' | 'event';
  device?: EnodeDevice;
  eventTypeName?: string;
};
