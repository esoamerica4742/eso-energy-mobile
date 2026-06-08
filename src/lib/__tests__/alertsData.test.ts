import type { Alert } from '@/stores/alertStore';
import {
  buildAlertsSnapshot,
  filterAlerts,
  formatAlertAge,
} from '@/lib/alertsData';

const alerts: Alert[] = [
  {
    id: 'a1',
    device_id: 'd1',
    site_id: 's1',
    severity: 'critical',
    message: 'Inverter fault detected',
    timestamp: new Date(Date.now() - 120_000).toISOString(),
    acknowledged: false,
  },
  {
    id: 'a2',
    device_id: 'd2',
    site_id: 's1',
    severity: 'warning',
    message: 'Grid export threshold approaching',
    timestamp: new Date(Date.now() - 3_600_000).toISOString(),
    acknowledged: false,
  },
  {
    id: 'a3',
    device_id: 'd3',
    site_id: 's2',
    severity: 'info',
    message: 'Battery reserve mode active',
    timestamp: new Date(Date.now() - 86_400_000).toISOString(),
    acknowledged: true,
  },
];

describe('alertsData', () => {
  it('builds snapshot counts by severity', () => {
    const snapshot = buildAlertsSnapshot(alerts, 2);
    expect(snapshot.totalActive).toBe(3);
    expect(snapshot.criticalCount).toBe(1);
    expect(snapshot.warningCount).toBe(1);
    expect(snapshot.infoCount).toBe(1);
    expect(snapshot.statusLabel).toBe('ACTION');
  });

  it('filters alerts by severity', () => {
    expect(filterAlerts(alerts, 'warning')).toHaveLength(1);
    expect(filterAlerts(alerts, 'all')).toHaveLength(3);
  });

  it('formats alert age', () => {
    const ts = new Date(Date.now() - 90_000).toISOString();
    expect(formatAlertAge(ts)).toBe('1m ago');
  });
});
