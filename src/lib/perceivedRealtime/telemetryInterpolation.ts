import type { TelemetryPoint } from '@/stores/telemetryStore';
import { microFluctuate } from '@/lib/telemetryLivePerception';

/** Interpolation window when reconciling backend anchors (ms). */
export const INTERPOLATION_MIN_MS = 15_000;
export const INTERPOLATION_MAX_MS = 45_000;

export type ScalarMetrics = {
  power_kw: number;
  load_kw: number;
  battery_pct: number;
  temperature_c: number | null;
};

export function telemetryToScalars(point: TelemetryPoint): ScalarMetrics {
  return {
    power_kw: point.power_kw,
    load_kw: point.load_kw,
    battery_pct: point.battery_pct,
    temperature_c: point.temperature_c ?? null,
  };
}

export function scalarsToTelemetry(base: TelemetryPoint, scalars: ScalarMetrics): TelemetryPoint {
  return {
    ...base,
    power_kw: Number(scalars.power_kw.toFixed(2)),
    load_kw: Number(scalars.load_kw.toFixed(1)),
    battery_pct: Math.round(scalars.battery_pct),
    temperature_c:
      scalars.temperature_c == null
        ? base.temperature_c
        : Number(scalars.temperature_c.toFixed(1)),
  };
}

function easeOutCubic(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - (1 - clamped) ** 3;
}

/** Duration scales with delta magnitude — large jumps glide longer. */
export function computeInterpolationDuration(from: ScalarMetrics, to: ScalarMetrics): number {
  const powerDelta = Math.abs(to.power_kw - from.power_kw);
  const loadDelta = Math.abs(to.load_kw - from.load_kw);
  const maxDelta = Math.max(powerDelta, loadDelta);
  const ref = Math.max(from.power_kw, from.load_kw, to.power_kw, to.load_kw, 50);
  const ratio = Math.min(1, maxDelta / ref);
  return Math.round(INTERPOLATION_MIN_MS + ratio * (INTERPOLATION_MAX_MS - INTERPOLATION_MIN_MS));
}

export function interpolateScalars(
  from: ScalarMetrics,
  to: ScalarMetrics,
  progress: number,
): ScalarMetrics {
  const t = easeOutCubic(progress);
  return {
    power_kw: from.power_kw + (to.power_kw - from.power_kw) * t,
    load_kw: from.load_kw + (to.load_kw - from.load_kw) * t,
    battery_pct: from.battery_pct + (to.battery_pct - from.battery_pct) * t,
    temperature_c:
      from.temperature_c == null || to.temperature_c == null
        ? to.temperature_c ?? from.temperature_c
        : from.temperature_c + (to.temperature_c - from.temperature_c) * t,
  };
}

/** After interpolation completes, apply subtle ±1–3% micro-variation. */
export function applyMicroVariation(scalars: ScalarMetrics): ScalarMetrics {
  return {
    power_kw: Number(microFluctuate(scalars.power_kw, 0.012).toFixed(2)),
    load_kw: Number(microFluctuate(scalars.load_kw, 0.012).toFixed(1)),
    battery_pct: Math.round(microFluctuate(scalars.battery_pct, 0.003)),
    temperature_c:
      scalars.temperature_c == null
        ? null
        : Number(microFluctuate(scalars.temperature_c, 0.004).toFixed(1)),
  };
}

export function scalarsEqual(a: ScalarMetrics, b: ScalarMetrics, epsilon = 0.02): boolean {
  return (
    Math.abs(a.power_kw - b.power_kw) < epsilon &&
    Math.abs(a.load_kw - b.load_kw) < epsilon &&
    a.battery_pct === b.battery_pct &&
    Math.abs((a.temperature_c ?? 0) - (b.temperature_c ?? 0)) < 0.05
  );
}
