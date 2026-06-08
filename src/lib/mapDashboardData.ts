import type { DashboardData } from '@/types/dashboard';
import type { DashboardTelemetryInput } from '@/types/siteTelemetry';
import type { ConnectionStatus, NodeStatus } from '@/types/dashboard';
import { createDashboardShell } from '@/lib/monitoring/dashboardShell';
import { computeMonitoringKpis, computeDailySavings } from '@/lib/monitoring/monitoringKpiEngine';
import type { TelemetryPoint } from '@/stores/telemetryStore';
import {
  isLiveConnection,
  resolveSiteConnectionStatus,
  showStaleBorder,
  statusMessage,
} from '@/lib/telemetryStatus';

type BuildOptions = {
  hasDevice?: boolean;
  history?: TelemetryPoint[];
};

function mapDbDeviceStatus(
  status?: DashboardTelemetryInput['deviceStatus'],
): DashboardTelemetryInput['deviceStatus'] {
  if (status === 'fault') return 'fault';
  if (status === 'maintenance') return 'maintenance';
  if (status === 'offline') return 'offline';
  return 'online';
}

function nodeStatusForConnection(status: ConnectionStatus, base: NodeStatus): NodeStatus {
  if (status === 'fault') return 'warning';
  if (status === 'offline' || status === 'stale') return 'idle';
  return base;
}

export function buildDashboardData(
  siteName?: string | null,
  telemetry?: DashboardTelemetryInput | null,
  options: BuildOptions = {},
): DashboardData {
  const shell = createDashboardShell(siteName);
  const hasDevice = options.hasDevice ?? Boolean(telemetry?.siteId);
  const history = options.history ?? [];

  const hasTelemetry = Boolean(
    telemetry &&
      (telemetry.power_kw != null || telemetry.load_kw != null || telemetry.battery_pct != null),
  );

  const connectionStatus = resolveSiteConnectionStatus({
    hasDevice,
    hasTelemetry,
    deviceStatus: mapDbDeviceStatus(telemetry?.deviceStatus),
    updatedAt: telemetry?.timestamp ?? null,
    batteryPct: telemetry?.battery_pct,
    temperatureC: telemetry?.temperature_c,
  });

  const live = isLiveConnection(connectionStatus);
  const soc = hasTelemetry ? Math.round(telemetry!.battery_pct ?? 0) : 0;
  const powerKw = hasTelemetry ? (telemetry!.power_kw ?? 0) : 0;
  const loadKw = hasTelemetry ? (telemetry!.load_kw ?? 0) : 0;

  const kpis = computeMonitoringKpis({ live, powerKw, loadKw, history });

  return {
    ...shell,
    health: {
      status: connectionStatus,
      message: statusMessage(connectionStatus, telemetry?.timestamp ?? null),
      updatedAt: telemetry?.timestamp ?? null,
      showStaleBorder: showStaleBorder(connectionStatus),
    },
    nodes: shell.nodes.map((node) => ({
      ...node,
      status: nodeStatusForConnection(connectionStatus, node.status),
    })),
    battery: {
      ...shell.battery,
      soc: live ? soc : 0,
      statusLabel:
        connectionStatus === 'fault'
          ? 'Fault'
          : connectionStatus === 'offline'
            ? 'Offline'
            : connectionStatus === 'stale'
              ? 'Stale'
              : soc >= 20
                ? 'Active'
                : 'Standby',
    },
    kpi: {
      ...shell.kpi,
      description: live
        ? 'Estimated from live solar offset · diesel displacement model · 24h rolling'
        : 'Metrics paused until live telemetry returns.',
      primaryValue: kpis.dailySavings,
      delta: Math.abs(kpis.vsSevenDayAvgPct),
      deltaLabel: 'VS 7-DAY AVG',
      deltaDirection: kpis.vsSevenDayAvgPct >= 0 ? 'up' : 'down',
      subMetrics: shell.kpi.subMetrics.map((metric) => {
        if (metric.label === 'MTD') {
          return { ...metric, rawValue: kpis.monthToDate, valueColor: live ? 'white' : 'muted' };
        }
        if (metric.label === 'DIESEL AVOIDED') {
          return { ...metric, rawValue: kpis.dieselAvoidedLiters, valueColor: live ? 'gold' : 'muted' };
        }
        if (metric.label === 'SOLAR SHARE') {
          return { ...metric, rawValue: kpis.solarSharePct, valueColor: live ? 'mint' : 'muted' };
        }
        return { ...metric, valueColor: live ? metric.valueColor : 'muted' };
      }),
    },
  };
}

export { computeDailySavings };
