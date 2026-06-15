import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AlertSeverity } from '@/stores/alertStore';
import { supabase, supabaseConfigured } from '@/lib/supabase';

const STORAGE_KEY = 'monitoring.notification.prefs.v1';

export type MonitoringNotificationPrefs = {
  criticalEnabled: boolean;
  warningEnabled: boolean;
  infoEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
};

export const DEFAULT_MONITORING_NOTIFICATION_PREFS: MonitoringNotificationPrefs = {
  criticalEnabled: true,
  warningEnabled: true,
  infoEnabled: false,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  timezone: 'Africa/Lagos',
};

function isQuietHours(prefs: MonitoringNotificationPrefs, now = new Date()): boolean {
  if (!prefs.quietHoursEnabled) return false;
  const [startH, startM] = prefs.quietHoursStart.split(':').map(Number);
  const [endH, endM] = prefs.quietHoursEnd.split(':').map(Number);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  if (start <= end) return minutes >= start && minutes < end;
  return minutes >= start || minutes < end;
}

export async function loadMonitoringNotificationPrefs(): Promise<MonitoringNotificationPrefs> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MONITORING_NOTIFICATION_PREFS;
    return { ...DEFAULT_MONITORING_NOTIFICATION_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_MONITORING_NOTIFICATION_PREFS;
  }
}

export async function saveMonitoringNotificationPrefs(
  prefs: MonitoringNotificationPrefs,
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  if (!supabaseConfigured) return;

  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  if (!userId) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', userId)
    .maybeSingle();

  if (!profile?.company_id) return;

  await supabase.from('monitoring_notification_prefs').upsert({
    user_id: userId,
    company_id: profile.company_id,
    critical_enabled: prefs.criticalEnabled,
    warning_enabled: prefs.warningEnabled,
    info_enabled: prefs.infoEnabled,
    quiet_hours_enabled: prefs.quietHoursEnabled,
    quiet_hours_start: prefs.quietHoursStart,
    quiet_hours_end: prefs.quietHoursEnd,
    timezone: prefs.timezone,
    updated_at: new Date().toISOString(),
  });
}

export async function shouldShowMonitoringAlert(severity: AlertSeverity): Promise<boolean> {
  const prefs = await loadMonitoringNotificationPrefs();
  if (isQuietHours(prefs)) return severity === 'critical' && prefs.criticalEnabled;
  if (severity === 'critical') return prefs.criticalEnabled;
  if (severity === 'warning') return prefs.warningEnabled;
  return prefs.infoEnabled;
}
