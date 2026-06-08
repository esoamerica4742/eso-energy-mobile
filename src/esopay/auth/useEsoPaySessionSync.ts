import { useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { esoPaySupabase, esoPaySupabaseConfigured } from '@/esopay/lib/supabasePay';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import { getSecureJson } from '@/lib/secureStorage';
import { persistEsoPaySessionBackup, restoreEsoPaySessionFromBackup } from '@/esopay/auth/esoPaySessionBackup';
import { recoverEsoPaySession } from '@/esopay/auth/recoverEsoPaySession';

const SESSION_BOOT_TIMEOUT_MS = 6500;
const BACKUP_KEY = 'esopay_session_backup';

export function useEsoPaySessionSync() {
  const setSession = useEsoPayAuthStore((s) => s.setSession);
  const setLoading = useEsoPayAuthStore((s) => s.setLoading);
  const setHydrated = useEsoPayAuthStore((s) => s.setHydrated);
  const lockSignedIn = useEsoPayAuthStore((s) => s.lockSignedIn);

  useEffect(() => {
    if (!esoPaySupabaseConfigured) {
      useEsoPayAuthStore.getState().unlockSignedIn();
      setHydrated(true);
      setLoading(false);
      return;
    }

    let mounted = true;
    let settled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const finishBoot = () => {
      if (!mounted || settled) return;
      settled = true;
      if (timeout) clearTimeout(timeout);
      setLoading(false);
      setHydrated(true);
    };

    const applySession = (session: Session) => {
      if (!mounted) return;
      lockSignedIn();
      setSession(session);
      void persistEsoPaySessionBackup(session);
      finishBoot();
    };

    const bootstrap = async () => {
      const { data } = await esoPaySupabase.auth.getSession();
      if (!mounted) return;

      if (data.session) {
        applySession(data.session);
        return;
      }

      const backup = await getSecureJson<{ refresh_token?: string }>(BACKUP_KEY);
      if (backup?.refresh_token) {
        const restored = await restoreEsoPaySessionFromBackup();
        if (restored && mounted) {
          applySession(restored);
          return;
        }
      }

      const recovered = await recoverEsoPaySession();
      if (recovered && mounted) {
        applySession(recovered);
        return;
      }

      finishBoot();
    };

    timeout = setTimeout(() => finishBoot(), SESSION_BOOT_TIMEOUT_MS);

    const { data: sub } = esoPaySupabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
        if (useEsoPayAuthStore.getState().signedIn) {
          void recoverEsoPaySession();
        }
        return;
      }

      if (session) {
        applySession(session);
      }
    });

    void bootstrap().catch(() => finishBoot());

    return () => {
      mounted = false;
      settled = true;
      if (timeout) clearTimeout(timeout);
      sub.subscription.unsubscribe();
    };
  }, [lockSignedIn, setHydrated, setLoading, setSession]);
}
