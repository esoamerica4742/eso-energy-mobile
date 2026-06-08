import { buildThermalLoadStressAlert } from '@/lib/thermalLoadStressAlert';
import type { TelemetryPoint } from '@/stores/telemetryStore';

function point(partial: Partial<TelemetryPoint> & Pick<TelemetryPoint, 'load_kw'>): TelemetryPoint {
  return {
    id: 'p',
    device_id: 'd1',
    voltage: 48,
    current: 10,
    power_kw: 300,
    battery_pct: 70,
    temperature_c: 38,
    timestamp: new Date().toISOString(),
    ...partial,
  };
}

describe('thermalLoadStressAlert', () => {
  it('returns clear status for normal thermal and load', () => {
    const snapshot = buildThermalLoadStressAlert({
      live: true,
      temperatureC: 25,
      loadKw: 40,
      powerKw: 380,
      deviceId: 'device-1',
      history: [
        point({ load_kw: 38, temperature_c: 24 }),
        point({ load_kw: 42, temperature_c: 26 }),
      ],
    });

    expect(snapshot.status).toBe('clear');
    expect(snapshot.safetyMargin).toBeGreaterThanOrEqual(85);
    expect(snapshot.activeAlerts).toBe(0);
  });

  it('raises alert for critical thermal and heavy load', () => {
    const snapshot = buildThermalLoadStressAlert({
      live: true,
      temperatureC: 58,
      loadKw: 520,
      powerKw: 300,
      history: [
        point({ load_kw: 510, temperature_c: 56 }),
        point({ load_kw: 520, temperature_c: 58 }),
      ],
    });

    expect(snapshot.status).toBe('alert');
    expect(snapshot.recommendation).toContain('thermal');
  });

  it('pauses when telemetry is offline', () => {
    const snapshot = buildThermalLoadStressAlert({
      live: false,
      temperatureC: 40,
      loadKw: 200,
    });

    expect(snapshot.enabled).toBe(false);
    expect(snapshot.statusLabel).toBe('STANDBY');
    expect(snapshot.recommendation).toContain('paused');
  });
});
