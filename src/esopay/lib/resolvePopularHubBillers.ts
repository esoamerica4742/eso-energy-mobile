import type { UtilityProvider } from '@/esopay/api/types';
import {
  NIGERIA_BILLER_CATALOG,
  POPULAR_BILLER_IDS,
  UTILITY_CATEGORY_SLUGS,
  type NigeriaBillerMeta,
  type UtilityCategorySlug,
} from '@/esopay/data/nigeriaBillers';

export type PopularHubBiller = {
  meta: NigeriaBillerMeta;
  provider: UtilityProvider | null;
};

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchLiveProvider(
  meta: NigeriaBillerMeta,
  liveProviders: UtilityProvider[],
): UtilityProvider | undefined {
  const codeKey = normalizeKey(meta.monnify_biller_code);
  const nameKey = normalizeKey(meta.shortLabel);
  const category = meta.providerCategory;

  return liveProviders.find((p) => {
    if (category !== 'other' && p.category !== category) return false;
    const pCode = normalizeKey(p.monnify_biller_code);
    const pName = normalizeKey(p.name);
    return (
      pCode === codeKey ||
      pCode.includes(codeKey) ||
      codeKey.includes(pCode) ||
      pName.includes(nameKey)
    );
  });
}

const POPULAR_ORDER: UtilityCategorySlug[] = [
  'electricity',
  'airtime',
  'data',
  'tv',
  'betting',
];

/** Up to 8 popular shortcuts for the Pay hub (catalog order across live categories). */
export function resolvePopularHubBillers(
  liveProviders: UtilityProvider[] | undefined,
  max = 8,
): PopularHubBiller[] {
  const out: PopularHubBiller[] = [];
  const usedCodes = new Set<string>();

  for (const slug of POPULAR_ORDER) {
    if (!UTILITY_CATEGORY_SLUGS.includes(slug) && slug !== 'betting') continue;
    const ids = POPULAR_BILLER_IDS[slug] ?? [];
    for (const id of ids) {
      const meta = NIGERIA_BILLER_CATALOG.find((b) => b.id === id && b.category === slug);
      if (!meta) continue;
      const codeKey = normalizeKey(meta.monnify_biller_code);
      if (usedCodes.has(codeKey)) continue;
      usedCodes.add(codeKey);
      const provider = liveProviders?.length
        ? matchLiveProvider(meta, liveProviders) ?? null
        : null;
      out.push({ meta, provider });
      if (out.length >= max) return out;
    }
  }

  return out;
}
