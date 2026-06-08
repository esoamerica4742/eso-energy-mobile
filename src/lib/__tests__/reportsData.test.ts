import {
  buildReportExports,
  buildReportsSnapshot,
  periodLabel,
} from '@/lib/reportsData';
import type { FleetSite } from '@/types/fleet';

const branchRows = [
  {
    id: 's1',
    name: 'Lagos HQ',
    city: 'Lagos',
    source: 'solar' as const,
    load: 142,
    battery: 68,
    uptime: 99,
  },
];

const fleetSites: FleetSite[] = [
  {
    ...branchRows[0],
    status: 'live',
    inverterCount: 1,
    onlineInverters: 1,
    alerts: 0,
    latitude: 6.5,
    longitude: 3.3,
    sparklineTrend: [120, 130, 142],
  },
];

describe('reportsData', () => {
  it('builds snapshot for selected period', () => {
    const summary = {
      totalLoadKw: 142,
      avgBatteryPct: 68,
      healthySites: 1,
      siteCount: 1,
      activeAlerts: 0,
      lastSyncedLabel: '30s',
    };
    const snapshot = buildReportsSnapshot(branchRows, summary, '7d');
    expect(snapshot.performanceIndex).toBeGreaterThan(0);
    expect(snapshot.solarContributionPct).toBe(100);
    expect(periodLabel('30d')).toBe('Last 30 days');
  });

  it('builds export cards with hero metrics', () => {
    const summary = {
      totalLoadKw: 142,
      avgBatteryPct: 68,
      healthySites: 1,
      siteCount: 1,
      activeAlerts: 0,
      lastSyncedLabel: '30s',
    };
    const snapshot = buildReportsSnapshot(branchRows, summary, '7d');
    const exports = buildReportExports(snapshot, fleetSites);
    expect(exports).toHaveLength(3);
    expect(exports[0].format).toBe('PDF');
    expect(exports[0].trend.length).toBeGreaterThan(2);
  });
});
