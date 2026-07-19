import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'esopay:notifications:';

export type NotificationPreferences = {
  billReminders: boolean;
  paymentAlerts: boolean;
  promotionalOffers: boolean;
};

const DEFAULTS: NotificationPreferences = {
  billReminders: true,
  paymentAlerts: true,
  promotionalOffers: false,
};

function storageKey(userId: string): string {
  return `${PREFIX}${userId}`;
}

export async function getNotificationPreferences(
  userId: string,
): Promise<NotificationPreferences> {
  if (!userId) return DEFAULTS;
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

export async function setNotificationPreferences(
  userId: string,
  prefs: NotificationPreferences,
): Promise<void> {
  if (!userId) return;
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(prefs));
}

export async function clearNotificationPreferences(userId: string): Promise<void> {
  if (!userId) return;
  try {
    await AsyncStorage.removeItem(storageKey(userId));
  } catch {
    // Best-effort clear.
  }
}
