/**
 * Reference handler for eso-pay-api — wire into your Supabase Edge Function router.
 *
 * Route: POST /security/transaction-pin/verify
 * Body: { pin: string }
 * Response: { ok: boolean, configured: boolean, locked: boolean, locked_until: string | null, attempts_remaining: number }
 *
 * Mobile client: src/esopay/api/client.ts → security.verifyTransactionPin
 */

export type TransactionPinStatus = {
  configured: boolean;
  locked: boolean;
  locked_until: string | null;
  attempts_remaining: number;
};

export type VerifyPinBody = { pin: string };

export type VerifyPinResult = { ok: boolean } & TransactionPinStatus;

/** Integrate with your existing PIN hash + lockout store (same as bill pay verification). */
export async function verifyTransactionPinRoute(
  body: VerifyPinBody,
  deps: {
    getStatus: (userId: string) => Promise<TransactionPinStatus>;
    verifyHash: (userId: string, pin: string) => Promise<boolean>;
    recordFailedAttempt: (userId: string) => Promise<TransactionPinStatus>;
    clearAttempts: (userId: string) => Promise<void>;
    userId: string;
  },
): Promise<VerifyPinResult> {
  const status = await deps.getStatus(deps.userId);
  if (!status.configured) {
    return { ok: false, ...status };
  }
  if (status.locked) {
    return { ok: false, ...status };
  }

  const valid = await deps.verifyHash(deps.userId, body.pin);
  if (!valid) {
    const next = await deps.recordFailedAttempt(deps.userId);
    return { ok: false, ...next };
  }

  await deps.clearAttempts(deps.userId);
  const refreshed = await deps.getStatus(deps.userId);
  return { ok: true, ...refreshed, locked: false, attempts_remaining: 5 };
}
