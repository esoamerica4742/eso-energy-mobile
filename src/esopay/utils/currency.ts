/** Eso Pay currency formatting — spec §5 (kobo → display). */

const CURRENCY_SYMBOL: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
  EUR: '€',
};

/**
 * Converts integer kobo/cents to a locale-aware currency string.
 * @example formatCurrency(1284000, 'NGN') → '₦12,840.00'
 */
export function formatCurrency(amountKobo: number, currency = 'NGN'): string {
  const symbol = CURRENCY_SYMBOL[currency.toUpperCase()] ?? `${currency} `;
  const major = amountKobo / 100;
  const formatted = major.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

/** Parse user-entered naira string to integer kobo. */
export function parseNairaInputToKobo(input: string): number {
  const normalized = input.replace(/[₦,\s]/g, '');
  if (!normalized) return 0;
  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 100);
}

/** Format kobo as editable naira string (no symbol). */
export function formatKoboAsNairaInput(amountKobo: number): string {
  if (amountKobo <= 0) return '';
  const major = amountKobo / 100;
  return Number.isInteger(major) ? String(major) : major.toFixed(2);
}

export function getCurrencySymbol(currency = 'NGN'): string {
  return CURRENCY_SYMBOL[currency.toUpperCase()] ?? `${currency} `;
}

/** Major units only (no symbol) — pair with `getCurrencySymbol` in row layouts. */
export function formatCurrencyAmount(
  amountKobo: number,
  currency = 'NGN',
  options?: { alwaysDecimals?: boolean },
): string {
  const major = amountKobo / 100;
  const alwaysDecimals = options?.alwaysDecimals ?? false;
  const isWhole = amountKobo % 100 === 0;
  return major.toLocaleString('en-NG', {
    minimumFractionDigits: alwaysDecimals ? 2 : isWhole ? 0 : 2,
    maximumFractionDigits: alwaysDecimals ? 2 : isWhole ? 0 : 2,
  });
}

/** Compact hero figures — drops decimals when whole naira. */
export function formatCurrencyCompact(amountKobo: number, currency = 'NGN'): string {
  const symbol = CURRENCY_SYMBOL[currency.toUpperCase()] ?? `${currency} `;
  const major = amountKobo / 100;
  const isWhole = amountKobo % 100 === 0;
  const formatted = major.toLocaleString('en-NG', {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  });
  return `${symbol}${formatted}`;
}
