/**
 * Monnify integration surface for Eso Pay mobile.
 *
 * Monnify credentials and bill-payment APIs live server-side only (Supabase `eso-pay-api`).
 * The app debits your wallet via BFF routes — never call api.monnify.com from device.
 */
import type { EsoPayApiClient } from '@/esopay/api/useEsoPayApiClient';
import {
  parsePurchaseUtilityResponse,
  parseValidateUtilityAccountResponse,
} from '@/esopay/api/schemas';
import type {
  PurchaseUtilityRequest,
  PurchaseUtilityResponse,
  ValidateUtilityAccountRequest,
  ValidateUtilityAccountResponse,
} from '@/esopay/api/types';

export type MonnifyValidateInput = ValidateUtilityAccountRequest;
export type MonnifyValidateResult = ValidateUtilityAccountResponse;
export type MonnifyPurchaseInput = PurchaseUtilityRequest;
export type MonnifyPurchaseResult = PurchaseUtilityResponse;

/** Minimum meter/account digits before we hit the BFF validate endpoint. */
export const MONNIFY_ACCOUNT_MIN_LENGTH = 6;

export function isMonnifyAccountReady(accountNumber: string): boolean {
  const digits = accountNumber.replace(/\D/g, '');
  return digits.length >= MONNIFY_ACCOUNT_MIN_LENGTH;
}

/** Step 1 — resolve customer name + amount bounds via Monnify (server-side). */
export async function monnifyValidateAccount(
  api: EsoPayApiClient,
  input: MonnifyValidateInput,
): Promise<MonnifyValidateResult> {
  return parseValidateUtilityAccountResponse(await api.utilities.validateAccount(input));
}

/** Step 2 — debit wallet + execute Monnify bill payment (idempotent). */
export async function monnifyPurchaseUtility(
  api: EsoPayApiClient,
  input: MonnifyPurchaseInput,
): Promise<MonnifyPurchaseResult> {
  return parsePurchaseUtilityResponse(await api.utilities.purchase(input));
}

/** Mask meter for display: ****1234 */
export function maskMonnifyAccount(accountNumber: string): string {
  const trimmed = accountNumber.trim();
  if (trimmed.length <= 4) return trimmed;
  return `****${trimmed.slice(-4)}`;
}
