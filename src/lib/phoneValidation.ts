/** Strip to digits only. */
export function phoneDigits(raw: string): string {
  return raw.replace(/\D/g, '');
}

/** Normalize Nigerian MSISDN to 234XXXXXXXXXX (13 digits). */
export function normalizeNigerianPhone(raw: string): string {
  const digits = phoneDigits(raw);
  if (digits.startsWith('234')) return digits;
  if (digits.startsWith('0') && digits.length === 11) return `234${digits.slice(1)}`;
  if (digits.length === 10 && /^[789]/.test(digits)) return `234${digits}`;
  return digits;
}

/** Nigerian mobile: 080x / 070x / 090x etc. (local or +234). */
export function isValidNigerianPhone(raw: string): boolean {
  const n = normalizeNigerianPhone(raw);
  return /^234[789][01]\d{8}$/.test(n);
}

/** Display-friendly local format: 0803 123 4567 */
export function formatNigerianPhoneLocal(raw: string): string {
  const digits = phoneDigits(raw);
  const local =
    digits.startsWith('234') && digits.length === 13
      ? `0${digits.slice(3)}`
      : digits.startsWith('0')
        ? digits
        : digits.length === 10
          ? `0${digits}`
          : digits;
  if (local.length !== 11) return raw.trim();
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}
