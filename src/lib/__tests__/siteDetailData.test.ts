import { buildSiteChartData, buildSiteInverterRows } from '@/lib/siteDetailData';
import type { FleetSite } from '@/types/fleet';
import type { EnodeDevice, EnodeTelemetryLatestPoint, EnodeTelemetryPoint } from '@/services/enode.types';

const fleetSite: FleetSite = {
  id: 'site-1',
  name: 'Lagos HQ',
  city: 'Lagos',
  source: 'solar',
  load: 142,
  battery: 68,
  uptime: 99,
  status: 'live',
  inverterCount: 1,
  onlineInverters: 1,
  alerts: 0,
  latitude: 6.5244,
  longitude: 3.3792,
  sparklineTrend: [120, 130, 128, 140, 142, 138, 145, 142],
};

describe('siteDetailData', () => {
  it('builds chart data from telemetry points', () => {
    const points: EnodeTelemetryPoint[] = [
      { production_kw: 10, charge_kw: 0, grid_kw: -2, recorded_at: '2026-05-22T08:00:00.000Z' },
      { production_kw: 20, charge_kw: 0, grid_kw: -4, recorded_at: '2026-05-22T09:00:00.000Z' },
    ];
    const chart = buildSiteChartData(points, fleetSite);
    expect(chart).toHaveLength(2);
    expect(chart[0].solar).toBe(10);
    expect(chart[1].grid).toBe(4);
  });

  it('falls back to sparkline when telemetry is sparse', () => {
    const chart = buildSiteChartData([], fleetSite);
    expect(chart.length).toBeGreaterThan(0);
    expect(chart[0].solar).toBeGreaterThan(0);
  });

  it('maps inverter rows with latest telemetry', () => {
    const devices: EnodeDevice[] = [
      {
        id: 'dev-1',
        company_id: 'co-1',
        enode_device_id: 'enode-1',
        enode_user_id: 'user-1',
        device_type: 'inverter',
        vendor: 'DEMO',
        display_name: 'Main Inverter A',
        is_reachable: true,
        connection_status: 'connected',
        production_rate_kw: 142,
        charge_rate_kw: null,
        battery_level_pct: 68,
        grid_power_kw: -142,
        raw_state: {},
        last_seen_at: '2026-05-22T10:00:00.000Z',
        branch_id: null,
        created_at: '2026-05-22T10:00:00.000Z',
        updated_at: '2026-05-22T10:00:00.000Z',
      },
    ];
    const latest: EnodeTelemetryLatestPoint[] = [
      {
        device_id: 'dev-1',
        site_id: 'site-1',
        solar_output_kw: 150,
        load_draw_kw: 120,
        battery_soc_percent: 70,
        inverter_status: 'online',
        grid_status: 'available',
        fault_code: null,
        warning_code: null,
        system_timestamp: '2026-05-22T10:00:00.000Z',
        updated_at: '2026-05-22T10:00:00.000Z',
      },
    ];
    const rows = buildSiteInverterRows(devices, latest);
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe('live');
    expect(rows[0].solarKw).toBe(150);
  });
});
