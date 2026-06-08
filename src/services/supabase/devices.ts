/**
 * Device queries — always scoped by company_id + site_id (RLS enforced at DB).
 */
import { supabase } from '@/lib/supabase';
import type { DbDevice } from './types';

export async function fetchDevices(siteId: string, companyId: string): Promise<DbDevice[]> {
  const { data, error } = await supabase
    .from('devices')
    .select('id, site_id, company_id, name, type, status, model, serial, installed_at, metadata')
    .eq('site_id', siteId)
    .eq('company_id', companyId)
    .order('name');

  if (error) {
    console.warn('[devices] fetchDevices:', error.message);
    return [];
  }
  return (data ?? []) as DbDevice[];
}

export async function fetchDevice(deviceId: string): Promise<DbDevice | null> {
  const { data, error } = await supabase
    .from('devices')
    .select('id, site_id, company_id, name, type, status, model, serial, installed_at, metadata')
    .eq('id', deviceId)
    .single();

  if (error) return null;
  return data as DbDevice;
}

/** Calculate a deterministic health score (0–100) from latest telemetry data. */
export function calcHealthScore(opts: {
  status: DbDevice['status'];
  battery_pct: number;
  temperature_c: number;
  load_kw: number;
  rated_load_kw?: number;
}): number {
  if (opts.status === 'offline') return 0;
  if (opts.status === 'fault') return 15;

  let score = 100;

  // Battery penalty
  if (opts.battery_pct < 10) score -= 35;
  else if (opts.battery_pct < 25) score -= 20;
  else if (opts.battery_pct < 40) score -= 8;

  // Temperature penalty
  if (opts.temperature_c > 65) score -= 25;
  else if (opts.temperature_c > 55) score -= 12;
  else if (opts.temperature_c > 45) score -= 4;

  // Overload penalty
  const maxLoad = opts.rated_load_kw ?? 10;
  const loadRatio = opts.load_kw / maxLoad;
  if (loadRatio > 1.1) score -= 20;
  else if (loadRatio > 0.95) score -= 8;

  return Math.max(0, Math.min(100, Math.round(score)));
}
