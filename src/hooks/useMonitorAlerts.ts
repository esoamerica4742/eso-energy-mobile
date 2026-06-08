import { useMemo } from 'react';
import { useAlertStore } from '@/stores/alertStore';

/**
 * Alert counts for Monitor / Alerts KPI strips (Option B — enode_alerts via alertStore).
 */
export function useMonitorAlerts() {
  const alerts = useAlertStore((s) => s.alerts);
  const unreadCount = useAlertStore((s) => s.unreadCount);

  return useMemo(() => {
    const active = alerts.filter((a) => !a.acknowledged);
    return {
      alerts,
      unreadCount,
      criticalCount: active.filter((a) => a.severity === 'critical').length,
      warningCount: active.filter((a) => a.severity === 'warning').length,
      infoCount: active.filter((a) => a.severity === 'info').length,
    };
  }, [alerts, unreadCount]);
}
