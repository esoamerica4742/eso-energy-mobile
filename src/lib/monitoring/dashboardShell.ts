import type { DashboardData } from '@/types/dashboard';

const ZERO_SUB_METRICS: DashboardData['kpi']['subMetrics'] = [
  { label: 'MTD', rawValue: 0, unit: '₦', valueColor: 'muted', abbreviate: true },
  { label: 'DIESEL AVOIDED', rawValue: 0, unit: 'L', valueColor: 'muted', abbreviate: false },
  { label: 'SOLAR SHARE', rawValue: 0, unit: '%', valueColor: 'muted', abbreviate: false },
];

/** Structural dashboard defaults — all metrics at zero until live telemetry arrives. */
export function createDashboardShell(siteName?: string | null): DashboardData {
  return {
    site: {
      name: siteName?.trim() || 'Fleet site',
      tier: 'SOVEREIGN FLEET TIER',
    },
    health: {
      status: 'offline',
      message: 'Awaiting live telemetry',
      updatedAt: null,
      showStaleBorder: false,
    },
    orchestrationTitle: 'Energy Orchestration Layer',
    orchestrationSubLabel: 'SOVEREIGN TRANSFER TOPOLOGY',
    nodes: [
      {
        id: 'solar',
        label: 'Solar Capture',
        labelFull: 'Solar Capture Feed',
        iconName: 'sunny-outline',
        status: 'idle',
        isCenter: false,
      },
      {
        id: 'inverter',
        label: 'ESO Inverter',
        labelFull: 'ESO Inverter Intelligence',
        iconName: 'git-network-outline',
        status: 'idle',
        isCenter: true,
      },
      {
        id: 'facility',
        label: 'Facility Grid',
        labelFull: 'Facility Grid Load',
        iconName: 'business-outline',
        status: 'idle',
        isCenter: false,
      },
    ],
    battery: {
      label: 'Metallic Lithium Reserve',
      soc: 0,
      statusLabel: 'Offline',
    },
    kpi: {
      sectionLabel: 'NET DAILY SAVINGS · SOLAR VS DIESEL',
      description: 'Metrics appear when live telemetry connects.',
      currency: '₦',
      primaryValue: 0,
      delta: 0,
      deltaLabel: 'VS 7-DAY AVG',
      deltaDirection: 'up',
      subMetrics: ZERO_SUB_METRICS.map((m) => ({ ...m })),
    },
  };
}
