import { useMemo } from 'react';
import { formatRelativeSyncLabel } from '@/lib/monitor/connectionStatus';
import { useRelativeSyncClock } from '@/hooks/useRelativeSyncClock';

/** Relative "5m ago" label that ticks without re-rendering parent dashboards. */
export function useRelativeSyncLabel(updatedAt: string | null | undefined): string {
  const tick = useRelativeSyncClock();
  return useMemo(() => {
    void tick;
    return formatRelativeSyncLabel(updatedAt);
  }, [tick, updatedAt]);
}
