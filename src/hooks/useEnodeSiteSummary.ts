import { useQuery } from "@tanstack/react-query";
import { enodeClient } from "@/services/enode";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { supabaseConfigured } from "@/lib/supabase";

export function useEnodeSiteSummary(siteId?: string | null) {
  const { isAuthenticated } = useSupabaseSession();
  return useQuery({
    queryKey: ["enode", "site-summary", siteId ?? "none"],
    queryFn: async () => {
      if (!siteId) return null;
      const res = await enodeClient.getSiteSummary(siteId);
      return res.summary;
    },
    enabled: supabaseConfigured && isAuthenticated && Boolean(siteId),
    staleTime: 60_000,
  });
}
