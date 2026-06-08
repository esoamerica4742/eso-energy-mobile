import { buildDashboardData } from '@/lib/mapDashboardData';
import { buildDashboardCommandSnapshot } from '@/lib/dashboardCommandData';
import { mockDashboard } from '@/data/mockDashboard';

describe('dashboardCommandData', () => {
  it('builds command snapshot from dashboard data', () => {
    const data = buildDashboardData(
      'Lagos Plant',
      {
        siteId: 'site-1',
        load_kw: 420.5,
        battery_pct: 68,
        power_kw: 312.4,
        temperature_c: 42,
        timestamp: new Date().toISOString(),
        deviceStatus: 'online',
      },
      { hasDevice: true },
    );

    const snapshot = buildDashboardCommandSnapshot({
      data,
      loadKw: 420.5,
      solarKw: 312.4,
      deviceCount: 2,
      alertCount: 3,
    });

    expect(snapshot.siteName).toBe('Lagos Plant');
    expect(snapshot.statusLabel).toBe('LIVE');
    expect(snapshot.batteryPct).toBe(68);
    expect(snapshot.loadLabel).toBe('421 kW');
    expect(snapshot.solarOutputLabel).toBe('312 kW');
    expect(snapshot.alertCount).toBe(3);
  });

  it('shows offline status when telemetry is unavailable', () => {
    const snapshot = buildDashboardCommandSnapshot({
      data: {
        ...mockDashboard,
        health: {
          ...mockDashboard.health,
          status: 'offline',
          message: 'No device connected',
          updatedAt: null,
        },
        battery: { ...mockDashboard.battery, soc: 0 },
        kpi: { ...mockDashboard.kpi, primaryValue: 0 },
      },
      deviceCount: 0,
      alertCount: 0,
    });

    expect(snapshot.statusLabel).toBe('OFFLINE');
    expect(snapshot.loadLabel).toBe('—');
    expect(snapshot.solarOutputLabel).toBe('—');
  });
});
