import type { QueryClient } from '@tanstack/react-query';
import type { TenantProfile } from '@/stores/authStore';
import type { Site } from '@/stores/siteStore';
import type { Alert } from '@/stores/alertStore';
import type { TelemetryPoint } from '@/stores/telemetryStore';
import type {
  EnodeDevice,
  EnodeTelemetryLatestPoint,
  EnodeTelemetryPoint,
} from '@/services/enode.types';
import { ENODE_DEVICES_KEY } from '@/lib/enodeQueryKeys';
import {
  enodeDeviceToTelemetryPoint,
  enodeHistoryToTelemetryPoint,
  enodeLatestToTelemetryPoint,
} from '@/lib/enodeTelemetryAdapter';
import { useAuthStore } from '@/stores/authStore';
import { useSiteStore } from '@/stores/siteStore';
import { useAlertStore } from '@/stores/alertStore';
import { useTelemetryStore } from '@/stores/telemetryStore';

export const DEMO_COMPANY_ID = 'demo-company-eso';
export const DEMO_SITE_LAGOS = 'demo-site-lagos';
export const DEMO_SITE_ABUJA = 'demo-site-abuja';

export const DEMO_DEVICE_LAGOS_1 = 'demo-inv-lagos-01';
export const DEMO_DEVICE_LAGOS_2 = 'demo-inv-lagos-02';
export const DEMO_DEVICE_ABUJA_1 = 'demo-inv-abuja-01';

const DEMO_WAVE = [0.38, 0.48, 0.44, 0.58, 0.52, 0.66, 0.6, 0.74, 0.68, 0.82, 0.76, 0.88, 0.84, 0.92];

const now = () => new Date().toISOString();

export const DEMO_TENANT: TenantProfile = {
  company_id: DEMO_COMPANY_ID,
  company_name: 'Sunrise Manufacturing Co.',
  role: 'admin',
  site_ids: [DEMO_SITE_LAGOS, DEMO_SITE_ABUJA],
};

export const DEMO_SITES: Site[] = [
  {
    id: DEMO_SITE_LAGOS,
    name: 'Lagos Plant',
    company_id: DEMO_COMPANY_ID,
    location: 'Lagos, NG',
    latitude: 6.5244,
    longitude: 3.3792,
    device_count: 2,
  },
  {
    id: DEMO_SITE_ABUJA,
    name: 'Abuja Campus',
    company_id: DEMO_COMPANY_ID,
    location: 'Abuja, NG',
    latitude: 9.0765,
    longitude: 7.3986,
    device_count: 1,
  },
];

function makeDevice(partial: Omit<EnodeDevice, 'created_at' | 'updated_at'> & { updated_at?: string }): EnodeDevice {
  const ts = partial.updated_at ?? now();
  return {
    ...partial,
    created_at: ts,
    updated_at: ts,
  };
}

export function getDemoDevices(): EnodeDevice[] {
  const ts = now();
  return [
    makeDevice({
      id: DEMO_DEVICE_LAGOS_1,
      company_id: DEMO_COMPANY_ID,
      enode_device_id: 'enode-demo-lagos-01',
      enode_user_id: 'enode-user-demo',
      device_type: 'inverter',
      vendor: 'Sungrow',
      display_name: 'Main Inverter A',
      is_reachable: true,
      connection_status: 'connected',
      production_rate_kw: 312.4,
      charge_rate_kw: 0,
      battery_level_pct: 74,
      grid_power_kw: -108.1,
      raw_state: {},
      last_seen_at: ts,
      branch_id: DEMO_SITE_LAGOS,
    }),
    makeDevice({
      id: DEMO_DEVICE_LAGOS_2,
      company_id: DEMO_COMPANY_ID,
      enode_device_id: 'enode-demo-lagos-02',
      enode_user_id: 'enode-user-demo',
      device_type: 'inverter',
      vendor: 'Sungrow',
      display_name: 'Backup Inverter B',
      is_reachable: true,
      connection_status: 'connected',
      production_rate_kw: 186.2,
      charge_rate_kw: 0,
      battery_level_pct: 61,
      grid_power_kw: -42.5,
      raw_state: {},
      last_seen_at: ts,
      branch_id: DEMO_SITE_LAGOS,
    }),
    makeDevice({
      id: DEMO_DEVICE_ABUJA_1,
      company_id: DEMO_COMPANY_ID,
      enode_device_id: 'enode-demo-abuja-01',
      enode_user_id: 'enode-user-demo',
      device_type: 'inverter',
      vendor: 'Huawei',
      display_name: 'Campus Inverter',
      is_reachable: true,
      connection_status: 'connected',
      production_rate_kw: 228.8,
      charge_rate_kw: 0,
      battery_level_pct: 82,
      grid_power_kw: -55.3,
      raw_state: {},
      last_seen_at: ts,
      branch_id: DEMO_SITE_ABUJA,
    }),
  ];
}

export function getDemoAlerts(): Alert[] {
  const ts = now();
  return [
    {
      id: 'demo-alert-1',
      device_id: DEMO_DEVICE_LAGOS_1,
      site_id: DEMO_SITE_LAGOS,
      severity: 'warning',
      message: 'Grid export threshold approaching',
      detail: 'Export capped at 310 kW for 12 minutes',
      timestamp: ts,
      acknowledged: false,
    },
    {
      id: 'demo-alert-2',
      device_id: DEMO_DEVICE_LAGOS_2,
      site_id: DEMO_SITE_LAGOS,
      severity: 'info',
      message: 'Battery reserve mode active',
      timestamp: ts,
      acknowledged: true,
    },
  ];
}

