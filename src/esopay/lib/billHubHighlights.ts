import type { RecentUtilityPayment } from '@/esopay/api/types';
import type { BillPayHubCardConfig } from '@/esopay/data/billPayHubCatalog';

export type HubHighlightKind = 'recent' | 'popular';

/** Corner badge copy on BillPayCard. */
export function hubHighlightLabel(kind: HubHighlightKind): string {
  return kind === 'recent' ? 'Recent' : 'Popular';
}

const CATEGORY_HUB_KEY: Record<RecentUtilityPayment['provider']['category'], string | null> = {
  electricity: 'elec',
  airtime: 'air',
  data: 'data',
  tv: 'tv',
  water: 'water',
  other: null,
};

function hubKeyFromProviderName(name: string): string | null {
  const n = name.toLowerCase();
  if (n.includes('waec') || n.includes('jamb') || n.includes('neco') || n.includes('education')) {
    return 'education';
  }
  if (n.includes('bet') || n.includes('sporty') || n.includes('nairabet')) {
    return 'betting';
  }
  if (n.includes('lawma') || n.includes('waste') || n.includes('psp')) {
    return 'waste';
  }
  return null;
}

export function resolveHubKeyFromPayment(payment: RecentUtilityPayment): string | null {
  const fromCategory = CATEGORY_HUB_KEY[payment.provider.category];
  if (fromCategory) return fromCategory;
  return hubKeyFromProviderName(payment.provider.name);
}

/**
 * Up to two hub cards get a badge: driven by real payment frequency when history exists,
 * otherwise static popular defaults (electricity + airtime).
 */
export function buildHubHighlightMap(
  payments: RecentUtilityPayment[],
  options?: { fallbackPopularKeys?: string[] },
): Map<string, HubHighlightKind> {
  const counts = new Map<string, number>();
  for (const payment of payments) {
    const key = resolveHubKeyFromPayment(payment);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const result = new Map<string, HubHighlightKind>();

  if (counts.size > 0) {
    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    for (const [key] of ranked.slice(0, 2)) {
      result.set(key, 'recent');
    }
    return result;
  }

  for (const key of options?.fallbackPopularKeys ?? ['elec', 'air']) {
    result.set(key, 'popular');
  }
  return result;
}

export function filterHubCards(
  cards: BillPayHubCardConfig[],
  query: string,
  subtitleFor?: (card: BillPayHubCardConfig) => string,
): BillPayHubCardConfig[] {
  const q = query.trim().toLowerCase();
  if (!q) return cards;
  return cards.filter((card) => {
    if (card.label.toLowerCase().includes(q)) return true;
    if (card.key.toLowerCase().includes(q)) return true;
    if (card.slug?.toLowerCase().includes(q)) return true;
    if (subtitleFor && subtitleFor(card).toLowerCase().includes(q)) return true;
    return false;
  });
}
