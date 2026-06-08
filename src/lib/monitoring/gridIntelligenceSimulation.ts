import { computeDailySavings } from '@/lib/mapDashboardData';
import { microFluctuate } from '@/lib/telemetryLivePerception';
import type { DashboardData, TopologyNode } from '@/types/dashboard';

export const GRID_SIM_BASE_KW = {
  solar: 42.5,
  inverter: 41.8,
  grid: 38.2,
} as const;

export type GridSimKw = {
  solarKw: number;
  inverterKw: number;
  gridKw: number;
  gridBalanced: boolean;
  batterySoc: number;
};

export function jitterSimKw(value: number, floor: number, ceiling: number): number {
  const next = microFluctuate(value, 0.012);
  return Number(Math.min(ceiling, Math.max(floor, next)).toFixed(1));
}

export function nextGridSimKw(prev: GridSimKw): GridSimKw {
  return {
    solarKw: jitterSimKw(prev.solarKw, 40, 45),
    inverterKw: jitterSimKw(prev.inverterKw, 39, 43.5),
    gridKw: jitterSimKw(prev.gridKw, 36, 40.5),
    gridBalanced: prev.gridBalanced,
    batterySoc: Math.round(Math.min(92, Math.max(68, microFluctuate(prev.batterySoc, 0.006)))),
  };
}

export function createInitialGridSimKw(): GridSimKw {
  return {
    solarKw: GRID_SIM_BASE_KW.solar,
    inverterKw: GRID_SIM_BASE_KW.inverter,
    gridKw: GRID_SIM_BASE_KW.grid,
    gridBalanced: false,
    batterySoc: 74,
  };
}

export function buildSimulatedTopologyNodes(kw: GridSimKw): TopologyNode[] {
  const gridLabel = kw.gridBalanced ? 'BALANCED' : 'FEEDING';

  return [
    {
      id: 'solar',
      label: 'Solar Capture',
      labelFull: 'Solar Capture Feed',
      iconName: 'sunny-outline',
      status: 'active',
      isCenter: false,
      flowLabel: 'GENERATING',
      powerKw: kw.solarKw,
    },
    {
      id: 'inverter',
      label: 'ESO Inverter',
      labelFull: 'ESO Inverter Intelligence',
      iconName: 'git-network-outline',
      status: 'active',
      isCenter: true,
      flowLabel: 'CONVERTING',
      powerKw: kw.inverterKw,
    },
    {
      id: 'facility',
      label: 'Facility Grid',
      labelFull: 'Facility Grid Load',
      iconName: 'business-outline',
      status: 'active',
      isCenter: false,
      flowLabel: gridLabel,
      powerKw: kw.gridKw,
    },
  ];
}

export function shouldRunGridIntelligenceSimulation(data: DashboardData): boolean {
  if (data.health.status !== 'live') return true;
  return data.nodes.every((node) => node.status === 'idle');
}

export function applyGridIntelligenceDemoOverlay(
  data: DashboardData,
  kw: GridSimKw,
): DashboardData {
  const nodes = buildSimulatedTopologyNodes(kw);
  const dailySavings = computeDailySavings(kw.solarKw);
  const monthToDate = Math.round(dailySavings * 27.2);
  const dieselAvoided = Math.round(kw.batterySoc * 4.48);
  const solarShare = Math.max(0, Math.min(100, Math.round(kw.batterySoc * 0.95)));
  const vsAvg = Math.max(8, Math.min(24, Number((kw.solarKw * 0.42).toFixed(1))));

  return {
    ...data,
    health: {
      status: 'live',
      message: 'Live demonstration stream',
      updatedAt: new Date().toISOString(),
      showStaleBorder: false,
    },
    nodes,
    battery: {
      ...data.battery,
      soc: kw.batterySoc,
      statusLabel: kw.batterySoc >= 70 ? 'Charging' : 'Active',
    },
    kpi: {
      ...data.kpi,
      description: 'Solar vs diesel · demonstration stream',
      primaryValue: dailySavings,
      delta: vsAvg,
      subMetrics: data.kpi.subMetrics.map((metric) => {
        if (metric.label === 'MTD') {
          return { ...metric, rawValue: monthToDate, valueColor: 'white' as const };
        }
        if (metric.label === 'DIESEL AVOIDED') {
          return { ...metric, rawValue: dieselAvoided, valueColor: 'gold' as const };
        }
        if (metric.label === 'SOLAR SHARE') {
          return { ...metric, rawValue: solarShare, valueColor: 'gold' as const };
        }
        return metric;
      }),
    },
  };
}

export function formatTopologyPowerKw(kw: number): string {
  return `${kw.toFixed(1)} kW`;
}
