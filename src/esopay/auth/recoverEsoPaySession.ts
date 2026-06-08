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

const BACKUP_KEY = 'esopay_session_backup';

type SessionBackup = {
  access_token: string;
  refresh_token: string;
};

/**
 * Best-effort session restore — never clears signedIn.
 * Call after SIGNED_OUT, before auth redirects, and on a timer while on billing.
 */
export async function recoverEsoPaySession(): Promise<Session | null> {
  if (!esoPaySupabaseConfigured) return null;

  const store = useEsoPayAuthStore.getState();
  if (!store.signedIn) return store.session;

  const { data: live } = await esoPaySupabase.auth.getSession();
  if (live.session) {
    store.setSession(live.session);
    if (live.session.user?.id) await persistEsoPayUserId(live.session.user.id);
    return live.session;
  }

  if (await rehydrateEsoPayClientFromStore()) {
    return useEsoPayAuthStore.getState().session;
  }

  const fromAuthStorage = await restoreEsoPaySessionFromAuthStorage();
  if (fromAuthStorage) return fromAuthStorage;

  const restored = await restoreEsoPaySessionFromBackup();
  if (restored) return restored;

  const backup = await getSecureJson<SessionBackup>(BACKUP_KEY);
  if (backup?.refresh_token) {
    const { data, error } = await esoPaySupabase.auth.refreshSession({
      refresh_token: backup.refresh_token,
    });
    if (!error && data.session) {
      store.setSession(data.session);
      await persistEsoPaySessionBackup(data.session);
      return data.session;
    }
  }

  return store.session;
}
