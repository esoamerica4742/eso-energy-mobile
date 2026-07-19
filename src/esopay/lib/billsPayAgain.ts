import type { BillHistoryRowModel } from '@/esopay/lib/billHistoryDisplay';

export const PAY_AGAIN_STRIP_MAX = 5;

/** Stable key for deduping repeat-pay targets. */
export function paymentRepeatKey(row: BillHistoryRowModel): string {
  return `${row.payment.provider.id}:${row.payment.account_number}`;
}

export function pickPayAgainRows(
  rows: BillHistoryRowModel[],
  max = PAY_AGAIN_STRIP_MAX,
): BillHistoryRowModel[] {
  const seen = new Set<string>();
  const out: BillHistoryRowModel[] = [];
  for (const row of rows) {
    const key = paymentRepeatKey(row);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * @deprecated Pay-again always shows when there are candidates (habit-first hub).
 * Kept for tests / callers; always returns true when strip is non-empty.
 */
export function shouldShowPayAgainStrip(
  strip: BillHistoryRowModel[],
  _history: BillHistoryRowModel[],
  _overlapRows = 2,
): boolean {
  return strip.length > 0;
}

/** Identity filter — strip is never suppressed against history. */
export function filterPayAgainStrip(
  strip: BillHistoryRowModel[],
  _history: BillHistoryRowModel[],
  _overlapRows = 2,
): BillHistoryRowModel[] {
  return strip;
}
