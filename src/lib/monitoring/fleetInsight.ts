import type { AiInsight } from '@/services/supabase/aiInsights';

export type FleetInsightSource = 'ml' | 'telemetry' | 'demo';

export type FleetInsight = AiInsight & {
  source: FleetInsightSource;
};

export function tagInsightSource<T extends AiInsight>(
  insight: T,
  source: FleetInsightSource,
): FleetInsight {
  return { ...insight, source };
}

export function fleetInsightMeta(insights: FleetInsight[]): string {
  if (insights.length === 0) return 'READY';
  const ml = insights.filter((i) => i.source === 'ml').length;
  const live = insights.filter((i) => i.source === 'telemetry').length;
  const demo = insights.filter((i) => i.source === 'demo').length;
  const parts: string[] = [];
  if (ml > 0) parts.push(`${ml} ML`);
  if (live > 0) parts.push(`${live} LIVE`);
  if (demo > 0) parts.push('DEMO');
  return parts.join(' · ') || `${insights.length} ACTIVE`;
}
