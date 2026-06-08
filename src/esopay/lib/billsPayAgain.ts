import type { BillHistoryRowModel } from '@/esopay/lib/billHistoryDisplay';

export const PAY_AGAIN_STRIP_MAX = 3;

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
 * Hide the pay-again strip when it only repeats what's already visible at the top of history.
 */
export function shouldShowPayAgainStrip(
  strip: BillHistoryRowModel[],
  history: BillHistoryRowModel[],
  overlapRows = 2,
): boolean {
  if (strip.length === 0) return false;
  const topKeys = new Set(history.slice(0, overlapRows).map(paymentRepeatKey));
  return strip.some((row) => !topKeys.has(paymentRepeatKey(row)));
}

export function filterPayAgainStrip(
  strip: BillHistoryRowModel[],
  history: BillHistoryRowModel[],
  overlapRows = 2,
): BillHistoryRowModel[] {
  if (!shouldShowPayAgainStrip(strip, history, overlapRows)) return [];
  const topKeys = new Set(history.slice(0, overlapRows).map(paymentRepeatKey));
  return strip.filter((row) => !topKeys.has(paymentRepeatKey(row)));
}
