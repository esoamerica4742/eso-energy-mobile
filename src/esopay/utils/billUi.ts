import type { BillStatus, EsoPayBill } from '@/esopay/api/types';
import type { EsoPayStatusKey } from '@/esopay/theme/tokens';
import { format, parseISO } from 'date-fns';

export function billOffsetPercent(bill: EsoPayBill): number {
  if (bill.gross_amount_kobo <= 0) return 0;
  return (bill.offset_amount_kobo / bill.gross_amount_kobo) * 100;
}

/** Maps bill row to live offset micro-indicator semantic (spec §1.2). */
export function billOffsetStatusKey(bill: EsoPayBill): EsoPayStatusKey {
  if (bill.status === 'paid') return 'paid';
  if (bill.status === 'overdue' && bill.offset_amount_kobo === 0) return 'offline';

  const pct = billOffsetPercent(bill);
  if (pct >= 80) return 'live';
  if (pct > 0) return 'partial';
  return 'offline';
}

export function formatBillPeriod(start: string, end: string): string {
  try {
    const s = parseISO(start);
    const e = parseISO(end);
    return `${format(s, 'MMM d')} – ${format(e, 'MMM d, yyyy')}`;
  } catch {
    return `${start} – ${end}`;
  }
}

export function formatDueDate(iso: string): string {
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return iso;
  }
}

export function billStatusLabel(status: BillStatus): string {
  const labels: Record<BillStatus, string> = {
    pending: 'Pending',
    offset_calculated: 'Offset ready',
    payment_initiated: 'Processing',
    paid: 'Paid',
    overdue: 'Overdue',
    void: 'Void',
  };
  return labels[status];
}
