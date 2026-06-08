/**
 * Shared Supabase row types — mirror the DB schema exactly.
 * Use these everywhere; never write ad-hoc `any` casts.
 */

export interface DbUser {
  id: string;
  company_id: string;
  role: 'admin' | 'technician' | 'viewer';
  full_name: string | null;
  avatar_url: string | null;
}

export interface DbCompany {
  id: string;
  name: string;
  plan?: 'starter' | 'growth' | 'enterprise';
  created_at: string;
}

export interface DbSite {
  id: string;
  company_id: string;
  name: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  created_at: string;
}

export interface DbDevice {
  id: string;
  site_id: string;
  company_id: string;
  name: string;
  type: 'inverter' | 'battery' | 'solar_panel' | 'generator' | 'meter';
  status: 'online' | 'offline' | 'fault' | 'maintenance';
  model: string | null;
  serial: string | null;
  installed_at: string | null;
  metadata: Record<string, unknown> | null;
}

export interface DbTelemetry {
  id: string;
  device_id: string;
  voltage: number;
  current: number;
  power_kw: number;
  battery_pct: number;
  load_kw: number;
  temperature_c: number;
  timestamp: string;
}

export interface DbAlert {
  id: string;
  device_id: string;
  site_id: string;
  company_id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  detail: string | null;
  timestamp: string;
  acknowledged: boolean;
}

export interface DbAiInsight {
  id: string;
  device_id: string;
  company_id: string;
  type: 'anomaly' | 'predictive_failure' | 'optimization' | 'efficiency';
  score: number;       // 0-1 confidence
  message: string;
  recommendation: string | null;
  created_at: string;
  expires_at: string | null;
}
