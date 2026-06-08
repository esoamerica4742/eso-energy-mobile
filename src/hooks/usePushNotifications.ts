import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import Constants from 'expo-constants';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { enodeClient } from '@/services/enode';
import { useEnodeToast } from '@/providers/EnodeToastProvider';

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

type PushRegistrationState = {
  enabled: boolean;
  expoPushToken: string | null;
  permissionStatus: PermissionStatus;
};

type NotificationsModule = typeof import('expo-notifications');

/** Remote push was removed from Expo Go in SDK 53+. SDK 51 still supports it. */
export function isPushSupportedInRuntime(): boolean {
  if (!Constants.isDevice) return false;
  if (Constants.appOwnership === 'expo') {
    const sdk = Number.parseInt(String(Constants.expoConfig?.sdkVersion ?? '0'), 10);
    if (sdk >= 53) return false;
  }
  return true;
}

function getProjectId(): string | null {
  const explicitProjectId = Constants?.expoConfig?.extra?.easProjectId;
  const easProjectId = Constants?.expoConfig?.extra?.eas?.projectId;
  const legacyProjectId = Constants?.easConfig?.projectId;
  return explicitProjectId ?? easProjectId ?? legacyProjectId ?? null;
}

let notificationsModule: NotificationsModule | null = null;
let handlerConfigured = false;

async function loadNotificationsModule(): Promise<NotificationsModule | null> {
  if (!isPushSupportedInRuntime()) return null;
  if (notificationsModule) return notificationsModule;

  try {
    notificationsModule = await import('expo-notifications');
    if (!handlerConfigured) {
      notificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
      handlerConfigured = true;
    }
    return notificationsModule;
  } catch {
    return null;
  }
}

export function usePushNotifications() {
  const { isAuthenticated } = useSupabaseSession();
  const toast = useEnodeToast();
  const pushSupported = isPushSupportedInRuntime();
  const [state, setState] = useState<PushRegistrationState>({
    enabled: false,
    expoPushToken: null,
    permissionStatus: 'undetermined',
  });
  const registeredRef = useRef(false);

  const register = useCallback(async () => {
    if (!pushSupported || !isAuthenticated) return;

    const Notifications = await loadNotificationsModule();
    if (!Notifications) return;

    const projectId = getProjectId();
    if (!projectId) return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alerts', {
        name: 'Fleet Alerts',
        description: 'Critical inverter and telemetry alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 220, 120, 220],
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
        enableVibrate: true,
        showBadge: true,
      });
    }

    const current = await Notifications.getPermissionsAsync();
    let permission = current.status as PermissionStatus;
    if (permission !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      permission = requested.status as PermissionStatus;
    }

    setState((s) => ({ ...s, permissionStatus: permission }));
    if (permission !== 'granted') return;

    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenResponse.data;
    if (!token) return;

    setState({
      enabled: true,
      expoPushToken: token,
      permissionStatus: permission,
    });

    if (!registeredRef.current) {
      try {
        await enodeClient.registerPushToken({
          expoPushToken: token,
          platform: Platform.OS,
          appVersion: Constants.expoConfig?.version ?? '1.0.0',
        });
        registeredRef.current = true;
      } catch {
        // Keep local notification capability even if backend registration is not live yet.
      }
    }
  }, [isAuthenticated, pushSupported]);

  useEffect(() => {
    if (!pushSupported) return;
    void register();
  }, [pushSupported, register]);

  useEffect(() => {
    if (!pushSupported) return;

    let receivedSub: { remove: () => void } | undefined;
    let responseSub: { remove: () => void } | undefined;
    let cancelled = false;

    void (async () => {
      const Notifications = await loadNotificationsModule();
      if (!Notifications || cancelled) return;

      receivedSub = Notifications.addNotificationReceivedListener((notification) => {
        const title = notification.request.content.title ?? 'New alert';
        const body = notification.request.content.body ?? 'Energy telemetry update available.';
        toast.show(`${title}: ${body}`, 'warning');
      });
      responseSub = Notifications.addNotificationResponseReceivedListener(() => {
        // Deep-link routing can be added here when alert types are defined.
      });
    })();

    const appStateSub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        void register();
      }
    });

    return () => {
      cancelled = true;
      receivedSub?.remove();
      responseSub?.remove();
      appStateSub.remove();
    };
  }, [pushSupported, register, toast]);

  return useMemo(
    () => ({
      ...state,
      refreshRegistration: register,
      pushSupported,
    }),
    [pushSupported, register, state],
  );
}
