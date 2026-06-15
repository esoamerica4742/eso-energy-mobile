/**
 * Reference handlers for eso-pay-api — forgot-PIN recovery.
 *
 * POST /security/transaction-pin/recovery/begin
 *   Response: { ok: true, recovery_until: string }
 *
 * POST /security/transaction-pin/reset
 *   Body: { pin: string }
 *   Response: { ok: true, configured: boolean, locked: boolean, ... }
 *
 * Mobile: beginEsoPayPinRecovery() after email OTP; resetPinForRecovery() on activate.
 */

export type BeginPinRecoveryResult = { ok: true; recovery_until: string };

export type ResetPinBody = { pin: string };
