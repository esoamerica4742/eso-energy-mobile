/**
 * Realtime telemetry hook.
 *
 * Flow:
 *   1. On mount: fetch last N readings to seed the store (hydration)
 *   2. Subscribe to Supabase realtime INSERT on telemetry table
 *   3. Throttle updates at 500ms per device so charts don't thrash
 *   4. On unmount: unsubscribe + clean up throttle timers
 *
 * Components read from telemetryStore directly via selectors —
 * they never subscribe to this hook, avoiding cascade re-renders.
 */
import { useCallback, useEffect, useRef } from 'react';
import { supabaseConfigured } from '@/lib/supabase';
import { useTelemetryStore, type TelemetryPoint } from '@/stores/telemetryStore';
import { fetchRecentTelemetry, subscribeToTelemetry } from '@/services/supabase/telemetry';

const THROTTLE_MS = 500;

export function useTelemetry(siteId: string | null) {
  // Use individual selectors — subscribing to the full store causes the Dashboard
  // to re-render on every telemetry push.
  const push           = useTelemetryStore((s) => s.push);
  const seed           = useTelemetryStore((s) => s.seed);
  const markSubscribed = useTelemetryStore((s) => s.markSubscribed);
  const throttleMap = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const isLiveTelemetryEnabled = supabaseConfigured;

  const handlePoint = useCallback(
    (point: TelemetryPoint) => {
      const key = point.device_id;
      // Throttle per device — skip if an update is already queued
      if (throttleMap.current[key]) return;
      throttleMap.current[key] = setTimeout(() => {
        delete throttleMap.current[key];
        push(point);
      }, THROTTLE_MS);
    },
    [push],
  );

  useEffect(() => {
    if (!siteId || !isLiveTelemetryEnabled) return;

    // ── Supabase mode ──────────────────────────────────────────────────────
    // Read subscribed imperatively — avoids React subscription to this field.
    if (useTelemetryStore.getState().subscribed[siteId]) return;

    let cancelled = false;

    // Hydrate with recent history
    fetchRecentTelemetry(siteId).then((points) => {
      if (!cancelled) seed(points);
    });

    // Subscribe to realtime
    const channel = subscribeToTelemetry(siteId, handlePoint);
    markSubscribed(siteId, true);

    return () => {
      cancelled = true;
      void channel.unsubscribe();
      Object.values(throttleMap.current).forEach(clearTimeout);
      throttleMap.current = {};
      markSubscribed(siteId, false);
    };
  }, [siteId, isLiveTelemetryEnabled, handlePoint, seed, markSubscribed]);
}
