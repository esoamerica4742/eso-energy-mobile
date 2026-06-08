import { buildContractorAuditSnapshot } from '@/lib/contractorAuditData';
import type { TelemetryPoint } from '@/stores/telemetryStore';

function point(partial: Partial<TelemetryPoint> & Pick<TelemetryPoint, 'load_kw'>): TelemetryPoint {
  return {
    id: 'p',
    device_id: 'd1',
    voltage: 48,
    current: 10,
    power_kw: 120,
    battery_pct: 70,
    temperature_c: 38,
    timestamp: new Date().toISOString(),
    ...partial,
  };
}

describe('contractorAuditData', () => {
  it('builds passed audit for healthy live site', () => {
    const snapshot = buildContractorAuditSnapshot({
      live: true,
      siteId: 'site-1',
      siteName: 'Lagos HQ',
      loadKw: 420,
      powerKw: 312,
      deviceCount: 2,
      alertCount: 0,
      history: [
        point({ load_kw: 410, timestamp: new Date().toISOString() }),
        point({ load_kw: 425, timestamp: new Date().toISOString() }),
      ],
    });

    expect(snapshot.status).toBe('passed');
    expect(snapshot.complianceScore).toBeGreaterThanOrEqual(88);
    expect(snapshot.contractorName).toBe('Lagos HQ Ops');
    expect(snapshot.costVarianceLabel).toContain('₦');
  });

  it('flags audit when alerts and low sla stack', () => {
    const staleTs = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const snapshot = buildContractorAuditSnapshot({
      live: true,
      siteId: 'site-2',
      loadKw: 0,
      powerKw: 0,
      deviceCount: 0,
      alertCount: 4,
      history: [point({ load_kw: 0, timestamp: staleTs })],
    });

    expect(snapshot.openFindings).toBe(4);
    expect(snapshot.status).toBe('flagged');
  });

  it('pauses audit when telemetry is offline', () => {
    const snapshot = buildContractorAuditSnapshot({
      live: false,
      siteName: 'Abuja Campus',
      deviceCount: 1,
      alertCount: 1,
    });

    expect(snapshot.enabled).toBe(false);
    expect(snapshot.statusLabel).toBe('STANDBY');
    expect(snapshot.recommendation).toContain('paused');
  });
});
