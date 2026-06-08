/** @jest-environment node */
import {
  computeInterpolationDuration,
  interpolateScalars,
  scalarsEqual,
  telemetryToScalars,
} from '@/lib/perceivedRealtime';

describe('telemetryInterpolation', () => {
  const from = telemetryToScalars({
    id: 'a',
    device_id: 'd1',
    voltage: 48,
    current: 10,
    power_kw: 649,
    load_kw: 700,
    battery_pct: 68,
    temperature_c: 38,
    timestamp: '2026-05-22T10:00:00Z',
  });

  const to = telemetryToScalars({
    id: 'b',
    device_id: 'd1',
    voltage: 48,
    current: 10,
    power_kw: 655,
    load_kw: 710,
    battery_pct: 67,
    temperature_c: 38.2,
    timestamp: '2026-05-22T10:05:00Z',
  });

  it('interpolates smoothly at midpoint', () => {
    const mid = interpolateScalars(from, to, 0.5);
    expect(mid.power_kw).toBeGreaterThan(from.power_kw);
    expect(mid.power_kw).toBeLessThan(to.power_kw);
    expect(mid.load_kw).toBeGreaterThan(from.load_kw);
    expect(mid.load_kw).toBeLessThan(to.load_kw);
  });

  it('uses 15–45s duration window scaled by delta', () => {
    const duration = computeInterpolationDuration(from, to);
    expect(duration).toBeGreaterThanOrEqual(15_000);
    expect(duration).toBeLessThanOrEqual(45_000);
  });

  it('detects equal scalars within epsilon', () => {
    expect(scalarsEqual(from, from)).toBe(true);
    expect(scalarsEqual(from, to)).toBe(false);
  });
});
