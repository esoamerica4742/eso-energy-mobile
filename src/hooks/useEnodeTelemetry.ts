import { useQuery } from '@tanstack/react-query';
import { enodeClient } from '@/services/enode';
import { CacheTier, defaultQueryOptions } from '@/lib/cachePolicy';
import { useDemoModeActive } from '@/providers/DemoModeProvider';
import { getDemoTelemetryHistory } from '@/lib/demoFleet';

export function useEnodeTelemetry(deviceId: string | null | undefined, hours = 24) {
  const isDemoMode = useDemoModeActive();

  return useQuery({
    queryKey: ['enode', 'telemetry', deviceId, hours],
    queryFn: async () => {
      if (!deviceId) return [];
      if (isDemoMode) return getDemoTelemetryHistory(deviceId, hours);
      const res = await enodeClient.getTelemetry(deviceId, hours);
      return res.points;
    },
    enabled: Boolean(deviceId),
    staleTime: CacheTier.ambient.staleTime,
    gcTime: CacheTier.ambient.gcTime,
    placeholderData: defaultQueryOptions.placeholderData,
    refetchOnReconnect: !isDemoMode,
    refetchOnMount: false,
  });
}
