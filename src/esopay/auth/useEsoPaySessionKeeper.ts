import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import { recoverEsoPaySession } from '@/esopay/auth/recoverEsoPaySession';

const REFRESH_INTERVAL_MS = 4 * 60 * 1000;

/** Keeps Eso Pay JWT fresh while signedIn — never signs the user out on failure. */
export function useEsoPaySessionKeeper() {
  const signedIn = useEsoPayAuthStore((s) => s.signedIn);

  useEffect(() => {
    if (!signedIn) return;

    void recoverEsoPaySession();

    const interval = setInterval(() => {
      void recoverEsoPaySession();
    }, REFRESH_INTERVAL_MS);

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') void recoverEsoPaySession();
    };

    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [signedIn]);
}
