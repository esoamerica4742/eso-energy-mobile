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

  it('falls back to popular defaults without history', () => {
    const map = buildHubHighlightMap([]);
    expect(map.get('elec')).toBe('popular');
    expect(map.get('air')).toBe('popular');
  });

  it('filters hub cards by label and slug', () => {
    const filtered = filterHubCards(BILL_HUB_CARDS, 'water');
    expect(filtered.some((c) => c.key === 'water')).toBe(true);
    expect(filtered.length).toBe(1);
  });
});
