import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAiInsights } from '@/hooks/useAiInsights';
import { getDemoAiInsights } from '@/lib/monitoring/demoAiInsights';
import { tagInsights, type FleetInsight } from '@/lib/monitoring/fleetInsights';
import { generateTelemetryInsights } from '@/lib/monitoring/telemetryInsights';
import { computeMonitoringKpis } from '@/lib/monitoring/monitoringKpiEngine';
import type { TelemetryPoint } from '@/stores/telemetryStore';
import { useDemoModeActive } from '@/providers/DemoModeProvider';

export type FleetInsightSourceMix = 'ml' | 'telemetry' | 'demo' | 'none';

type GuardHints = {
  batteryStatus?: 'optimal' | 'watch' | 'protect';
  dieselStatus?: 'clear' | 'review' | 'flagged';
  thermalStatus?: 'clear' | 'watch' | 'alert';
};

type Options = {
  deviceIds: string[];
  primaryDeviceId?: string | null;
  streamingLive: boolean;
  telemetry: TelemetryPoint | null | undefined;
  history?: TelemetryPoint[];
  alertCount?: number;
  guards?: GuardHints;
};

export function useFleetIntelligence({
  deviceIds,
  primaryDeviceId,
  streamingLive,
  telemetry,
  history = [],
  alertCount = 0,
  guards,
}: Options) {
  const isDemoMode = useDemoModeActive();
  const mlQuery = useAiInsights(deviceIds);

  const merged = useMemo((): FleetInsight[] => {
    if (isDemoMode) {
      return tagInsights(getDemoAiInsights(deviceIds), 'demo');
    }

    const ml = tagInsights(mlQuery.data ?? [], 'ml');
    if (ml.length > 0) return ml.slice(0, 8);

    if (streamingLive && telemetry && primaryDeviceId) {
      const powerKw = telemetry.power_kw ?? 0;
      const loadKw = telemetry.load_kw ?? 0;
      const kpis = computeMonitoringKpis({ live: true, powerKw, loadKw, history });
      return generateTelemetryInsights({
        deviceId: primaryDeviceId,
        telemetry,
        solarSharePct: kpis.solarSharePct,
        vsSevenDayAvgPct: kpis.vsSevenDayAvgPct,
        alertCount,
        guards,
      });
    }

    return [];
  }, [
    alertCount,
    deviceIds,
    guards,
    history,
    isDemoMode,
    mlQuery.data,
    primaryDeviceId,
    streamingLive,
    telemetry,
  ]);

  const sourceMix: FleetInsightSourceMix = useMemo(() => {
    if (isDemoMode) return 'demo';
    if ((mlQuery.data?.length ?? 0) > 0) return 'ml';
    if (merged.length > 0) return 'telemetry';
    return 'none';
  }, [isDemoMode, merged.length, mlQuery.data?.length]);

  return {
    insights: merged,
    sourceMix,
    isDemoMode,
    isLoading: mlQuery.isLoading && !isDemoMode,
    refetch: mlQuery.refetch,
  };
}

export function useInvalidateFleetIntelligence() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
}
