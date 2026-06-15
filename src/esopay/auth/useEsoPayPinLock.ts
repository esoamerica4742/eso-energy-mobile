import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { selectEsoPayHasAccess, useEsoPayAuthStore } from '@/esopay/auth/store';

const LOCK_STATES: AppStateStatus[] = ['background', 'inactive'];

/** Re-lock transaction PIN when Eso Pay leaves the foreground. */
export function useEsoPayPinLock() {
  const signedIn = useEsoPayAuthStore(selectEsoPayHasAccess);
  const lockSession = useEsoPayAuthStore((s) => s.setPinSessionUnlocked);

  useEffect(() => {
    if (!signedIn) return;

    const onAppState = (state: AppStateStatus) => {
      if (LOCK_STATES.includes(state)) {
        lockSession(false);
      }
    };

    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, [lockSession, signedIn]);
}
