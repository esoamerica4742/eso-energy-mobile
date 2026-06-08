import { memo } from 'react';
import { AIInsightsCard } from '@/components/dashboard/AIInsightsCard';
import { DashboardSection } from '@/components/dashboard/command/DashboardSection';
import type { FleetInsight } from '@/lib/monitoring/fleetInsights';
import type { FleetInsightSourceMix } from '@/hooks/useFleetIntelligence';

export type { FleetInsightSourceMix };

type Props = {
  insights: FleetInsight[];
  isLoading: boolean;
  sourceMix: FleetInsightSourceMix;
};

function sectionMeta(sourceMix: FleetInsightSourceMix, count: number): string {
  if (sourceMix === 'ml') return count > 0 ? `${count} · ML` : 'ML PIPELINE';
  if (sourceMix === 'telemetry' || sourceMix === 'demo') {
    return count > 0 ? `${count} · LIVE` : 'LIVE ANALYSIS';
  }
  return 'READY';
}

export const DashboardIntelligenceSection = memo(function DashboardIntelligenceSection({
  insights,
  isLoading,
  sourceMix,
}: Props) {
  return (
    <DashboardSection title="Fleet intelligence" meta={sectionMeta(sourceMix, insights.length)}>
      <AIInsightsCard insights={insights} isLoading={isLoading} sourceMix={sourceMix} />
    </DashboardSection>
  );
});
