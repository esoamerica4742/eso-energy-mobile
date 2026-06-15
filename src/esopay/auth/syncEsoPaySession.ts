import type { Session } from '@supabase/supabase-js';
import { esoPaySupabase, esoPaySupabaseConfigured } from '@/esopay/lib/supabasePay';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import {
  clearEsoPaySessionBackup,
  persistEsoPaySessionBackup,
} from '@/esopay/auth/esoPaySessionBackup';
import { clearPersistedEsoPayUserId, persistEsoPayUserId } from '@/esopay/auth/esoPayUserId';
import { detachMonitoringSessionAfterEsoPayLogin } from '@/lib/auth/detachMonitoringSession';
import { clearEsoPayUserProfile } from '@/esopay/storage/esoPayUserProfileStorage';

export async function establishEsoPaySession(session: Session): Promise<void> {
  if (!esoPaySupabaseConfigured) {
    throw new Error('Eso Pay Supabase is not configured');
  }

  const { data, error } = await esoPaySupabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  if (error) throw error;

  const active = data.session ?? session;
  const store = useEsoPayAuthStore.getState();
  store.lockSignedIn();
  store.setSession(active);
  store.setHydrated(true);
  store.setLoading(false);
  await persistEsoPaySessionBackup(active);
  if (active.user?.id) await persistEsoPayUserId(active.user.id);

  const { data: check } = await esoPaySupabase.auth.getSession();
  if (!check.session) {
    throw new Error('Eso Pay session did not persist on this device');
  }
}

export function clearEsoPaySession(): void {
  const store = useEsoPayAuthStore.getState();
  store.unlockSignedIn();
  store.setSession(null);
  void clearEsoPaySessionBackup();
  void clearPersistedEsoPayUserId();
  if (esoPaySupabaseConfigured) {
    void esoPaySupabase.auth.signOut();
  }
}

export async function completeEsoPayEmailSignIn(session: Session): Promise<void> {
  await establishEsoPaySession(session);
  await detachMonitoringSessionAfterEsoPayLogin();

  const { data } = await esoPaySupabase.auth.getSession();
  if (!data.session) {
    await establishEsoPaySession(session);
  }
}
