import { useEffect, useMemo, useRef, useState } from "react";

function cubicEaseOut(t: number): number {
  const x = 1 - t;
  return 1 - x * x * x;
}

export function useInterpolatedSeries<T extends Record<string, number>>(
  target: T[],
  durationMs = 2500,
): T[] {
  const [frame, setFrame] = useState<T[]>(target);
  const prevRef = useRef<T[]>(target);

  useEffect(() => {
    if (!target.length) {
      setFrame(target);
      prevRef.current = target;
      return;
    }

    const start = Date.now();
    const prev = prevRef.current.length === target.length ? prevRef.current : target;
    let raf = 0;

    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / durationMs);
      const e = cubicEaseOut(t);
      const next = target.map((row, i) => {
        const out: Record<string, number> = {};
        const p = prev[i] ?? row;
        for (const k of Object.keys(row)) {
          const rk = k as keyof T;
          const rv = row[rk];
          const pv = p[rk];
          out[k] = typeof rv === "number" && typeof pv === "number" ? pv + (rv - pv) * e : (rv as number);
        }
        return out as T;
      });
      setFrame(next);
      if (t < 1) raf = requestAnimationFrame(tick);
      else prevRef.current = target;
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return frame;
}

export function useMicroFluctuation(
  baseline: number,
  opts?: { minPct?: number; maxPct?: number; intervalMs?: number },
): number {
  const { minPct = 0.005, maxPct = 0.01, intervalMs = 3500 } = opts ?? {};
  const [value, setValue] = useState(baseline);
  const baseRef = useRef(baseline);

  useEffect(() => {
    baseRef.current = baseline;
    setValue(baseline);
  }, [baseline]);

  useEffect(() => {
    const timer = setInterval(() => {
      const base = baseRef.current;
      const amp = base * (minPct + Math.random() * (maxPct - minPct));
      const sign = Math.random() > 0.5 ? 1 : -1;
      setValue(base + sign * amp);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, maxPct, minPct]);

  return value;
}

export function useSyncStatus(lastSyncAt: string | null, intervalMs = 300_000): {
  label: string;
  syncingSoon: boolean;
  msToNextSync: number;
} {
  const [, setNowTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setNowTick((v) => v + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return useMemo(() => {
    if (!lastSyncAt) {
      return { label: "Syncing fresh telemetry...", syncingSoon: true, msToNextSync: 0 };
    }
    const last = new Date(lastSyncAt).getTime();
    if (Number.isNaN(last)) return { label: "Syncing fresh telemetry...", syncingSoon: true, msToNextSync: 0 };

    const elapsed = Date.now() - last;
    const msToNextSync = Math.max(0, intervalMs - elapsed);
    const syncingSoon = msToNextSync <= 10_000;
    if (syncingSoon) {
      return { label: "Syncing fresh telemetry...", syncingSoon: true, msToNextSync };
    }
    if (elapsed < 10_000) return { label: "just now", syncingSoon: false, msToNextSync };
    if (elapsed < 60_000) return { label: `${Math.floor(elapsed / 1000)}s ago`, syncingSoon: false, msToNextSync };
    return { label: `${Math.floor(elapsed / 60_000)}m ago`, syncingSoon: false, msToNextSync };
  }, [intervalMs, lastSyncAt]);
}
