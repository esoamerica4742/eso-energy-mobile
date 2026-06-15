import {
  buildDieselAuditHtml,
  buildExecutiveSummaryHtml,
  buildSolarContributionCsv,
} from '@/lib/monitoring/reportExports';
import { buildReportsSnapshot } from '@/lib/reportsData';
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

describe('reportExports', () => {
  const summary = {
    totalLoadKw: 142,
    avgBatteryPct: 68,
    healthySites: 1,
    siteCount: 1,
    activeAlerts: 0,
    lastSyncedLabel: '30s',
  };

  const snapshot = buildReportsSnapshot(branchRows, summary, '7d');

  it('builds diesel audit html with site rows', () => {
    const html = buildDieselAuditHtml(snapshot, fleetSites);
    expect(html).toContain('Weekly diesel audit');
    expect(html).toContain('Lagos HQ');
  });

  it('builds executive summary html with KPI blocks', () => {
    const html = buildExecutiveSummaryHtml(snapshot, fleetSites);
    expect(html).toContain('Performance index');
    expect(html).toContain(String(snapshot.performanceIndex));
  });

  it('builds solar contribution csv', () => {
    const csv = buildSolarContributionCsv(snapshot, fleetSites);
    expect(csv.split('\n').length).toBeGreaterThan(1);
    expect(csv).toContain('site_name');
    expect(csv).toContain('Lagos HQ');
  });
});
