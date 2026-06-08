import { useQuery } from "@tanstack/react-query";
import { enodeClient } from "@/services/enode";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { supabaseConfigured } from "@/lib/supabase";
import { CacheTier, defaultQueryOptions } from "@/lib/cachePolicy";
import { BACKEND_SYNC_INTERVAL_MS } from "@/lib/telemetryLivePerception";
import { useDemoModeActive } from "@/providers/DemoModeProvider";
import { getDemoTelemetryLatest } from "@/lib/demoFleet";

export function useEnodeTelemetryLatest(siteId?: string) {
  const { isAuthenticated } = useSupabaseSession();
  const isDemoMode = useDemoModeActive();
  const enabled = isDemoMode || (supabaseConfigured && isAuthenticated);

  return useQuery({
    queryKey: ["enode", "telemetry-latest", siteId ?? "all"],
    queryFn: async () => {
      if (isDemoMode) return getDemoTelemetryLatest(siteId);
      const res = await enodeClient.getTelemetryLatest(siteId);
      return res.points;
    },
    enabled,
    staleTime: CacheTier.live.staleTime,
    gcTime: CacheTier.live.gcTime,
    refetchInterval: enabled && !isDemoMode ? BACKEND_SYNC_INTERVAL_MS : false,
    placeholderData: defaultQueryOptions.placeholderData,
  });
}
