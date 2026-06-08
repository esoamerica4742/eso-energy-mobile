export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 11) return `+234${digits.slice(1)}`;
  if (digits.startsWith('234') && digits.length === 13) return `+${digits}`;
  if (digits.startsWith('234') && digits.length > 13) return `+${digits.slice(0, 13)}`;
  if (digits.length === 10) return `+234${digits}`;
  return raw.trim();
}

export function isValidNgPhone(phone: string): boolean {
  return normalizePhone(phone).startsWith('+234') && normalizePhone(phone).length >= 14;
}

/** +2348031234567 → +234 803 *** 4567 */
export function maskPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  const digits = normalized.replace(/\D/g, '');
  if (digits.length < 13) return normalized;
  const local = digits.slice(3);
  if (local.length < 10) return normalized;
  return `+234 ${local.slice(0, 3)} *** ${local.slice(-4)}`;
}

export function localDigitsForInput(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('234')) return digits.slice(3);
  if (digits.startsWith('0')) return digits.slice(1);
  return digits;
}
