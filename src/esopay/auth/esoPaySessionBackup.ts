import type { Session } from '@supabase/supabase-js';
import { getSecureItem, getSecureJson, removeSecureItem, setSecureJson, toSecureStoreKey } from '@/lib/secureStorage';
import { esoPaySupabase, esoPaySupabaseConfigured } from '@/esopay/lib/supabasePay';
import { persistEsoPayUserId } from '@/esopay/auth/esoPayUserId';
import { useEsoPayAuthStore } from '@/esopay/auth/store';

const BACKUP_KEY = 'esopay_session_backup';
/** Supabase auth blob written by esoPaySupabase (`createSupabaseSecureStorage('esopay_auth')`). */
const ESOPAY_AUTH_STORAGE_KEY = toSecureStoreKey('esopay_auth_supabase.auth.token');

type SessionBackup = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
};

type StoredAuthBlob = SessionBackup & {
  user?: Session['user'];
};

function parseStoredAuthBlob(raw: string): StoredAuthBlob | null {
  try {
    const parsed = JSON.parse(raw) as
      | StoredAuthBlob
      | { currentSession?: StoredAuthBlob; session?: StoredAuthBlob };
    if ('access_token' in parsed && parsed.access_token && parsed.refresh_token) {
      return parsed;
    }
    return parsed.currentSession ?? parsed.session ?? null;
  } catch {
    return null;
  }
}

/** Read JWT directly from SecureStore when the Supabase client memory is empty. */
export async function restoreEsoPaySessionFromAuthStorage(): Promise<Session | null> {
  if (!esoPaySupabaseConfigured) return null;

  const raw = await getSecureItem(ESOPAY_AUTH_STORAGE_KEY);
  if (!raw) return null;

  const blob = parseStoredAuthBlob(raw);
  if (!blob?.access_token || !blob.refresh_token) return null;

  const { data, error } = await esoPaySupabase.auth.setSession({
    access_token: blob.access_token,
    refresh_token: blob.refresh_token,
  });

  if (error || !data.session) return null;

  const store = useEsoPayAuthStore.getState();
  store.lockSignedIn();
  store.setSession(data.session);
  store.setHydrated(true);
  store.setLoading(false);
  await persistEsoPaySessionBackup(data.session);
  if (data.session.user?.id) await persistEsoPayUserId(data.session.user.id);
  return data.session;
}

export async function persistEsoPaySessionBackup(session: Session): Promise<void> {
  if (!session.access_token || !session.refresh_token) return;
  await setSecureJson<SessionBackup>(BACKUP_KEY, {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
  });
}

export async function clearEsoPaySessionBackup(): Promise<void> {
  await removeSecureItem(BACKUP_KEY);
}

/** Restore Supabase client + Zustand from secure backup when client storage is empty. */
export async function restoreEsoPaySessionFromBackup(): Promise<Session | null> {
  if (!esoPaySupabaseConfigured) return null;

  const backup = await getSecureJson<SessionBackup>(BACKUP_KEY);
  if (!backup?.access_token || !backup?.refresh_token) return null;

  const { data, error } = await esoPaySupabase.auth.setSession({
    access_token: backup.access_token,
    refresh_token: backup.refresh_token,
  });

  if (error || !data.session) return null;

  const store = useEsoPayAuthStore.getState();
  store.lockSignedIn();
  store.setSession(data.session);
  store.setHydrated(true);
  store.setLoading(false);
  await persistEsoPaySessionBackup(data.session);
  if (data.session.user?.id) await persistEsoPayUserId(data.session.user.id);
  return data.session;
}

/** Re-apply the in-memory session to the isolated Supabase client (after spurious SIGNED_OUT). */
export async function rehydrateEsoPayClientFromStore(): Promise<boolean> {
  const session = useEsoPayAuthStore.getState().session;
  if (!session?.access_token || !session.refresh_token) return false;

  const { data, error } = await esoPaySupabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  if (error || !data.session) return false;

  useEsoPayAuthStore.getState().setSession(data.session);
  await persistEsoPaySessionBackup(data.session);
  return true;
}
