import type { AiInsight } from '@/services/supabase/aiInsights';

export type FleetInsightSource = 'ml' | 'telemetry' | 'demo';

export type FleetInsight = AiInsight & {
  source: FleetInsightSource;
};

export const FLEET_INSIGHT_SOURCE_LABEL: Record<FleetInsightSource, string> = {
  ml: 'ML',
  telemetry: 'LIVE',
  demo: 'DEMO',
};

export function tagInsights(insights: AiInsight[], source: FleetInsightSource): FleetInsight[] {
  return insights.map((insight) => ({ ...insight, source }));
}
