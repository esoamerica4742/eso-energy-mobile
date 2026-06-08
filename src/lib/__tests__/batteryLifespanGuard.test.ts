import type { TelemetryPoint } from '@/stores/telemetryStore';
import { buildBatteryLifespanGuard } from '@/lib/batteryLifespanGuard';

function point(partial: Partial<TelemetryPoint> & Pick<TelemetryPoint, 'battery_pct'>): TelemetryPoint {
  return {
    id: 'p',
    device_id: 'd1',
    voltage: 48,
    current: 10,
    power_kw: 120,
    load_kw: 140,
    temperature_c: 38,
    timestamp: new Date().toISOString(),
    ...partial,
  };
}

describe('batteryLifespanGuard', () => {
  it('returns optimal guard for healthy live telemetry', () => {
    const snapshot = buildBatteryLifespanGuard({
      live: true,
      socPct: 72,
      temperatureC: 36,
      deviceId: 'device-1',
      history: [
        point({ battery_pct: 74, temperature_c: 35 }),
        point({ battery_pct: 71, temperature_c: 36 }),
        point({ battery_pct: 69, temperature_c: 37 }),
      ],
    });

    expect(snapshot.status).toBe('optimal');
    expect(snapshot.healthScore).toBeGreaterThanOrEqual(85);
    expect(snapshot.remainingLifeLabel).toMatch(/yrs|mo/);
  });

  it('flags protect mode when deep cycles and low soc stack', () => {
    const snapshot = buildBatteryLifespanGuard({
      live: true,
      socPct: 8,
      temperatureC: 56,
      history: [
        point({ battery_pct: 42 }),
        point({ battery_pct: 12 }),
        point({ battery_pct: 38 }),
        point({ battery_pct: 11 }),
      ],
    });

    expect(snapshot.status).toBe('protect');
    expect(snapshot.deepCycleCount).toBeGreaterThan(0);
    expect(snapshot.recommendation).toContain('reserve');
  });

  it('pauses metrics when telemetry is not live', () => {
    const snapshot = buildBatteryLifespanGuard({
      live: false,
      socPct: 68,
      temperatureC: 40,
    });

    expect(snapshot.enabled).toBe(false);
    expect(snapshot.statusLabel).toBe('STANDBY');
    expect(snapshot.healthScore).toBe(0);
    expect(snapshot.recommendation).toContain('paused');
  });
});
