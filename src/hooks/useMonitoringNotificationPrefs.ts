import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_MONITORING_NOTIFICATION_PREFS,
  loadMonitoringNotificationPrefs,
  saveMonitoringNotificationPrefs,
  type MonitoringNotificationPrefs,
} from '@/lib/monitoring/notificationPrefs';

export function useMonitoringNotificationPrefs() {
  const [prefs, setPrefs] = useState<MonitoringNotificationPrefs>(
    DEFAULT_MONITORING_NOTIFICATION_PREFS,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void loadMonitoringNotificationPrefs().then((loaded) => {
      if (!cancelled) {
        setPrefs(loaded);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const updatePrefs = useCallback(async (patch: Partial<MonitoringNotificationPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    await saveMonitoringNotificationPrefs(next);
  }, [prefs]);

  return { prefs, loading, updatePrefs };
}
