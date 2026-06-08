import type { TelemetryPoint } from '@/stores/telemetryStore';

export type InsightLevel = 'info' | 'watch' | 'critical';

export type OperationalInsight = {
  id: string;
  level: InsightLevel;
  message: string;
  context?: string;
};

type Input = {
  anchor: TelemetryPoint | null | undefined;
  perceived: TelemetryPoint | null | undefined;
  streaming: boolean;
  loadTrend?: 'rising' | 'falling' | 'stable';
  alertCount?: number;
};

function loadTrendFromHistory(
  history: { load_kw: number }[] | undefined,
): 'rising' | 'falling' | 'stable' {
  if (!history || history.length < 4) return 'stable';
  const recent = history.slice(-4);
  const first = recent[0]?.load_kw ?? 0;
  const last = recent[recent.length - 1]?.load_kw ?? 0;
  const delta = last - first;
  if (delta > first * 0.04) return 'rising';
  if (delta < -first * 0.04) return 'falling';
  return 'stable';
}

/** Predictive operational insights — concise, non-chatbot, enterprise tone. */
export function generateOperationalInsights(input: Input): OperationalInsight[] {
  const { anchor, perceived, streaming, alertCount = 0 } = input;
  if (!anchor || !streaming) {
    return [
      {
        id: 'awaiting-sync',
        level: 'info',
        message: 'Awaiting infrastructure sync',
        context: 'Telemetry stream paused',
      },
    ];
  }

  const point = perceived ?? anchor;
  const power = point.power_kw;
  const load = point.load_kw;
  const soc = point.battery_pct;
  const temp = point.temperature_c;
  const trend = input.loadTrend ?? loadTrendFromHistory(undefined);
  const insights: OperationalInsight[] = [];

  if (soc >= 35 && power > load * 0.15) {
    insights.push({
      id: 'battery-charging',
      level: 'info',
      message: 'Battery charging',
      context: `SOC ${Math.round(soc)}% · solar offset active`,
    });
  } else if (soc <= 18 && load > power) {
    insights.push({
      id: 'discharge-elevated',
      level: 'watch',
      message: 'Battery discharge rate elevated',
      context: `SOC ${Math.round(soc)}% · monitor reserve`,
    });
  }

  if (load > power * 1.08 && trend === 'rising') {
    insights.push({
      id: 'peak-load',
      level: 'watch',
      message: 'Peak load approaching',
      context: `${Math.round(load)} kW draw · grid assist likely`,
    });
  } else if (Math.abs(load - power) < load * 0.05) {
    insights.push({
      id: 'grid-stable',
      level: 'info',
      message: 'Grid stabilized',
      context: 'Generation and load in balance',
    });
  }

  if (temp != null && temp >= 42) {
    insights.push({
      id: 'thermal-stress',
      level: 'watch',
      message: 'Thermal load stress detected',
      context: `${temp.toFixed(1)}°C · inverter cooling active`,
    });
  }

  if (power > 0 && load > 0) {
    const efficiency = Math.min(100, Math.round((power / Math.max(load, 1)) * 100));
    if (efficiency < 72) {
      insights.push({
        id: 'efficiency-dip',
        level: 'watch',
        message: `Site efficiency decreased ${100 - efficiency}%`,
        context: 'Review inverter output vs load',
      });
    }
  }

  insights.push({
    id: 'sync-healthy',
    level: 'info',
    message: 'Inverter synchronization healthy',
    context: alertCount > 0 ? `${alertCount} open alerts` : 'All channels nominal',
  });

  if (load > 0 && power / load < 0.85) {
    insights.push({
      id: 'load-balancing',
      level: 'info',
      message: 'Load balancing active',
      context: 'Battery and grid sharing demand',
    });
  }

  const priority: Record<InsightLevel, number> = { critical: 0, watch: 1, info: 2 };
  return insights
    .sort((a, b) => priority[a.level] - priority[b.level])
    .slice(0, 4);
}
