import type { Alert, AlertSeverity } from '@/stores/alertStore';

export type AlertFilter = 'all' | AlertSeverity;

export type AlertsSnapshot = {
  totalActive: number;
  unreadCount: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  statusLabel: string;
  statusTone: 'live' | 'degraded' | 'offline';
};

const FILTER_LABEL: Record<AlertFilter, string> = {
  all: 'All',
  critical: 'Critical',
  warning: 'Warning',
  info: 'Info',
};

export function alertFilterLabel(filter: AlertFilter) {
  return FILTER_LABEL[filter];
}

export function formatAlertAge(timestamp: string, now = Date.now()) {
  const diff = Math.floor((now - new Date(timestamp).getTime()) / 1000);
  if (diff < 60) return `${Math.max(diff, 0)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function buildAlertsSnapshot(alerts: Alert[], unreadCount: number): AlertsSnapshot {
  const criticalCount = alerts.filter((alert) => alert.severity === 'critical').length;
  const warningCount = alerts.filter((alert) => alert.severity === 'warning').length;
  const infoCount = alerts.filter((alert) => alert.severity === 'info').length;

  const statusTone: AlertsSnapshot['statusTone'] =
    criticalCount > 0 ? 'degraded' : alerts.length > 0 ? 'live' : 'live';

  const statusLabel =
    criticalCount > 0 ? 'ACTION' : unreadCount > 0 ? 'MONITOR' : alerts.length > 0 ? 'ACTIVE' : 'CLEAR';

  return {
    totalActive: alerts.length,
    unreadCount,
    criticalCount,
    warningCount,
    infoCount,
    statusLabel,
    statusTone,
  };
}

export function filterAlerts(alerts: Alert[], filter: AlertFilter) {
  if (filter === 'all') return alerts;
  return alerts.filter((alert) => alert.severity === filter);
}

export function severityBorderColor(severity: AlertSeverity) {
  if (severity === 'critical') return '#EF4444';
  if (severity === 'warning') return '#F97316';
  return 'rgba(255,255,255,0.08)';
}

export function severityGlowColor(severity: AlertSeverity): 'gold' | 'mint' | 'none' {
  if (severity === 'critical') return 'none';
  if (severity === 'warning') return 'gold';
  return 'mint';
}

export function severityBorderVariant(severity: AlertSeverity): 'gold' | 'amber' | 'alert' | 'muted' {
  if (severity === 'critical') return 'alert';
  if (severity === 'warning') return 'amber';
  return 'muted';
}
