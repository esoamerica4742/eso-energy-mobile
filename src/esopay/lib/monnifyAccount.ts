/** Pure Monnify account helpers (no API client imports — safe for unit tests). */

export const MONNIFY_ACCOUNT_MIN_LENGTH = 6;

export function isMonnifyAccountReady(accountNumber: string): boolean {
  const digits = accountNumber.replace(/\D/g, '');
  return digits.length >= MONNIFY_ACCOUNT_MIN_LENGTH;
}

export function maskMonnifyAccount(accountNumber: string): string {
  const trimmed = accountNumber.trim();
  if (trimmed.length <= 4) return trimmed;
  return `****${trimmed.slice(-4)}`;
}
