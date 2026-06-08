import { useEffect, useRef } from 'react';
import { useDemoModeActive } from '@/providers/DemoModeProvider';
import { DEMO_DEVICE_LAGOS_1 } from '@/lib/demoFleet';
import { DEMO_FAULT_INJECT_MS, TELEMETRY_DEMO_INTERVAL_MS } from '@/lib/monitor/telemetryConfig';
import { useAlertStore } from '@/stores/alertStore';
import { useTelemetryStore, type TelemetryPoint } from '@/stores/telemetryStore';

type Options = {
  siteId: string | null;
  primaryDeviceId: string | null;
  enabled?: boolean;
};

let demoTick = 0;
let faultInjected = false;

function synthPoint(deviceId: string, tick: number): TelemetryPoint {
  const phase = tick * 0.42;
  const power = 2.8 + Math.sin(phase) * 0.7 + (Math.random() - 0.5) * 0.08;
  const load = 0.85 + power * 0.22 + Math.sin(phase - 0.35) * 0.12;
  const battery = Math.max(
    42,
    Math.min(92, 75 - tick * 0.04 + Math.sin(phase * 0.6) * 6),
  );
  const temp = 28 + Math.sin(phase * 0.3) * 4 + load * 1.8;

  return {
    id: `demo-telemetry-${tick}`,
    device_id: deviceId,
    voltage: 230,
    current: load * 4.2,
    power_kw: Number(power.toFixed(2)),
    battery_pct: Number(battery.toFixed(1)),
    load_kw: Number(load.toFixed(2)),
    temperature_c: Number(temp.toFixed(1)),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Synthetic 7.5s telemetry for demo mode + optional fault alert after 90s.
 */
export function useDemoTelemetryEngine({ siteId, primaryDeviceId, enabled = true }: Options) {
  const isDemoMode = useDemoModeActive();
  const push = useTelemetryStore((s) => s.push);
  const prepend = useAlertStore((s) => s.prepend);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !isDemoMode || !siteId || !primaryDeviceId) return;

    startedAt.current = Date.now();
    if (!faultInjected) {
      const boot = Array.from({ length: 40 }, (_, i) =>
        synthPoint(primaryDeviceId, demoTick - (40 - i)),
      );
      useTelemetryStore.getState().seed(boot);
    }

    const interval = setInterval(() => {
      demoTick += 1;
      push(synthPoint(primaryDeviceId, demoTick));

      if (
        !faultInjected &&
        startedAt.current &&
        Date.now() - startedAt.current >= DEMO_FAULT_INJECT_MS
      ) {
        faultInjected = true;
        prepend({
          id: `demo-fault-${Date.now()}`,
          device_id: DEMO_DEVICE_LAGOS_1,
          site_id: siteId,
          severity: 'critical',
          message: 'Inverter fault detected on demo fleet',
          detail: 'Synthetic alert for operator training',
          timestamp: new Date().toISOString(),
          acknowledged: false,
        });
      }
    }, TELEMETRY_DEMO_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [enabled, isDemoMode, prepend, primaryDeviceId, push, siteId]);
}
