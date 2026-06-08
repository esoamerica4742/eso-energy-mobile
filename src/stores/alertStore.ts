/**
 * Realtime alert cache.
 * New alerts from Supabase are prepended so the list is always newest-first.
 */
import { create } from 'zustand';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  device_id: string;
  site_id: string;
  severity: AlertSeverity;
  message: string;
  detail?: string;
  timestamp: string;
  acknowledged: boolean;
}

interface AlertState {
  alerts: Alert[];
  unreadCount: number;

  seed: (alerts: Alert[]) => void;
  prepend: (alert: Alert) => void;
  acknowledge: (id: string) => void;
  setAcknowledged: (id: string, acknowledged: boolean) => void;
  acknowledgeAll: () => void;
  clearOlderThan: (ms: number) => void;
}

const MAX_ALERTS = 200;

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  unreadCount: 0,

  seed: (incoming) =>
    set({
      alerts: incoming.slice(0, MAX_ALERTS),
      unreadCount: incoming.filter((a) => !a.acknowledged).length,
    }),

  prepend: (alert) =>
    set((s) => {
      if (s.alerts.some((existing) => existing.id === alert.id)) return s;
      const next = [alert, ...s.alerts].slice(0, MAX_ALERTS);
      return {
        alerts: next,
        unreadCount: s.unreadCount + (alert.acknowledged ? 0 : 1),
      };
    }),

  acknowledge: (id) =>
    set((s) => {
      const target = s.alerts.find((alert) => alert.id === id);
      if (!target || target.acknowledged) return s;
      return {
        alerts: s.alerts.map((alert) => (alert.id === id ? { ...alert, acknowledged: true } : alert)),
        unreadCount: Math.max(0, s.unreadCount - 1),
      };
    }),

  setAcknowledged: (id, acknowledged) =>
    set((s) => {
      const target = s.alerts.find((alert) => alert.id === id);
      if (!target || target.acknowledged === acknowledged) return s;
      const alerts = s.alerts.map((alert) =>
        alert.id === id ? { ...alert, acknowledged } : alert,
      );
      return {
        alerts,
        unreadCount: alerts.filter((a) => !a.acknowledged).length,
      };
    }),

  acknowledgeAll: () =>
    set((s) => ({
      alerts: s.alerts.map((a) => ({ ...a, acknowledged: true })),
      unreadCount: 0,
    })),

  clearOlderThan: (ms) => {
    const cutoff = Date.now() - ms;
    set((s) => ({
      alerts: s.alerts.filter((a) => new Date(a.timestamp).getTime() > cutoff),
    }));
  },
}));

export const SEVERITY_ORDER: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 };

/**
 * Pure sort helper — call this inside useMemo in components.
 * NEVER pass this directly as a Zustand selector: it creates a new array
 * on every call, which breaks React 18 useSyncExternalStore.
 */
export function sortAlerts(alerts: Alert[]): Alert[] {
  return [...alerts].sort((a, b) => {
    const sd = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (sd !== 0) return sd;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}
