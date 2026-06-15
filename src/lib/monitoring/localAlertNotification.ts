import { Platform } from 'react-native';
import type { Alert } from '@/stores/alertStore';
import { shouldShowMonitoringAlert } from '@/lib/monitoring/notificationPrefs';

export async function presentLocalMonitoringAlert(alert: Alert): Promise<void> {
  if (alert.acknowledged) return;
  const allowed = await shouldShowMonitoringAlert(alert.severity);
  if (!allowed) return;

  try {
    const Notifications = await import('expo-notifications');
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alerts', {
        name: 'Fleet Alerts',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: alert.message,
        body: alert.detail ?? 'Fleet telemetry alert',
        data: { alertId: alert.id, route: '/(tabs)/alerts' },
        sound: alert.severity === 'critical' ? 'default' : undefined,
      },
      trigger: null,
    });
  } catch {
    // Local notification is best-effort when app is foregrounded.
  }
}
