/** Client-side mirror of server prepaid token formatting. */

export function normalizePrepaidTokenDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 20) return digits.slice(0, 20);
  return digits;
}

export function formatPrepaidTokenDisplay(raw: string): string {
  const digits = normalizePrepaidTokenDigits(raw);
  if (!digits) return raw.trim();

  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    groups.push(digits.slice(i, i + 4));
  }
  return groups.join('-');
}
