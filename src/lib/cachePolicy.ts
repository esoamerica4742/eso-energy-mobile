/** Shared TanStack Query cache tiers — luxury apps feel instant, never stale-on-open. */

export const CacheTier = {
  /** Live telemetry, fleet power — refresh often, keep warm briefly */
  live: {
    staleTime: 20_000,
    gcTime: 5 * 60_000,
  },
  /** Dashboard lists, devices, wallet balance */
  dashboard: {
    staleTime: 45_000,
    gcTime: 15 * 60_000,
  },
  /** Tenant profile, sites, history */
  structural: {
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  },
  /** AI insights, reports — slow-changing */
  ambient: {
    staleTime: 10 * 60_000,
    gcTime: 60 * 60_000,
  },
} as const;

export const defaultQueryOptions = {
  retry: 2,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  /** Show cached data while revalidating — no blank flashes */
  placeholderData: <T>(previous: T | undefined) => previous,
} as const;
