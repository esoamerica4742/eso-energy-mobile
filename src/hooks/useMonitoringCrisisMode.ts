import { useMemo } from 'react';
import { useAlertStore } from '@/stores/alertStore';

/** Fleet crisis from unresolved critical monitoring alerts — no Eso Pay dependency. */
export function useMonitoringCrisisMode(siteId?: string | null): boolean {
  const alerts = useAlertStore((s) => s.alerts);

  return useMemo(() => {
    const critical = alerts.filter((a) => !a.acknowledged && a.severity === 'critical');
    if (!siteId) return critical.length > 0;
    return critical.some((a) => a.site_id === siteId);
  }, [alerts, siteId]);
}
