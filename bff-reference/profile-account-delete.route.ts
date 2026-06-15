/**
 * Reference handler for eso-pay-api — wire into your Supabase Edge Function router.
 *
 * Route: DELETE /profile/account
 * Response: { ok: boolean }
 *
 * Mobile client: src/esopay/api/client.ts → profile.deleteAccount
 *
 * Production checklist:
 * - Reject if wallet balance_kobo > 0
 * - Soft-delete or flag user profile; revoke Monnify reserved account per policy
 * - Clear server-side transaction PIN hash
 */

export type DeleteAccountResult = { ok: boolean; reason?: string };

export async function deleteAccountRoute(deps: {
  userId: string;
  walletBalanceKobo: number;
  closeWallet: (userId: string) => Promise<void>;
  clearTransactionPin: (userId: string) => Promise<void>;
}): Promise<DeleteAccountResult> {
  if (deps.walletBalanceKobo > 0) {
    return {
      ok: false,
      reason: 'Withdraw or spend your wallet balance before closing your account.',
    };
  }
  await deps.clearTransactionPin(deps.userId);
  await deps.closeWallet(deps.userId);
  return { ok: true };
}
