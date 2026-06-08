import { useEffect, useState } from 'react';

/** Re-render relative timestamps (e.g. header "5m ago") every 30s. */
export function useRelativeSyncClock(tickMs = 30_000): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), tickMs);
    return () => clearInterval(id);
  }, [tickMs]);

  return tick;
}
