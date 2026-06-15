import type { Session } from '@supabase/supabase-js';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import {
  persistEsoPaySessionBackup,
} from '@/esopay/auth/esoPaySessionBackup';
import { persistEsoPayUserId } from '@/esopay/auth/esoPayUserId';
import { useAuthStore } from '@/stores/authStore';

/**
 * One Supabase user unlocks Monitoring and Eso Pay on this device.
 */
export async function establishUnifiedSession(session: Session): Promise<void> {
  const monitoring = useAuthStore.getState();
  monitoring.setSession(session);
  monitoring.setLoading(false);

  const esoPay = useEsoPayAuthStore.getState();
  esoPay.lockSignedIn();
  esoPay.setSession(session);
  esoPay.setHydrated(true);
  esoPay.setLoading(false);

  await persistEsoPaySessionBackup(session);
  if (session.user?.id) {
    await persistEsoPayUserId(session.user.id);
  }
}

export async function clearUnifiedSession(): Promise<void> {
  useAuthStore.getState().reset();
  const esoPay = useEsoPayAuthStore.getState();
  esoPay.unlockSignedIn();
  esoPay.setSession(null);
  esoPay.setPinSessionUnlocked(false);
}
