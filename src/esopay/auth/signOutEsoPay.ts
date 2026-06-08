import { clearEsoPaySession } from '@/esopay/auth/syncEsoPaySession';

/** Signs out Eso Pay only (keeps monitoring session if present). */
export async function signOutEsoPay(): Promise<void> {
  clearEsoPaySession();
}
