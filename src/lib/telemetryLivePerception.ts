import type { DashboardData } from '@/types/dashboard';
import type { TelemetryPoint } from '@/stores/telemetryStore';
import { STALE_THRESHOLD_MS } from '@/lib/telemetryStatus';
import { computeDailySavings } from '@/lib/mapDashboardData';

/** Backend ingest cadence — UI streams between these anchors. */
export const BACKEND_SYNC_INTERVAL_MS = STALE_THRESHOLD_MS;

/** Frontend refresh cadence for live chart stream points. */
export const FRONTEND_STREAM_TICK_MS = 2_000;

/** Slower cadence for KPI micro-fluctuation — keeps metrics lively without dashboard jank. */
export const PERCEIVED_METRICS_TICK_MS = 4_000;

const DEFAULT_FLUCTUATION = 0.008;

export function microFluctuate(value: number, amplitudePct = DEFAULT_FLUCTUATION): number {
  if (!Number.isFinite(value)) return value;
  const amp = Math.max(Math.abs(value) * amplitudePct, 0.01);
  return value + (Math.random() - 0.5) * 2 * amp;
}

export function buildPerceivedTelemetryPoint(anchor: TelemetryPoint): TelemetryPoint {
  return {
    ...anchor,
    power_kw: Number(microFluctuate(anchor.power_kw).toFixed(2)),
    load_kw: Number(microFluctuate(anchor.load_kw).toFixed(1)),
    battery_pct: Math.round(anchor.battery_pct),
    temperature_c:
      anchor.temperature_c == null
        ? anchor.temperature_c
        : Number(microFluctuate(anchor.temperature_c, 0.004).toFixed(1)),
  };
}

export function canStreamFrontendLive(
  anchorUpdatedAt: string | null | undefined,
  healthStatus: DashboardData['health']['status'],
): boolean {
  if (healthStatus === 'offline' || healthStatus === 'fault') return false;
  if (!anchorUpdatedAt) return false;
  const ageMs = Date.now() - new Date(anchorUpdatedAt).getTime();
  if (Number.isNaN(ageMs)) return false;
  return ageMs <= BACKEND_SYNC_INTERVAL_MS;
}

export function formatSyncAge(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return 'awaiting sync';
  const age = now - new Date(iso).getTime();
  if (Number.isNaN(age) || age < 0) return 'awaiting sync';
  if (age < 10_000) return 'synced just now';
  if (age < 60_000) return `synced ${Math.floor(age / 1000)}s ago`;
  return `synced ${Math.floor(age / 60_000)}m ago`;
}

export function formatLiveStreamMeta(
  anchorUpdatedAt: string | null | undefined,
  streaming: boolean,
  now = Date.now(),
): string {
  if (!streaming) return 'stream paused';
  return `live stream · ${formatSyncAge(anchorUpdatedAt, now)}`;
}

export function applyLiveDisplayMetrics(
  data: DashboardData,
  perceived: TelemetryPoint | null | undefined,
  streaming: boolean,
): DashboardData {
  if (!streaming || !perceived) return data;

  const soc = Math.round(perceived.battery_pct);
  const powerKw = perceived.power_kw;
  const loadKw = perceived.load_kw;
  const dailySavings = computeDailySavings(powerKw);
  const monthToDate = Math.round(dailySavings * 27.2);
  const dieselAvoided = Math.round(soc * 4.48);
  const solarShare = Math.max(0, Math.min(100, Math.round(soc * 0.95)));
  const vsAvg = Math.max(0, Math.min(100, loadKw * 0.9));

  return {
    ...data,
    battery: {
      ...data.battery,
      soc,
      statusLabel: soc >= 20 ? 'Active' : 'Standby',
    },
    kpi: {
      ...data.kpi,
      primaryValue: dailySavings,
      delta: vsAvg,
      subMetrics: data.kpi.subMetrics.map((metric) => {
        if (metric.label === 'MTD') return { ...metric, rawValue: monthToDate };
        if (metric.label === 'DIESEL AVOIDED') return { ...metric, rawValue: dieselAvoided };
        if (metric.label === 'SOLAR SHARE') return { ...metric, rawValue: solarShare };
        return metric;
      }),
    },
  };
}

export function toChartKw(value: number): number {
  return Number((value / 100).toFixed(3));
}

export function toChartBattery(value: number): number {
  return Number(((value / 100) * 0.05).toFixed(4));
}

export function perceivedChartValue(seriesId: string, currentValue: number): number {
  if (seriesId === 'power') return toChartKw(microFluctuate(currentValue));
  if (seriesId === 'load') return toChartKw(microFluctuate(currentValue));
  if (seriesId === 'battery') return toChartBattery(currentValue);
  return currentValue;
}

export function perceivedLegendValue(seriesId: string, currentValue: number): number {
  if (seriesId === 'power') return Number(microFluctuate(currentValue).toFixed(2));
  if (seriesId === 'load') return Number(microFluctuate(currentValue).toFixed(1));
  if (seriesId === 'battery') return Math.round(currentValue);
  return currentValue;
}
