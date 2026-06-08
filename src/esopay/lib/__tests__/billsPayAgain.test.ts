import type { BillHistoryRowModel } from '@/esopay/lib/billHistoryDisplay';
import {
  filterPayAgainStrip,
  paymentRepeatKey,
  pickPayAgainRows,
  shouldShowPayAgainStrip,
} from '@/esopay/lib/billsPayAgain';

function row(id: string, providerId: string, account: string): BillHistoryRowModel {
  return {
    id,
    filterCategory: 'electricity',
    serviceName: 'Electricity',
    distributor: 'IE',
    dateTime: '1 May 2026',
    amountKobo: 10_000,
    status: 'success',
    brand: { logoBg: '#000', logoFg: '#fff', logoText: 'IE', accent: '#F59E0B' },
    payment: {
      id,
      provider: {
        id: providerId,
        name: 'IE',
        category: 'electricity',
        monnify_biller_code: 'x',
      },
      account_number: account,
      amount_kobo: 10_000,
      paid_at: '2026-05-01T12:00:00.000Z',
    },
  };
}

describe('billsPayAgain', () => {
  it('dedupes repeat keys', () => {
    const rows = [
      row('1', 'p1', '111'),
      row('2', 'p1', '111'),
      row('3', 'p2', '222'),
    ];
    expect(pickPayAgainRows(rows, 3)).toHaveLength(2);
    expect(paymentRepeatKey(rows[0])).toBe('p1:111');
  });

  it('hides strip when it only mirrors top history', () => {
    const history = [row('1', 'p1', '111'), row('2', 'p2', '222')];
    const strip = pickPayAgainRows(history, 2);
    expect(shouldShowPayAgainStrip(strip, history, 2)).toBe(false);
    expect(filterPayAgainStrip(strip, history, 2)).toEqual([]);
  });

  it('keeps strip when an older payment is not in top history', () => {
    const history = [row('1', 'p1', '111'), row('2', 'p2', '222'), row('3', 'p3', '333')];
    const strip = pickPayAgainRows([row('4', 'p3', '333'), row('5', 'p1', '111')], 2);
    expect(shouldShowPayAgainStrip(strip, history, 2)).toBe(true);
    expect(filterPayAgainStrip(strip, history, 2).length).toBeGreaterThan(0);
  });
});
