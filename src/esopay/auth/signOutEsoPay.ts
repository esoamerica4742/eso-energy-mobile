import { clearEsoPaySession } from '@/esopay/auth/syncEsoPaySession';

/**
 * Clears Eso Pay local auth flags only — does not sign out Supabase / Monitoring.
 * For full account sign-out use `signOutUnified`.
 */
export async function signOutEsoPay(): Promise<void> {
  clearEsoPaySession();
}
