/**
 * Leaf storage helpers for Eso Pay session backup — no store imports.
 * Keeps store ↔ backup restore helpers from forming a require cycle.
 */
import type { Session } from '@supabase/supabase-js';
import { getSecureJson, removeSecureItem, setSecureJson } from '@/lib/secureStorage';

export const ESOPAY_SESSION_BACKUP_KEY = 'esopay_session_backup';

export type EsoPaySessionBackup = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
};

export async function persistEsoPaySessionBackup(session: Session): Promise<void> {
  if (!session.access_token || !session.refresh_token) return;
  await setSecureJson<EsoPaySessionBackup>(ESOPAY_SESSION_BACKUP_KEY, {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
  });
}

export async function clearEsoPaySessionBackup(): Promise<void> {
  await removeSecureItem(ESOPAY_SESSION_BACKUP_KEY);
}

export async function readEsoPaySessionBackup(): Promise<EsoPaySessionBackup | null> {
  return getSecureJson<EsoPaySessionBackup>(ESOPAY_SESSION_BACKUP_KEY);
}
