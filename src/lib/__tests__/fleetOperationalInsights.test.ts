/** @jest-environment node */
import { generateFleetOperationalInsights } from '@/lib/perceivedRealtime/fleetOperationalInsights';
import type { FleetSite, FleetSummary } from '@/types/fleet';

const summary: FleetSummary = {
  totalLoadKw: 1240,
  avgBatteryPct: 62,
  healthySites: 2,
  siteCount: 3,
  activeAlerts: 1,
  lastSyncedLabel: '30s',
};

const sites = [
  { id: 'a', status: 'live' },
  { id: 'b', status: 'live' },
  { id: 'c', status: 'degraded' },
] as FleetSite[];

describe('fleetOperationalInsights', () => {
  it('returns fleet insights when streaming', () => {
    const insights = generateFleetOperationalInsights({
      summary,
      sites,
      liveCount: 2,
      streaming: true,
    });
    expect(insights.length).toBeGreaterThan(0);
    expect(insights.some((i) => i.message.includes('stale'))).toBe(true);
  });

  it('returns awaiting sync when paused', () => {
    const insights = generateFleetOperationalInsights({
      summary,
      sites,
      liveCount: 0,
      streaming: false,
    });
    expect(insights[0]?.message).toBe('Awaiting fleet sync');
  });
});
