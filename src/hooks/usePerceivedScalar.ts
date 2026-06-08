import { useEffect, useRef, useState } from 'react';
import { INTERPOLATION_MAX_MS, INTERPOLATION_MIN_MS } from '@/lib/perceivedRealtime';
import { microFluctuate, PERCEIVED_METRICS_TICK_MS } from '@/lib/telemetryLivePerception';

const INTERP_TICK_MS = 500;

function easeOutCubic(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - (1 - clamped) ** 3;
}

function computeScalarDuration(from: number, to: number): number {
  const maxDelta = Math.abs(to - from);
  const ref = Math.max(Math.abs(from), Math.abs(to), 50);
  const ratio = Math.min(1, maxDelta / ref);
  return Math.round(INTERPOLATION_MIN_MS + ratio * (INTERPOLATION_MAX_MS - INTERPOLATION_MIN_MS));
}

/** Glides a single scalar 15–45s between backend anchors, then micro-varies. */
export function usePerceivedScalar(anchor: number, streaming: boolean, smooth = true): number {
  const [display, setDisplay] = useState(anchor);
  const displayRef = useRef(anchor);
  const anchorRef = useRef(anchor);
  const interpRef = useRef<{
    from: number;
    to: number;
    startedAt: number;
    durationMs: number;
  } | null>(null);
  const settledRef = useRef(true);

  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  useEffect(() => {
    anchorRef.current = anchor;
    if (Math.abs(displayRef.current - anchor) < 0.05) {
      setDisplay(anchor);
      displayRef.current = anchor;
      settledRef.current = true;
      return;
    }

    interpRef.current = {
      from: displayRef.current,
      to: anchor,
      startedAt: Date.now(),
      durationMs: computeScalarDuration(displayRef.current, anchor),
    };
    settledRef.current = false;
  }, [anchor]);

  useEffect(() => {
    if (!streaming || !smooth) {
      setDisplay(anchor);
      return;
    }

    const tick = (micro: boolean) => {
      const state = interpRef.current;
      if (!state || settledRef.current) {
        if (!micro) return;
        const next = microFluctuate(anchorRef.current, 0.012);
        setDisplay((prev) => (Math.abs(prev - next) < 0.015 ? prev : next));
        return;
      }

      const elapsed = Date.now() - state.startedAt;
      const progress = Math.min(1, elapsed / state.durationMs);
      const next = state.from + (state.to - state.from) * easeOutCubic(progress);
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
  }, [anchor, smooth, streaming]);

  return display;
}
