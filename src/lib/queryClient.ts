import { QueryClient } from '@tanstack/react-query';
import { CacheTier, defaultQueryOptions } from '@/lib/cachePolicy';

export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        ...defaultQueryOptions,
        staleTime: CacheTier.dashboard.staleTime,
        gcTime: CacheTier.dashboard.gcTime,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

/** Singleton for app root — import in _layout only */
export const appQueryClient = createAppQueryClient();
