import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useMasterSessionStore } from '@/master/masterSessionStore';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import { useAuthStore } from '@/stores/authStore';

/** Re-lock the app when returning from background if a master session exists. */
export function useMasterPinLock() {
  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next !== 'background' && next !== 'inactive') return;
      const hasSession =
        Boolean(useAuthStore.getState().session) &&
        useEsoPayAuthStore.getState().signedIn;
      if (!hasSession) return;
      useMasterSessionStore.getState().setPinUnlocked(false);
      useEsoPayAuthStore.getState().setPinSessionUnlocked(false);
    };

    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);
}
