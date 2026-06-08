import { EsoPayApiError, patchEsoPayApiAuthToken } from '@/esopay/api/client';
import { getSecureJson } from '@/lib/secureStorage';
import { esoPaySupabase, esoPaySupabaseConfigured } from '@/esopay/lib/supabasePay';
import { persistEsoPaySessionBackup } from '@/esopay/auth/esoPaySessionBackup';
import { recoverEsoPaySession } from '@/esopay/auth/recoverEsoPaySession';
import { getPersistedEsoPayUserId } from '@/esopay/auth/esoPayUserId';
import { useEsoPayAuthStore } from '@/esopay/auth/store';

const BACKUP_KEY = 'esopay_session_backup';

async function authSessionMissingError(): Promise<EsoPayApiError> {
  const store = useEsoPayAuthStore.getState();
  const userId = store.user?.id ?? (await getPersistedEsoPayUserId());
  return new EsoPayApiError(
    userId
      ? 'Your Eso Pay session expired. Sign out and sign in again with your email code.'
      : 'Sign in to Eso Pay to continue.',
    401,
    'AUTH_SESSION_MISSING',
  );
}

/** Restore or refresh JWT from secure storage — safe when Supabase client memory is empty. */
export async function refreshEsoPayAccessToken(): Promise<string> {
  const recovered = await recoverEsoPaySession();
  if (recovered?.access_token) {
    patchEsoPayApiAuthToken(recovered.access_token);
    return recovered.access_token;
  }

  const fromStore = useEsoPayAuthStore.getState().session?.access_token;
  if (fromStore) {
    patchEsoPayApiAuthToken(fromStore);
    return fromStore;
  }

  if (esoPaySupabaseConfigured) {
    const backup = await getSecureJson<{ refresh_token?: string }>(BACKUP_KEY);
    if (backup?.refresh_token) {
      const { data, error } = await esoPaySupabase.auth.refreshSession({
        refresh_token: backup.refresh_token,
      });
      if (!error && data.session?.access_token) {
        const store = useEsoPayAuthStore.getState();
        store.lockSignedIn();
        store.setSession(data.session);
        await persistEsoPaySessionBackup(data.session);
        patchEsoPayApiAuthToken(data.session.access_token);
        return data.session.access_token;
      }
    }
  }

  throw await authSessionMissingError();
}

/** Restore JWT from secure storage and return a usable access token for the BFF. */
export async function ensureEsoPayApiSession(): Promise<string> {
  return refreshEsoPayAccessToken();
}
