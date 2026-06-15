/** @jest-environment node */
import { buildDashboardData, computeDailySavings } from '@/lib/mapDashboardData';
import { NGN_PER_KWH_DISPLACED } from '@/lib/monitoring/monitoringKpiEngine';
import { resolveSiteConnectionStatus, STALE_THRESHOLD_MS } from '@/lib/telemetryStatus';

describe('computeDailySavings', () => {
  it('returns rounded power * tariff when live', () => {
    expect(computeDailySavings(312.4)).toBe(Math.round(312.4 * 24 * NGN_PER_KWH_DISPLACED));
  });

  it('returns zero when not live', () => {
    expect(computeDailySavings(312.4, false)).toBe(0);
  });
});

describe('buildDashboardData', () => {
  it('maps live telemetry into KPI savings', () => {
    const data = buildDashboardData(
      'Lagos Plant',
      {
        siteId: 'LOS-01',
        load_kw: 649,
        battery_pct: 68,
        power_kw: 405.5,
        temperature_c: 42,
        timestamp: new Date().toISOString(),
        deviceStatus: 'online',
      },
      { hasDevice: true },
    );

    expect(data.site.name).toBe('Lagos Plant');
    expect(data.health.status).toBe('live');
    expect(data.kpi.primaryValue).toBe(Math.round(405.5 * 24 * NGN_PER_KWH_DISPLACED));
    expect(data.battery.soc).toBe(68);
  });

  it('returns offline health when no device is connected', () => {
    const data = buildDashboardData('Lagos Plant', null, { hasDevice: false });

    expect(data.health.status).toBe('offline');
    expect(data.kpi.primaryValue).toBe(0);
    expect(data.kpi.subMetrics.every((metric) => metric.valueColor === 'muted')).toBe(true);
  });

  it('marks telemetry as stale after threshold', () => {
    const staleAt = new Date(Date.now() - STALE_THRESHOLD_MS - 60_000).toISOString();
    const status = resolveSiteConnectionStatus({
      hasDevice: true,
      hasTelemetry: true,
      deviceStatus: 'online',
      updatedAt: staleAt,
    });

    expect(status).toBe('stale');

    const data = buildDashboardData(
      'Abuja Campus',
      {
        siteId: 'ABJ-01',
        load_kw: 120,
        battery_pct: 40,
        power_kw: 90,
        timestamp: staleAt,
        deviceStatus: 'online',
      },
      { hasDevice: true },
    );

    expect(data.health.status).toBe('stale');
    expect(data.health.showStaleBorder).toBe(true);
    expect(data.battery.statusLabel).toBe('Stale');
  });

  it('marks fault for critical battery and device fault status', () => {
    const data = buildDashboardData(
      'Lagos Plant',
      {
        siteId: 'LOS-01',
        load_kw: 649,
        battery_pct: 3,
        power_kw: 405.5,
        timestamp: new Date().toISOString(),
        deviceStatus: 'fault',
      },
      { hasDevice: true },
    );

    expect(data.health.status).toBe('fault');
    expect(data.nodes.every((node) => node.status === 'warning' || node.status === 'idle')).toBe(true);
  });
});
