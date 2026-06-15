import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { isPushSupportedInRuntime } from '@/hooks/usePushNotifications';

type NotificationsModule = typeof import('expo-notifications');

export type EsoPayPushRegistrationResult = 'granted' | 'denied' | 'unsupported';

type RegisterPushFn = {
  mutateAsync: (body: {
    expo_push_token: string;
    platform: string;
    app_version?: string;
    power_shield_enabled?: boolean;
  }) => Promise<unknown>;
};

async function loadNotifications(): Promise<NotificationsModule | null> {
  if (!isPushSupportedInRuntime()) return null;
  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

function getProjectId(): string | null {
  const extra = Constants.expoConfig?.extra as
    | { easProjectId?: string; eas?: { projectId?: string } }
    | undefined;
  return extra?.easProjectId ?? extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? null;
}

async function ensureAndroidChannels(Notifications: NotificationsModule): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('esopay-payments', {
    name: 'Payment alerts',
    description: 'Bill payments, wallet credits, and transaction updates',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 120, 200],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    enableVibrate: true,
    showBadge: true,
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('power-shield-high', {
    name: 'Power Shield (High)',
    description: '10% remaining electricity warnings',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 120, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
    enableVibrate: true,
    showBadge: true,
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('power-shield-critical', {
    name: 'Power Shield (Critical)',
    description: '5% remaining emergency alerts (bypass DND)',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 200, 100, 200, 100, 200],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: true,
    enableVibrate: true,
    showBadge: true,
    sound: 'default',
  });
}

/**
 * Requests OS notification permission and registers the Expo push token with the Eso Pay BFF.
 */
export async function registerEsoPayRemotePush(
  registerPush: RegisterPushFn,
  options?: { powerShieldEnabled?: boolean },
): Promise<EsoPayPushRegistrationResult> {
  const Notifications = await loadNotifications();
  if (!Notifications) return 'unsupported';

  const projectId = getProjectId();
  if (!projectId) return 'unsupported';

  await ensureAndroidChannels(Notifications);

  const perm = await Notifications.getPermissionsAsync();
  let status = perm.status;
  if (status !== 'granted') {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') return 'denied';

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  if (!token) return 'denied';

  await registerPush.mutateAsync({
    expo_push_token: token,
    platform: Platform.OS,
    app_version: Constants.expoConfig?.version ?? '1.0.0',
    power_shield_enabled: options?.powerShieldEnabled ?? false,
  });

  return 'granted';
}