export function getDemoTelemetryLatest(siteId?: string | null): EnodeTelemetryLatestPoint[] {
  const ts = now();
  const rows: EnodeTelemetryLatestPoint[] = [
    {
      device_id: DEMO_DEVICE_LAGOS_1,
      site_id: DEMO_SITE_LAGOS,
      solar_output_kw: 312.4,
      load_draw_kw: 420.5,
      battery_soc_percent: 74,
      inverter_status: 'online',
      grid_status: 'importing',
      fault_code: null,
      warning_code: null,
      system_timestamp: ts,
      updated_at: ts,
    },
    {
      device_id: DEMO_DEVICE_LAGOS_2,
      site_id: DEMO_SITE_LAGOS,
      solar_output_kw: 186.2,
      load_draw_kw: 228.7,
      battery_soc_percent: 61,
      inverter_status: 'online',
      grid_status: 'importing',
      fault_code: null,
      warning_code: null,
      system_timestamp: ts,
      updated_at: ts,
    },
    {
      device_id: DEMO_DEVICE_ABUJA_1,
      site_id: DEMO_SITE_ABUJA,
      solar_output_kw: 228.8,
      load_draw_kw: 284.1,
      battery_soc_percent: 82,
      inverter_status: 'online',
      grid_status: 'importing',
      fault_code: null,
      warning_code: null,
      system_timestamp: ts,
      updated_at: ts,
    },
  ];

  if (!siteId) return rows;
  return rows.filter((row) => row.site_id === siteId);
}

export function getDemoTelemetryHistory(deviceId: string, hours = 24): EnodeTelemetryPoint[] {
  const points: EnodeTelemetryPoint[] = [];
  const end = Date.now();
  const stepMs = Math.max(5 * 60_000, Math.floor((hours * 3600_000) / 48));

  for (let i = 0; i < 48; i += 1) {
    const wave = DEMO_WAVE[i % DEMO_WAVE.length];
    const recordedAt = new Date(end - (48 - i) * stepMs).toISOString();
    points.push({
      production_kw: 180 + wave * 180,
      charge_kw: 20 + wave * 40,
      grid_kw: 40 + wave * 60,
      recorded_at: recordedAt,
    });
  }

  if (deviceId !== DEMO_DEVICE_LAGOS_1) {
    return points.map((point) => ({
      ...point,
      production_kw: point.production_kw * 0.72,
      grid_kw: point.grid_kw * 0.65,
    }));
  }

  return points;
}

function buildDemoTelemetryPoints(): TelemetryPoint[] {
  const devices = getDemoDevices();
  const points: TelemetryPoint[] = [];

  for (const row of getDemoTelemetryLatest()) {
    points.push(enodeLatestToTelemetryPoint(row));
  }

  for (const device of devices) {
    const snapshot = enodeDeviceToTelemetryPoint(device);
    if (snapshot) points.push(snapshot);
  }

  const primary = devices[0];
  if (primary) {
    for (const row of getDemoTelemetryHistory(primary.id, 24)) {
      points.push(enodeHistoryToTelemetryPoint(primary.id, row));
    }
  }

  return points;
}

export function seedDemoSession(queryClient: QueryClient): void {
  const devices = getDemoDevices();

  useAuthStore.getState().setTenant(DEMO_TENANT);
  useAuthStore.getState().setLoading(false);
  useSiteStore.getState().setSites(DEMO_SITES);
  useAlertStore.getState().seed(getDemoAlerts());
  useTelemetryStore.getState().seed(buildDemoTelemetryPoints());

  queryClient.setQueryData(ENODE_DEVICES_KEY, devices);
  queryClient.setQueryData(['enode', 'telemetry-latest', 'all'], getDemoTelemetryLatest());
  queryClient.setQueryData(['enode', 'telemetry-latest', DEMO_SITE_LAGOS], getDemoTelemetryLatest(DEMO_SITE_LAGOS));
  queryClient.setQueryData(['enode', 'telemetry-latest', DEMO_SITE_ABUJA], getDemoTelemetryLatest(DEMO_SITE_ABUJA));
  queryClient.setQueryData(['tenant', 'sites', DEMO_COMPANY_ID], DEMO_SITES);
  queryClient.setQueryData(['ai-insights', DEMO_COMPANY_ID, undefined], []);
  queryClient.setQueryData(
    ['enode', 'telemetry', DEMO_DEVICE_LAGOS_1, 2],
    getDemoTelemetryHistory(DEMO_DEVICE_LAGOS_1, 2),
  );
}

/** Drops demo cache only — keeps Supabase session in auth store when switching to real login. */
export function clearDemoCache(queryClient: QueryClient): void {
  useAuthStore.getState().setTenant(null);
  useSiteStore.getState().setSites([]);
  useAlertStore.getState().seed([]);
  useTelemetryStore.setState({ latest: {}, history: {}, subscribed: {} });

  queryClient.removeQueries({ queryKey: ENODE_DEVICES_KEY });
  queryClient.removeQueries({ queryKey: ['enode', 'telemetry-latest'] });
  queryClient.removeQueries({ queryKey: ['tenant', 'sites', DEMO_COMPANY_ID] });
  queryClient.removeQueries({ queryKey: ['ai-insights', DEMO_COMPANY_ID] });
}

export function clearDemoSession(queryClient: QueryClient): void {
  useAuthStore.getState().reset();
  clearDemoCache(queryClient);
}
