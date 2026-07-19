import { useEffect, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';
import { useSegments } from 'expo-router';
import { isEsoPayHome } from '@/esopay/navigation/esoPayBack';
import { useEsoPayBack } from '@/esopay/navigation/useEsoPayBack';
import { useEnodeToast } from '@/providers/EnodeToastProvider';

const EXIT_CONFIRM_MS = 2000;

/** Android hardware back — double-tap to exit on Eso Pay home. */
export function EsoPayBackHandler() {
  const segments = useSegments();
  const goBack = useEsoPayBack();
  const toast = useEnodeToast();
  const lastHomeBackAt = useRef(0);

  useEffect(() => {
    if (!isEsoPayHome(segments)) {
      lastHomeBackAt.current = 0;
    }
  }, [segments]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    if (!segments.some((segment) => segment === 'billing')) return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isEsoPayHome(segments)) {
        const now = Date.now();
        if (now - lastHomeBackAt.current < EXIT_CONFIRM_MS) {
          BackHandler.exitApp();
          return true;
        }
        lastHomeBackAt.current = now;
        toast.show('Press back again to exit', 'info');
        return true;
      }

      goBack();
      return true;
    });

    return () => subscription.remove();
  }, [goBack, segments, toast]);

  return null;
}
