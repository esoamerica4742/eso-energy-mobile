import { buildDieselFraudAuditHub } from '@/lib/dieselFraudAuditData';
import type { TelemetryPoint } from '@/stores/telemetryStore';

function point(partial: Partial<TelemetryPoint> & Pick<TelemetryPoint, 'load_kw'>): TelemetryPoint {
  return {
    id: 'p',
    device_id: 'd1',
    voltage: 48,
    current: 10,
    power_kw: 280,
    battery_pct: 70,
    temperature_c: 38,
    timestamp: new Date().toISOString(),
    ...partial,
  };
}

describe('dieselFraudAuditData', () => {
  it('returns clear audit when solar offset reconciles', () => {
    const snapshot = buildDieselFraudAuditHub({
      live: true,
      siteId: 'site-1',
      loadKw: 320,
      powerKw: 280,
      dieselAvoidedLiters: 230,
      alertCount: 0,
      history: [
        point({ load_kw: 310, power_kw: 275 }),
        point({ load_kw: 325, power_kw: 285 }),
      ],
    });

    expect(snapshot.status).toBe('clear');
    expect(snapshot.integrityScore).toBeGreaterThanOrEqual(88);
    expect(snapshot.exposureLabel).toContain('₦');
  });

  it('flags audit when variance and anomalies stack', () => {
    const snapshot = buildDieselFraudAuditHub({
      live: true,
      loadKw: 520,
      powerKw: 40,
      dieselAvoidedLiters: 20,
      alertCount: 3,
      history: [
        point({ load_kw: 220, power_kw: 210 }),
        point({ load_kw: 520, power_kw: 42 }),
      ],
    });

    expect(snapshot.status).toBe('flagged');
    expect(snapshot.anomalyCount).toBeGreaterThan(0);
    expect(snapshot.recommendation).toContain('mismatch');
  });

  it('pauses audit hub when offline', () => {
    const snapshot = buildDieselFraudAuditHub({
      live: false,
      loadKw: 300,
      powerKw: 250,
    });

    expect(snapshot.enabled).toBe(false);
    expect(snapshot.statusLabel).toBe('STANDBY');
    expect(snapshot.recommendation).toContain('paused');
  });
});
