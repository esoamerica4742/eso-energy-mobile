import type { Session } from '@supabase/supabase-js';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import {
  clearEsoPaySessionBackup,
  persistEsoPaySessionBackup,
} from '@/esopay/auth/esoPaySessionBackup';
import { clearPersistedEsoPayUserId, persistEsoPayUserId } from '@/esopay/auth/esoPayUserId';
import { clearEsoPayUserProfile } from '@/esopay/storage/esoPayUserProfileStorage';
import { establishUnifiedSession } from '@/master/unifiedSession';

export async function establishEsoPaySession(session: Session): Promise<void> {
  await establishUnifiedSession(session);
}

export function clearEsoPaySession(): void {
  const store = useEsoPayAuthStore.getState();
  store.unlockSignedIn();
  store.setSession(null);
  store.setPinSessionUnlocked(false);
  void clearEsoPaySessionBackup();
  void clearPersistedEsoPayUserId();
  void clearEsoPayUserProfile();
}

export async function completeEsoPayEmailSignIn(session: Session): Promise<void> {
  await establishUnifiedSession(session);
}
