import type { TelemetryPoint } from '@/stores/telemetryStore';

export type BatteryGuardStatus = 'optimal' | 'watch' | 'protect';

function buildSubLabel(status: BatteryGuardStatus, live: boolean) {
  if (!live) return 'AWAITING LIVE TELEMETRY';
  if (status === 'optimal') return 'OPTIMAL LIFESPAN ENVELOPE';
  if (status === 'watch') return 'CYCLE STRESS · WATCH ZONE';
  return 'RESERVE PROTECTION · ACTIVE';
}

export type BatteryLifespanSnapshot = {
  enabled: boolean;
  title: string;
  subLabel: string;
  healthScore: number;
  status: BatteryGuardStatus;
  statusLabel: string;
  remainingLifeLabel: string;
  cycleEstimate: number;
  deepCycleCount: number;
  tempStressPct: number;
  reserveMarginPct: number;
  recommendation: string;
  healthTrend: number[];
  socPct: number;
  temperatureC: number | null;
};

const STATUS_LABEL: Record<BatteryGuardStatus, string> = {
  optimal: 'OPTIMAL',
  watch: 'WATCH',
  protect: 'PROTECT',
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function countDeepCycles(history: Pick<TelemetryPoint, 'battery_pct'>[]) {
  let count = 0;
  let wasHigh = true;
  for (const point of history) {
    const soc = point.battery_pct ?? 0;
    if (soc < 15) {
      if (wasHigh) count += 1;
      wasHigh = false;
    } else if (soc > 25) {
      wasHigh = true;
    }
  }
  return count;
}

function estimateCycles(history: Pick<TelemetryPoint, 'battery_pct'>[]) {
  if (history.length < 2) return 0;
  let deltaSum = 0;
  for (let i = 1; i < history.length; i += 1) {
    deltaSum += Math.abs(history[i].battery_pct - history[i - 1].battery_pct);
  }
  return Math.round(deltaSum / 180);
}

function tempStressPercent(history: Pick<TelemetryPoint, 'temperature_c'>[]) {
  if (history.length === 0) return 0;
  const hot = history.filter((point) => (point.temperature_c ?? 0) >= 42).length;
  return Math.round((hot / history.length) * 100);
}

function reserveMargin(socPct: number) {
  return clamp(Math.round(socPct - 10), 0, 100);
}

function resolveStatus(score: number): BatteryGuardStatus {
  if (score >= 85) return 'optimal';
  if (score >= 65) return 'watch';
  return 'protect';
}

function remainingLifeLabel(score: number, cycleEstimate: number) {
  const cycleWear = clamp(cycleEstimate / 6000, 0, 0.45);
  const years = clamp((score / 100) * 10 * (1 - cycleWear), 0.5, 12);
  if (years >= 2) return `${years.toFixed(1)} yrs`;
  return `${Math.round(years * 12)} mo`;
}

function recommendation(input: {
  status: BatteryGuardStatus;
  deepCycleCount: number;
  tempStressPct: number;
  socPct: number;
  live: boolean;
}) {
  if (!input.live) {
    return 'Metrics paused until live telemetry returns.';
  }
  if (input.status === 'protect') {
    return 'Raise reserve floor and reduce deep discharge windows to extend cell life.';
  }
  if (input.deepCycleCount > 2) {
    return 'Multiple deep cycles detected — consider raising overnight reserve.';
  }
  if (input.tempStressPct > 20) {
    return 'Thermal stress elevated — verify inverter ventilation and ambient cooling.';
  }
  if (input.socPct < 20) {
    return 'State of charge is low — guard recommends minimum 20% reserve.';
  }
  return 'Charge profile is within optimal lifespan envelope.';
}

function healthTrendFromHistory(
  history: TelemetryPoint[],
  deviceId: string,
  healthScore: number,
) {
  if (history.length >= 4) {
    const chunk = Math.max(1, Math.floor(history.length / 12));
    const trend = [];
    for (let i = chunk; i <= history.length; i += chunk) {
      const slice = history.slice(Math.max(0, i - chunk), i);
      const avgSoc = slice.reduce((sum, p) => sum + p.battery_pct, 0) / slice.length;
      const deep = countDeepCycles(slice);
      const stress = tempStressPercent(slice);
      trend.push(clamp(100 - deep * 10 - stress * 0.25 - (avgSoc < 20 ? 8 : 0), 35, 100));
    }
    return trend.length >= 2 ? trend : [healthScore, healthScore];
  }
  return [healthScore, healthScore];
}

export function buildBatteryLifespanGuard(input: {
  live: boolean;
  socPct: number;
  temperatureC?: number | null;
  history?: TelemetryPoint[];
  deviceId?: string;
}): BatteryLifespanSnapshot {
  const history = input.history ?? [];
  const socPct = Math.round(input.socPct);
  const temperatureC = input.temperatureC ?? null;
  const deepCycleCount = countDeepCycles(history);
  const cycleEstimate = estimateCycles(history);
  const tempStressPct = tempStressPercent(history);
  const reserveMarginPct = reserveMargin(socPct);

  let healthScore = 100;
  healthScore -= deepCycleCount * 8;
  healthScore -= Math.min(24, Math.round(tempStressPct * 0.28));
  if (socPct < 20) healthScore -= 12;
  if (socPct < 10) healthScore -= 18;
  if (temperatureC != null && temperatureC >= 55) healthScore -= 15;
  else if (temperatureC != null && temperatureC >= 45) healthScore -= 8;
  healthScore = clamp(Math.round(healthScore), 0, 100);

  if (!input.live) {
    healthScore = 0;
  }

  const status = input.live ? resolveStatus(healthScore) : 'watch';

  return {
    enabled: input.live,
    title: 'Battery Lifespan Guard',
    subLabel: buildSubLabel(status, input.live),
    healthScore,
    status,
    statusLabel: input.live ? STATUS_LABEL[status] : 'STANDBY',
    remainingLifeLabel: input.live ? remainingLifeLabel(healthScore, cycleEstimate) : '—',
    cycleEstimate,
    deepCycleCount,
    tempStressPct,
    reserveMarginPct,
    recommendation: recommendation({
      status,
      deepCycleCount,
      tempStressPct,
      socPct,
      live: input.live,
    }),
    healthTrend: healthTrendFromHistory(history, input.deviceId ?? 'battery-guard', healthScore),
    socPct,
    temperatureC,
  };
}

export function guardBorderVariant(status: BatteryGuardStatus, enabled: boolean) {
  if (!enabled) return 'muted' as const;
  if (status === 'protect') return 'alert' as const;
  if (status === 'watch') return 'amber' as const;
  return 'gold' as const;
}

export function guardGlowColor(status: BatteryGuardStatus, enabled: boolean) {
  if (!enabled) return 'none' as const;
  if (status === 'optimal') return 'mint' as const;
  if (status === 'watch') return 'gold' as const;
  return 'none' as const;
}
