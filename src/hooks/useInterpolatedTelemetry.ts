import { useEffect, useMemo, useRef, useState } from 'react';
import type { TelemetryPoint } from '@/stores/telemetryStore';
import {
  applyMicroVariation,
  computeInterpolationDuration,
  interpolateScalars,
  scalarsEqual,
  scalarsToTelemetry,
  telemetryToScalars,
} from '@/lib/perceivedRealtime';
import { PERCEIVED_METRICS_TICK_MS } from '@/lib/telemetryLivePerception';

const INTERP_TICK_MS = 1_000;

function anchorKey(point: TelemetryPoint | null | undefined): string {
  if (!point) return 'none';
  return `${point.id}|${point.timestamp}|${point.power_kw}|${point.load_kw}|${point.battery_pct}`;
}

type InterpolationState = {
  from: ReturnType<typeof telemetryToScalars>;
  to: ReturnType<typeof telemetryToScalars>;
  startedAt: number;
  durationMs: number;
};

/** Glides 15–45s between backend anchors, then micro-varies until next sync. */
export function useInterpolatedTelemetry(
  anchor: TelemetryPoint | null | undefined,
  streaming: boolean,
  smooth = true,
) {
  const [display, setDisplay] = useState<TelemetryPoint | null>(anchor ?? null);
  const displayRef = useRef<TelemetryPoint | null>(anchor ?? null);
  const anchorRef = useRef(anchor);
  const interpRef = useRef<InterpolationState | null>(null);
  const settledRef = useRef(true);

  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  useEffect(() => {
    anchorRef.current = anchor;
    if (!anchor) {
      setDisplay(null);
      displayRef.current = null;
      interpRef.current = null;
      settledRef.current = true;
      return;
    }

    const currentScalars = displayRef.current
      ? telemetryToScalars(displayRef.current)
      : telemetryToScalars(anchor);
    const nextScalars = telemetryToScalars(anchor);

    if (scalarsEqual(currentScalars, nextScalars, 0.05)) {
      setDisplay(anchor);
      displayRef.current = anchor;
      settledRef.current = true;
      return;
    }

    interpRef.current = {
      from: currentScalars,
      to: nextScalars,
      startedAt: Date.now(),
      durationMs: computeInterpolationDuration(currentScalars, nextScalars),
    };
    settledRef.current = false;
  }, [anchorKey(anchor)]);

  useEffect(() => {
    if (!streaming || !smooth || !anchorRef.current) return;

    const tick = (micro: boolean) => {
      const base = anchorRef.current;
      if (!base) return;

      const state = interpRef.current;
      if (!state || settledRef.current) {
        if (!micro) return;
        const next = scalarsToTelemetry(base, applyMicroVariation(telemetryToScalars(base)));
        setDisplay((prev) => {
          if (!prev) return next;
          if (scalarsEqual(telemetryToScalars(prev), telemetryToScalars(next), 0.015)) return prev;
          return next;
        });
        return;
      }

      const elapsed = Date.now() - state.startedAt;
      const progress = Math.min(1, elapsed / state.durationMs);
      const next = scalarsToTelemetry(base, interpolateScalars(state.from, state.to, progress));
      setDisplay(next);

      if (progress >= 1) {
        settledRef.current = true;
        interpRef.current = null;
      }
    };

    const interpId = setInterval(() => tick(false), INTERP_TICK_MS);
    const microId = setInterval(() => tick(true), PERCEIVED_METRICS_TICK_MS);
    tick(false);
    return () => {
      clearInterval(interpId);
      clearInterval(microId);
    };
  }, [smooth, streaming, anchorKeyValue]);

  return display;
}
