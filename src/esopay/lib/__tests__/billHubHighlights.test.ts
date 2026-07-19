import type { RecentUtilityPayment } from '@/esopay/api/types';
import {
  buildHubHighlightMap,
  filterHubCards,
  hubHighlightLabel,
  resolveHubKeyFromPayment,
} from '@/esopay/lib/billHubHighlights';
import { BILL_HUB_CARDS } from '@/esopay/data/billPayHubCatalog';

function payment(
  category: RecentUtilityPayment['provider']['category'],
  name = 'Provider',
): RecentUtilityPayment {
  return {
    id: `p-${category}-${name}`,
    provider: {
      id: 'prov-1',
      name,
      category,
      monnify_biller_code: 'code',
    },
    account_number: '1234567890',
    amount_kobo: 500_000,
    paid_at: '2026-05-01T12:00:00.000Z',
  };
}

describe('billHubHighlights', () => {
  it('maps provider categories to hub keys', () => {
    expect(resolveHubKeyFromPayment(payment('electricity'))).toBe('elec');
    expect(resolveHubKeyFromPayment(payment('airtime', 'MTN'))).toBe('air');
  });

  it('labels highlight kinds', () => {
    expect(hubHighlightLabel('recent')).toBe('Recent');
    expect(hubHighlightLabel('popular')).toBe('Popular');
  });

  it('uses payment frequency for recent badges', () => {
    const map = buildHubHighlightMap([
      payment('electricity'),
      payment('electricity'),
      payment('airtime'),
    ]);
    expect(map.get('elec')).toBe('recent');
    expect(map.size).toBeLessThanOrEqual(2);
  });

  it('returns no badges without payment history', () => {
    const map = buildHubHighlightMap([]);
    expect(map.size).toBe(0);
  });

  it('filters hub cards by label and slug', () => {
    const filtered = filterHubCards(BILL_HUB_CARDS, 'electric');
    expect(filtered.some((c) => c.key === 'elec')).toBe(true);
    expect(filtered.every((c) => c.key !== 'water' && c.key !== 'waste')).toBe(true);
  });

  it('excludes water and waste from the live hub catalog', () => {
    expect(BILL_HUB_CARDS.some((c) => c.key === 'water' || c.key === 'waste')).toBe(false);
  });
});
