/** @jest-environment node */
import {
  applyLiveDisplayMetrics,
  buildPerceivedTelemetryPoint,
  canStreamFrontendLive,
  formatLiveStreamMeta,
  formatSyncAge,
  microFluctuate,
} from '@/lib/telemetryLivePerception';
import { mockDashboard } from '@/data/mockDashboard';
import type { TelemetryPoint } from '@/stores/telemetryStore';

const anchor: TelemetryPoint = {
  id: 'p1',
  device_id: 'd1',
  voltage: 48,
  current: 10,
  power_kw: 300,
  load_kw: 420,
  battery_pct: 68,
  temperature_c: 38,
  timestamp: new Date().toISOString(),
};

describe('telemetryLivePerception', () => {
  it('microFluctuates around the anchor without large drift', () => {
    const next = microFluctuate(300, 0.008);
    expect(next).toBeGreaterThan(295);
    expect(next).toBeLessThan(305);
  });

  it('builds perceived telemetry from anchor', () => {
    const perceived = buildPerceivedTelemetryPoint(anchor);
    expect(perceived.battery_pct).toBe(68);
    expect(perceived.timestamp).toBe(anchor.timestamp);
    expect(perceived.power_kw).not.toBe(anchor.power_kw);
  });

  it('streams only when health allows and anchor is fresh', () => {
    expect(canStreamFrontendLive(anchor.timestamp, 'live')).toBe(true);
    expect(canStreamFrontendLive(anchor.timestamp, 'fault')).toBe(false);

    const staleAt = new Date(Date.now() - 6 * 60_000).toISOString();
    expect(canStreamFrontendLive(staleAt, 'stale')).toBe(false);
  });

  it('formats sync age and live stream meta', () => {
    const now = Date.now();
    expect(formatSyncAge(new Date(now - 4_000).toISOString(), now)).toBe('synced just now');
    expect(formatLiveStreamMeta(new Date(now - 4_000).toISOString(), true, now)).toContain('live stream');
    expect(formatLiveStreamMeta(null, false, now)).toBe('stream paused');
  });

  it('applies live display metrics to dashboard data', () => {
    const base = {
      ...mockDashboard,
      health: { ...mockDashboard.health, status: 'live' as const },
    };
    const perceived = { ...anchor, power_kw: 400, load_kw: 500, battery_pct: 70 };
    const next = applyLiveDisplayMetrics(base, perceived, true);

    expect(next.battery.soc).toBe(70);
    expect(next.kpi.primaryValue).toBe(Math.round(400 * 152870));
    expect(base.kpi.primaryValue).not.toBe(next.kpi.primaryValue);
  });
});
