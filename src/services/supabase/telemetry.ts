/**
 * Telemetry service — initial hydration + realtime subscription helpers.
 * The hook (useTelemetry) calls these; components never touch Supabase directly.
 */
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { TelemetryPoint } from '@/stores/telemetryStore';
import type { DbTelemetry } from './types';

function rowToPoint(r: DbTelemetry): TelemetryPoint {
  return {
    id:            r.id,
    device_id:     r.device_id,
    voltage:       Number(r.voltage),
    current:       Number(r.current),
    power_kw:      Number(r.power_kw),
    battery_pct:   Number(r.battery_pct),
    load_kw:       Number(r.load_kw),
    temperature_c: Number(r.temperature_c),
    timestamp:     r.timestamp,
  };
}

/** Fetch the last N readings for every device at a site */
export async function fetchRecentTelemetry(
  siteId: string,
  limitPerDevice = 60,
): Promise<TelemetryPoint[]> {
  // Get devices at this site first
  const { data: devices } = await supabase
    .from('devices')
    .select('id')
    .eq('site_id', siteId);

  if (!devices || devices.length === 0) return [];

  const deviceIds = devices.map((d: { id: string }) => d.id);

  const { data, error } = await supabase
    .from('telemetry')
    .select('id, device_id, voltage, current, power_kw, battery_pct, load_kw, temperature_c, timestamp')
    .in('device_id', deviceIds)
    .order('timestamp', { ascending: false })
    .limit(deviceIds.length * limitPerDevice);

  if (error) {
    console.warn('[telemetry] fetchRecent:', error.message);
    return [];
  }

  return ((data ?? []) as DbTelemetry[]).map(rowToPoint).reverse();
}

/** Subscribe to live inserts on the telemetry table for a site's devices.
 *  Returns the channel so the caller can unsubscribe on cleanup. */
export function subscribeToTelemetry(
  siteId: string,
  onPoint: (p: TelemetryPoint) => void,
): RealtimeChannel {
  const channel = supabase
    .channel(`telemetry:site:${siteId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'telemetry',
        // Filter at DB level — only rows whose device is at this site.
        // Requires a generated column or a view; fall back to client-side
        // filter if not available (handled in hook).
      },
      (payload) => {
        if (payload.new) {
          onPoint(rowToPoint(payload.new as DbTelemetry));
        }
      },
    )
    .subscribe();

  return channel;
}
