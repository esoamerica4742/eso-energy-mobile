import { useCallback, useState } from 'react';

export type ReportExportPhase = 'idle' | 'exporting' | 'ready' | 'error';

/**
 * Optimistic report export — shows exporting state immediately, then ready.
 */
export function useReportExport() {
  const [phaseById, setPhaseById] = useState<Record<string, ReportExportPhase>>({});

  const exportReport = useCallback(async (exportId: string, run?: () => Promise<void>) => {
    setPhaseById((s) => ({ ...s, [exportId]: 'exporting' }));
    try {
      if (run) await run();
      await new Promise((r) => setTimeout(r, 600));
      setPhaseById((s) => ({ ...s, [exportId]: 'ready' }));
    } catch {
      setPhaseById((s) => ({ ...s, [exportId]: 'error' }));
    }
  }, []);

  const phaseFor = useCallback((exportId: string) => phaseById[exportId] ?? 'idle', [phaseById]);

  return { exportReport, phaseFor };
}
