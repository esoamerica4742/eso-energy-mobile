import type { UtilityProvider } from '@/esopay/api/types';
import type { BillPayHubCardConfig } from '@/esopay/data/billPayHubCatalog';
import {
  NIGERIA_BILLER_CATALOG,
  type UtilityCategorySlug,
} from '@/esopay/data/nigeriaBillers';
import { filterHubCards } from '@/esopay/lib/billHubHighlights';
import type { PopularHubBiller } from '@/esopay/lib/resolvePopularHubBillers';

export type PayHubProviderHit = {
  kind: 'provider';
  id: string;
  title: string;
  subtitle: string;
  slug: UtilityCategorySlug;
  billerCode: string;
};

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function slugFromProvider(provider: UtilityProvider): UtilityCategorySlug | null {
  switch (provider.category) {
    case 'electricity':
      return 'electricity';
    case 'airtime':
      return 'airtime';
    case 'data':
      return 'data';
    case 'tv':
      return 'tv';
    case 'other': {
      const n = normalizeKey(provider.name + provider.monnify_biller_code);
      if (/bet|sporty|naira|1x|msport|ilot|pawa/.test(n)) return 'betting';
      return null;
    }
    default:
      return null;
  }
}

/** Match services + popular/live providers for Pay hub search. */
export function searchPayHubProviders(
  query: string,
  liveProviders: UtilityProvider[] | undefined,
  popular: PopularHubBiller[],
  limit = 8,
): PayHubProviderHit[] {
  const q = normalizeKey(query.trim());
  if (!q) return [];

  const hits: PayHubProviderHit[] = [];
  const seen = new Set<string>();

  const push = (hit: PayHubProviderHit) => {
    const key = `${hit.slug}:${normalizeKey(hit.billerCode)}`;
    if (seen.has(key)) return;
    seen.add(key);
    hits.push(hit);
  };

  for (const item of popular) {
    const hay = normalizeKey(
      `${item.meta.name} ${item.meta.shortLabel} ${item.meta.monnify_biller_code}`,
    );
    if (!hay.includes(q)) continue;
    push({
      kind: 'provider',
      id: item.meta.id,
      title: item.meta.shortLabel,
      subtitle: item.meta.name,
      slug: item.meta.category,
      billerCode: item.meta.monnify_biller_code,
    });
    if (hits.length >= limit) return hits;
  }

  for (const meta of NIGERIA_BILLER_CATALOG) {
    const hay = normalizeKey(`${meta.name} ${meta.shortLabel} ${meta.monnify_biller_code}`);
    if (!hay.includes(q)) continue;
    push({
      kind: 'provider',
      id: meta.id,
      title: meta.shortLabel,
      subtitle: meta.name,
      slug: meta.category,
      billerCode: meta.monnify_biller_code,
    });
    if (hits.length >= limit) return hits;
  }

  for (const provider of liveProviders ?? []) {
    const slug = slugFromProvider(provider);
    if (!slug) continue;
    const hay = normalizeKey(`${provider.name} ${provider.monnify_biller_code}`);
    if (!hay.includes(q)) continue;
    push({
      kind: 'provider',
      id: provider.id,
      title: provider.name.split('—')[0]?.trim() || provider.name,
      subtitle: provider.name,
      slug,
      billerCode: provider.monnify_biller_code,
    });
    if (hits.length >= limit) return hits;
  }

  return hits;
}

export function searchPayHubServices(
  cards: BillPayHubCardConfig[],
  query: string,
  subtitleFor: (card: BillPayHubCardConfig) => string,
): BillPayHubCardConfig[] {
  return filterHubCards(cards, query, subtitleFor);
}
