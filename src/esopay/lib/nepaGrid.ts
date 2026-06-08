/** NEPA / DisCo public grid supply states for ESO Intelligence. */

export type NepaGridState = 'on_grid' | 'on_generator' | 'outage' | 'unknown';

export type NepaSiteRow = {
  id: string;
  name: string;
  location: string;
  gridState: NepaGridState;
  loadKw: number;
  gridStatusRaw: string;
  updatedAt: string | null;
};

export function classifyNepaGridStatus(raw: string | null | undefined): NepaGridState {
  const g = (raw ?? '').toLowerCase().trim();
  if (!g) return 'unknown';
  if (g.includes('offline') || g.includes('fault') || g.includes('outage')) return 'outage';
  if (g.includes('diesel') || g.includes('generator') || g === 'gen') return 'on_generator';
  if (
    g.includes('online') ||
    g.includes('stable') ||
    g.includes('grid') ||
    g.includes('import') ||
    g.includes('available')
  ) {
    return 'on_grid';
  }
  return 'unknown';
}

export const NEPA_STATE_LABEL: Record<NepaGridState, string> = {
  on_grid: 'NEPA / DisCo on',
  on_generator: 'On generator',
  outage: 'Grid outage',
  unknown: 'Status pending',
};

export const NEPA_STATE_HINT: Record<NepaGridState, string> = {
  on_grid: 'Public supply available — facility drawing from grid',
  on_generator: 'NEPA unavailable — backup generation active',
  outage: 'No grid or generator telemetry — investigate site',
  unknown: 'Awaiting the next grid telemetry snapshot',
};

export function formatNepaInsight(summary: {
  onGrid: number;
  onGenerator: number;
  outage: number;
  total: number;
}): { title: string; body: string } {
  if (summary.total === 0) {
    return {
      title: 'Grid monitoring ready',
      body: 'Site telemetry will appear here as your fleet reports NEPA and load status.',
    };
  }
  if (summary.outage > 0) {
    return {
      title: `${summary.outage} site${summary.outage === 1 ? '' : 's'} on outage`,
      body: 'Review affected facilities and coordinate DisCo restoration or diesel cover.',
    };
  }
  if (summary.onGenerator > 0) {
    return {
      title: `${summary.onGenerator} site${summary.onGenerator === 1 ? '' : 's'} on generator`,
      body: 'NEPA supply interrupted — monitor fuel and transfer back when grid returns.',
    };
  }
  return {
    title: 'NEPA supply stable across fleet',
    body: `${summary.onGrid} of ${summary.total} sites reporting grid import.`,
  };
}
