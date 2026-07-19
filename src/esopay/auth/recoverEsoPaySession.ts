import type { Session } from '@supabase/supabase-js';
import { getSecureJson } from '@/lib/secureStorage';
import { esoPaySupabase, esoPaySupabaseConfigured } from '@/esopay/lib/supabasePay';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import { persistEsoPayUserId } from '@/esopay/auth/esoPayUserId';
import {
  persistEsoPaySessionBackup,
  rehydrateEsoPayClientFromStore,
  restoreEsoPaySessionFromAuthStorage,
  restoreEsoPaySessionFromBackup,
} from '@/esopay/auth/esoPaySessionBackup';
import { useAuthStore } from '@/stores/authStore';

const BACKUP_KEY = 'esopay_session_backup';

type SessionBackup = {
  access_token: string;
  refresh_token: string;
};

function adoptSession(store: ReturnType<typeof useEsoPayAuthStore.getState>, session: Session) {
  store.lockSignedIn();
  store.setSession(session);
  if (session.user?.id) void persistEsoPayUserId(session.user.id);
}

/**
 * Best-effort session restore — never clears signedIn.
 * Also heals Pay store from a live Monitoring/unified Supabase session after product switch.
 */
export async function recoverEsoPaySession(): Promise<Session | null> {
  if (!esoPaySupabaseConfigured) return null;

  try {
    const store = useEsoPayAuthStore.getState();

    const { data: live } = await esoPaySupabase.auth.getSession();
    if (live.session) {
      adoptSession(store, live.session);
      return live.session;
    }

    const monitoringSession = useAuthStore.getState().session;
    if (monitoringSession?.access_token && monitoringSession.refresh_token) {
      const { data, error } = await esoPaySupabase.auth.setSession({
        access_token: monitoringSession.access_token,
        refresh_token: monitoringSession.refresh_token,
      });
      const active = data.session ?? monitoringSession;
      if (!error && active) {
        adoptSession(store, active);
        await persistEsoPaySessionBackup(active);
        return active;
      }
    }

    if (await rehydrateEsoPayClientFromStore()) {
      const next = useEsoPayAuthStore.getState();
      if (next.session) {
        next.lockSignedIn();
        return next.session;
      }
    }

    const fromAuthStorage = await restoreEsoPaySessionFromAuthStorage();
    if (fromAuthStorage) {
      adoptSession(useEsoPayAuthStore.getState(), fromAuthStorage);
      return fromAuthStorage;
    }

    const restored = await restoreEsoPaySessionFromBackup();
    if (restored) {
      adoptSession(useEsoPayAuthStore.getState(), restored);
      return restored;
    }

    const backup = await getSecureJson<SessionBackup>(BACKUP_KEY);
    if (backup?.refresh_token) {
      const { data, error } = await esoPaySupabase.auth.refreshSession({
        refresh_token: backup.refresh_token,
      });
      if (!error && data.session) {
        adoptSession(store, data.session);
        await persistEsoPaySessionBackup(data.session);
        return data.session;
      }
    }

    return useEsoPayAuthStore.getState().session;
  } catch {
    return useEsoPayAuthStore.getState().session;
  }
}
