/**
 * Data layer ported from web dashboard — same Supabase queries.
 */
import { supabase, supabaseConfigured } from './supabase';

export type Facility = {
  id: string;
  client_id: string;
  facility_name: string;
  location_state: string;
  status: string;
};

export type PowerLog = {
  id: number;
  facility_id: string;
  solar_generation_kw: number;
  load_consumption_kw: number;
  battery_percentage: number;
  battery_temperature_c: number;
  grid_status: string;
  diesel_saved_naira: number;
  logged_at: string;
};

export type BranchRow = {
  id: string;
  name: string;
  city: string;
  source: 'solar' | 'grid' | 'diesel' | 'offline' | 'warning';
  load: number;
  battery: number;
  uptime: number;
};

/** Unified fleet row type — same shape as BranchRow for list/map components. */
export type SiteFleetRow = BranchRow;

function gridToSource(grid: string): BranchRow['source'] {
  const g = grid?.toLowerCase() ?? '';
  if (g === 'offline' || g === 'fault') return 'offline';
  if (g === 'diesel' || g === 'generator') return 'diesel';
  if (g === 'grid' || g === 'stable' || g === 'online') return 'grid';
  return 'solar';
}

export async function fetchFacilities(): Promise<Facility[]> {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase
    .from('branches')
    .select('id, company_id, name, location_state, status')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((b) => ({
    id: b.id,
    client_id: b.company_id ?? '',
    facility_name: b.name,
    location_state: b.location_state ?? '',
    status: b.status ?? 'online',
  }));
}

export async function fetchBranchRows(): Promise<BranchRow[]> {
  console.warn('[aura] fetchBranchRows is deprecated — use useSitesFleet instead.');
  if (!supabaseConfigured) return [];
  return [];
}

export async function fetchLatestPowerLogs(): Promise<
  Array<{ facility: Facility; log: PowerLog | null }>
> {
  if (!supabaseConfigured) return [];
  const facilities = await fetchFacilities();
  if (facilities.length === 0) return [];
  const ids = facilities.map((f) => f.id);
  const { data, error } = await supabase
    .from('energy_metrics')
    .select(
      'id, branch_id, solar_generation_kw, load_consumption_kw, battery_percentage, battery_temperature_c, grid_status, diesel_saved_naira, logged_at',
    )
    .in('branch_id', ids)
    .order('logged_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  const latest = new Map<string, PowerLog>();
  for (const row of (data ?? []) as Array<{
    id: number;
    branch_id: string;
    solar_generation_kw: number;
    load_consumption_kw: number;
    battery_percentage: number;
    battery_temperature_c: number;
    grid_status: string;
    diesel_saved_naira: number;
    logged_at: string;
  }>) {
    if (!latest.has(row.branch_id)) {
      latest.set(row.branch_id, {
        id: row.id,
        facility_id: row.branch_id,
        solar_generation_kw: Number(row.solar_generation_kw),
        load_consumption_kw: Number(row.load_consumption_kw),
        battery_percentage: row.battery_percentage,
        battery_temperature_c: Number(row.battery_temperature_c),
        grid_status: row.grid_status,
        diesel_saved_naira: Number(row.diesel_saved_naira),
        logged_at: row.logged_at,
      });
    }
  }
  return facilities.map((facility) => ({
    facility,
    log: latest.get(facility.id) ?? null,
  }));
}

export async function fetchDailyOffsetNaira(): Promise<number> {
  if (!supabaseConfigured) return 0;
  const facilities = await fetchFacilities();
  const ids = facilities.map((f) => f.id);
  if (ids.length === 0) return 0;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('energy_metrics')
    .select('diesel_saved_naira')
    .in('branch_id', ids)
    .gte('logged_at', since);
  if (error) throw error;
  return (data ?? []).reduce((acc, r) => acc + Number(r.diesel_saved_naira ?? 0), 0);
}

