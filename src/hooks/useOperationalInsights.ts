import { useMemo } from 'react';
import type { TelemetryPoint } from '@/stores/telemetryStore';
import { generateOperationalInsights, type OperationalInsight } from '@/lib/perceivedRealtime';

type Options = {
  anchor: TelemetryPoint | null | undefined;
  perceived: TelemetryPoint | null | undefined;
  streaming: boolean;
  alertCount?: number;
  history?: TelemetryPoint[];
};

export function useOperationalInsights({
  anchor,
  perceived,
  streaming,
  alertCount = 0,
  history,
}: Options): OperationalInsight[] {
  return useMemo(() => {
    const loadTrend =
      history && history.length >= 4
        ? (() => {
            const recent = history.slice(-4);
            const first = recent[0]?.load_kw ?? 0;
            const last = recent[recent.length - 1]?.load_kw ?? 0;
            const delta = last - first;
            if (delta > first * 0.04) return 'rising' as const;
            if (delta < -first * 0.04) return 'falling' as const;
            return 'stable' as const;
          })()
        : undefined;

    return generateOperationalInsights({
      anchor,
      perceived,
      streaming,
      alertCount,
      loadTrend,
    });
  }, [anchor, perceived, streaming, alertCount, history]);
}
