import type { TelemetryPoint } from '@/stores/telemetryStore';

/** Diesel displacement economics — documented constants for savings estimates. */
export const DIESEL_NAIRA_PER_LITER = 1180;
export const GENERATOR_KWH_PER_LITER = 3.6;
export const DIESEL_LITERS_PER_KW_HOUR = 0.28;

export const NGN_PER_KWH_DISPLACED = DIESEL_NAIRA_PER_LITER / GENERATOR_KWH_PER_LITER;

export type MonitoringKpiSnapshot = {
  dailySavings: number;
  monthToDate: number;
  dieselAvoidedLiters: number;
  solarSharePct: number;
  vsSevenDayAvgPct: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function averageLoadKw(history: TelemetryPoint[]): number {
  const loads = history.map((p) => p.load_kw).filter((v) => Number.isFinite(v) && v > 0);
  if (loads.length === 0) return 0;
  return loads.reduce((sum, v) => sum + v, 0) / loads.length;
}

/** Estimated daily savings from instantaneous solar output (kW × 24h × ₦/kWh displaced). */
export function computeDailySavings(powerKw: number, live = true): number {
  if (!live || powerKw <= 0) return 0;
  return Math.round(powerKw * 24 * NGN_PER_KWH_DISPLACED);
}

export function computeMonitoringKpis(input: {
  live: boolean;
  powerKw: number;
  loadKw: number;
  history?: TelemetryPoint[];
}): MonitoringKpiSnapshot {
  const { live, powerKw, loadKw } = input;
  const history = input.history ?? [];

  if (!live) {
    return {
      dailySavings: 0,
      monthToDate: 0,
      dieselAvoidedLiters: 0,
      solarSharePct: 0,
      vsSevenDayAvgPct: 0,
    };
  }

  const dailySavings = computeDailySavings(powerKw, true);
  const dayOfMonth = new Date().getDate();
  const monthToDate = Math.round(dailySavings * dayOfMonth);

  const dieselDrawKw = Math.max(0, loadKw - powerKw * 0.92);
  const dieselAvoidedLiters = Math.round(dieselDrawKw * DIESEL_LITERS_PER_KW_HOUR * 24);

  const solarSharePct =
    loadKw > 0 ? clamp(Math.round((powerKw / loadKw) * 100), 0, 100) : powerKw > 0 ? 100 : 0;

  const avgLoad = averageLoadKw(history);
  const vsSevenDayAvgPct =
    avgLoad > 0 ? clamp(Math.round((1 - loadKw / avgLoad) * 100), -100, 100) : 0;

  return {
    dailySavings,
    monthToDate,
    dieselAvoidedLiters,
    solarSharePct,
    vsSevenDayAvgPct,
  };
}
