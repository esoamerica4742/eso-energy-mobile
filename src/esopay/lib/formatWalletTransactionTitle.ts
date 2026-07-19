import type { WalletTransactionType } from '@/esopay/api/types';

/** Short labels that fit a single history row without clipping. */
const TYPE_FALLBACK: Record<WalletTransactionType, string> = {
  credit: 'Wallet top-up',
  debit: 'Wallet debit',
  bill_payment: 'Bill payment',
  refund: 'Refund',
  reversal: 'Reversal',
};

/**
 * Compress long API narrations (e.g. "Wallet funding via bank transfer")
 * into short titles that display fully in history lists.
 */
export function formatWalletTransactionTitle(
  narration: string | null | undefined,
  type: WalletTransactionType,
  reference?: string | null,
): string {
  const raw = narration?.trim() ?? '';
  const lower = raw.toLowerCase();

  if (
    lower.includes('wallet funding') ||
    lower.includes('funding via bank') ||
    lower.includes('bank transfer') ||
    lower.includes('virtual account')
  ) {
    return 'Bank top-up';
  }

  if (lower.includes('bill payment') || lower.includes('bill pay')) {
    return 'Bill payment';
  }

  if (lower.startsWith('cashback') || lower.includes('cashback')) return 'Cashback';

  if (lower.startsWith('refund')) return 'Refund';
  if (lower.startsWith('reversal')) return 'Reversal';

  // Keep short narrations; clamp longer ones so they don't clip mid-word.
  if (raw.length > 0 && raw.length <= 22) return raw;
  if (raw.length > 22) {
    const cut = raw.slice(0, 21).trimEnd();
    const lastSpace = cut.lastIndexOf(' ');
    return `${(lastSpace > 10 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
  }

  if (reference?.trim()) {
    return reference.trim().slice(0, 18);
  }

  return TYPE_FALLBACK[type] ?? 'Transaction';
}
