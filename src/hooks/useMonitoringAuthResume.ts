import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { isDemoModeActiveSync } from '@/providers/DemoModeProvider';
import { useAuthStore } from '@/stores/authStore';

/** Never block the monitoring UI longer than this after returning to foreground. */
const RESUME_LOADING_RELEASE_MS = 2500;

/**
 * Clears a stuck auth-store loading gate when the app resumes.
 * Prevents infinite spinners after backgrounding (esp. Expo Go dev reloads).
 */
export function useMonitoringAuthResume() {
  useEffect(() => {
    let releaseTimer: ReturnType<typeof setTimeout> | undefined;

    const releaseIfStuck = () => {
      if (isDemoModeActiveSync()) {
        useAuthStore.getState().setLoading(false);
        return;
      }

      const { session, tenant, loading } = useAuthStore.getState();
      if (!loading) return;

      if (session && tenant) {
        useAuthStore.getState().setLoading(false);
        return;
      }

      if (releaseTimer) clearTimeout(releaseTimer);
      releaseTimer = setTimeout(() => {
        const state = useAuthStore.getState();
        if (state.loading && (state.session || isDemoModeActiveSync())) {
          if (__DEV__) {
            console.debug('[auth] Resume timeout — releasing monitoring loading gate');
          }
          state.setLoading(false);
        }
      }, RESUME_LOADING_RELEASE_MS);
    };

    const onChange = (next: AppStateStatus) => {
      if (next === 'active') {
        releaseIfStuck();
      }
    };

    const sub = AppState.addEventListener('change', onChange);
    return () => {
      sub.remove();
      if (releaseTimer) clearTimeout(releaseTimer);
    };
  }, []);
}
