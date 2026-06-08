import { useCallback, useEffect } from 'react';

import { Platform } from 'react-native';

import Constants from 'expo-constants';

import type { PowerShieldMeter } from '@/esopay/api/types';

import { useRegisterPowerShieldPush } from '@/esopay/hooks/usePowerShield';

import { isPushSupportedInRuntime } from '@/hooks/usePushNotifications';



type NotificationsModule = typeof import('expo-notifications');



async function loadNotifications(): Promise<NotificationsModule | null> {

  if (!isPushSupportedInRuntime()) return null;

  try {

    return await import('expo-notifications');

  } catch {

    return null;

  }

}



function getProjectId(): string | null {

  const extra = Constants.expoConfig?.extra as { easProjectId?: string; eas?: { projectId?: string } } | undefined;

  return extra?.easProjectId ?? extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? null;

}



async function ensurePowerShieldChannel(Notifications: NotificationsModule): Promise<void> {
  if (Platform.OS !== 'android') return;

  // Used for 10% warning heads-up banners.
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

  // Used for 5% critical siren alerts (bypass DND).
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



/** Register Expo push token with Eso Pay backend (capacity alerts via server + Termii SMS). */

export async function registerPowerShieldRemotePush(

  registerPush: { mutateAsync: (body: {

    expo_push_token: string;

    platform: string;

    app_version?: string;

    power_shield_enabled?: boolean;

  }) => Promise<unknown> },

): Promise<boolean> {

  const Notifications = await loadNotifications();

  if (!Notifications) return false;



  const projectId = getProjectId();

  if (!projectId) return false;



  await ensurePowerShieldChannel(Notifications);



  const perm = await Notifications.getPermissionsAsync();

  let status = perm.status;

  if (status !== 'granted') {

    status = (await Notifications.requestPermissionsAsync()).status;

  }

  if (status !== 'granted') return false;



  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  if (!token) return false;



  await registerPush.mutateAsync({

    expo_push_token: token,

    platform: Platform.OS,

    app_version: Constants.expoConfig?.version ?? '1.0.0',

    power_shield_enabled: true,

  });

  return true;

}



type Options = {

  /** When false, skips push registration. */

  enabled?: boolean;

};



/**

 * Registers device for server-driven Power Shield push/SMS (10% / 5% capacity tiers).

 * Local time-based scheduling was removed in engine v3.

 */

export function usePowerShieldNotifications(

  meters: PowerShieldMeter[] | undefined,

  options?: Options,

) {

  const registerPush = useRegisterPowerShieldPush();

  const enabled = options?.enabled !== false && (meters?.length ?? 0) > 0;



  const registerRemote = useCallback(async () => {

    if (!enabled) return false;

    return registerPowerShieldRemotePush(registerPush);

  }, [enabled, registerPush]);



  useEffect(() => {

    if (!enabled) return;

    void registerRemote();

  }, [enabled, registerRemote]);



  return { registerRemote };

}


