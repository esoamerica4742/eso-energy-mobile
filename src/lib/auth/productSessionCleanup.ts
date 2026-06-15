import type { QueryClient } from '@tanstack/react-query';
import { ENODE_DEVICES_KEY } from '@/lib/enodeQueryKeys';
import { esoPayKeys } from '@/esopay/api/queryKeys';

/** Drop cached monitoring data — does not touch Eso Pay queries. */
export function clearMonitoringQueryCache(client: QueryClient): void {
  void client.removeQueries({ queryKey: ['tenant'] });
  void client.removeQueries({ queryKey: ['enode'] });
  void client.removeQueries({ queryKey: ENODE_DEVICES_KEY });
  void client.removeQueries({ queryKey: ['ai-insights'] });
  void client.removeQueries({ queryKey: ['fleet'] });
}

/** Drop cached Eso Pay data — does not touch monitoring queries. */
export function clearEsoPayQueryCache(client: QueryClient): void {
  void client.removeQueries({ queryKey: esoPayKeys.all });
}
