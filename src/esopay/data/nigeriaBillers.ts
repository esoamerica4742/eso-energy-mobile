import type { UtilityProvider } from '@/esopay/api/types';
import type { BillFilterTab } from '@/esopay/data/utilities';

export type UtilityCategorySlug =
  | 'electricity'
  | 'airtime'
  | 'data'
  | 'tv'
  | 'education'
  | 'betting'
  | 'water'
  | 'waste';

export type NigeriaBillerMeta = {
  id: string;
  name: string;
  shortLabel: string;
  category: UtilityCategorySlug;
  /** Primary state or region label shown under DISCO name */
  stateLabel: string;
  monnify_biller_code: string;
  providerCategory: UtilityProvider['category'];
};

/**
 * Categories shown in Pay hubs.
 * Education stays in the hub but has no live Monnify products yet.
 * Water/waste are not on Monnify live.
 */
export const UTILITY_CATEGORY_SLUGS: UtilityCategorySlug[] = [
  'electricity',
  'airtime',
  'data',
  'tv',
  'betting',
];

/** Top quick-pick billers per category (catalog meta ids). */
export const POPULAR_BILLER_IDS: Record<UtilityCategorySlug, string[]> = {
  electricity: ['ikedc-pre', 'ekedc-pre', 'aedc-pre'],
  airtime: ['mtn-air', 'airtel-air', 'glo-air'],
  data: ['mtn-data', 'airtel-data', 'glo-data'],
  tv: ['dstv', 'gotv', 'showmax'],
  education: [],
  betting: ['bet9ja', 'sportybet', 'betking'],
  water: [],
  waste: [],
};

export const UTILITY_CATEGORY_META: Record<
  UtilityCategorySlug,
  { title: string; subtitle: string; filterTab: BillFilterTab; accountLabel: string; accountPlaceholder: string }
> = {
  electricity: {
    title: 'Electricity',
    subtitle: 'Choose DISCO',
    filterTab: 'ELECTRICITY',
    accountLabel: 'Meter number',
    accountPlaceholder: 'Enter 11-digit meter number',
  },
  airtime: {
    title: 'Airtime',
    subtitle: 'Choose network',
    filterTab: 'AIRTIME',
    accountLabel: 'Phone number',
    accountPlaceholder: '080XXXXXXXX',
  },
  data: {
    title: 'Data',
    subtitle: 'Select plan',
    filterTab: 'DATA',
    accountLabel: 'Phone number',
    accountPlaceholder: '080XXXXXXXX',
  },
  tv: {
    title: 'Cable TV',
    subtitle: 'Choose provider',
    filterTab: 'CABLE TV',
    accountLabel: 'Smartcard / IUC',
    accountPlaceholder: 'Enter smartcard number',
  },
  education: {
    title: 'Education',
    subtitle: 'Select plan',
    filterTab: 'EDUCATION',
    accountLabel: 'Reference number',
    accountPlaceholder: 'Enter registration or PIN number',
  },
  betting: {
    title: 'Betting',
    subtitle: 'Fund wallet',
    filterTab: 'BETTING',
    accountLabel: 'User ID',
    accountPlaceholder: 'Enter betting account ID',
  },
  water: {
    title: 'Water',
    subtitle: 'Choose provider',
    filterTab: 'ALL',
    accountLabel: 'Account number',
    accountPlaceholder: 'Enter water account number',
  },
  waste: {
    title: 'Waste',
    subtitle: 'Choose provider',
    filterTab: 'ALL',
    accountLabel: 'Account number',
    accountPlaceholder: 'Enter waste levy account',
  },
};

/**
 * Offline / match catalog — Monnify LIVE VAS codes only (products that vend).
 * Billers listed by Monnify without products (EEDC, KNEDC/Kaduna, StarTimes,
 * WAEC/JAMB) are omitted until Monnify returns payable product codes.
 */
export const NIGERIA_BILLER_CATALOG: NigeriaBillerMeta[] = [
  // Electricity — prepaid preferred; postpaid kept as separate live billers
  {
    id: 'aedc-pre',
    name: 'Abuja Electricity Prepaid',
    shortLabel: 'AEDC',
    category: 'electricity',
    stateLabel: 'FCT · Niger · Kogi · Nasarawa',
    monnify_biller_code: 'biller-aedc-pre',
    providerCategory: 'electricity',
  },
  {
    id: 'aedc-post',
    name: 'Abuja Electricity Postpaid',
    shortLabel: 'AEDC Post',
    category: 'electricity',
    stateLabel: 'FCT · Niger · Kogi · Nasarawa',
    monnify_biller_code: 'biller-aedc-post',
    providerCategory: 'electricity',
  },
  {
    id: 'bedc',
    name: 'Benin Electricity (BEDC)',
    shortLabel: 'BEDC',
    category: 'electricity',
    stateLabel: 'Edo · Delta · Ondo · Ekiti',
    monnify_biller_code: 'bedc',
    providerCategory: 'electricity',
  },
  {
    id: 'ekedc-pre',
    name: 'Eko Electricity Prepaid',
    shortLabel: 'EKEDC',
    category: 'electricity',
    stateLabel: 'Lagos South',
    monnify_biller_code: 'biller-ekedc-pre',
    providerCategory: 'electricity',
  },
  {
    id: 'ekedc-post',
    name: 'Eko Electricity Postpaid',
    shortLabel: 'EKEDC Post',
    category: 'electricity',
    stateLabel: 'Lagos South',
    monnify_biller_code: 'biller-ekedc-post',
    providerCategory: 'electricity',
  },
  {
    id: 'ibedc-pre',
    name: 'Ibadan Electricity Prepaid',
    shortLabel: 'IBEDC',
    category: 'electricity',
    stateLabel: 'Oyo · Ogun · Osun · Kwara',
    monnify_biller_code: 'biller-ibedc-pre',
    providerCategory: 'electricity',
  },
  {
    id: 'ikedc-pre',
    name: 'Ikeja Electric Prepaid',
    shortLabel: 'IE',
    category: 'electricity',
    stateLabel: 'Lagos North',
    monnify_biller_code: 'biller-ikedc-pre',
    providerCategory: 'electricity',
  },
  {
    id: 'ikedc-post',
    name: 'Ikeja Electric Postpaid',
    shortLabel: 'IE Post',
    category: 'electricity',
    stateLabel: 'Lagos North',
    monnify_biller_code: 'biller-ikedc-post',
    providerCategory: 'electricity',
  },
  {
    id: 'jedc-pre',
    name: 'Jos Electricity Prepaid',
    shortLabel: 'JED',
    category: 'electricity',
    stateLabel: 'Plateau · Benue · Gombe · Bauchi',
    monnify_biller_code: 'biller-jedc-pre',
    providerCategory: 'electricity',
  },
  {
    id: 'jedc-post',
    name: 'Jos Electricity Postpaid',
    shortLabel: 'JED Post',
    category: 'electricity',
    stateLabel: 'Plateau · Benue · Gombe · Bauchi',
    monnify_biller_code: 'biller-jedc-post',
    providerCategory: 'electricity',
  },
  {
    id: 'kedc-pre',
    name: 'Kano Electricity Prepaid',
    shortLabel: 'KEDCO',
    category: 'electricity',
    stateLabel: 'Kano · Katsina · Jigawa',
    monnify_biller_code: 'biller-kedc-pre',
    providerCategory: 'electricity',
  },
  {
    id: 'phedc-pre',
    name: 'Port Harcourt Electric Prepaid',
    shortLabel: 'PHED',
    category: 'electricity',
    stateLabel: 'Rivers · Bayelsa · Cross River · Akwa Ibom',
    monnify_biller_code: 'biller-phedc-pre',
    providerCategory: 'electricity',
  },
  {
    id: 'phedc-post',
    name: 'Port Harcourt Electric Postpaid',
    shortLabel: 'PHED Post',
    category: 'electricity',
    stateLabel: 'Rivers · Bayelsa · Cross River · Akwa Ibom',
    monnify_biller_code: 'biller-phedc-post',
    providerCategory: 'electricity',
  },
  {
    id: 'yola-pre',
    name: 'Yola Electricity Prepaid',
    shortLabel: 'YEDC',
    category: 'electricity',
    stateLabel: 'Adamawa · Taraba · Borno · Yobe',
    monnify_biller_code: 'biller-yola-pre',
    providerCategory: 'electricity',
  },
  {
    id: 'yola-post',
    name: 'Yola Electricity Postpaid',
    shortLabel: 'YEDC Post',
    category: 'electricity',
    stateLabel: 'Adamawa · Taraba · Borno · Yobe',
    monnify_biller_code: 'biller-yola-post',
    providerCategory: 'electricity',
  },
  {
    id: 'aba-pre',
    name: 'Aba Electricity Prepaid',
    shortLabel: 'ABA',
    category: 'electricity',
    stateLabel: 'Abia',
    monnify_biller_code: 'biller-aba-pre',
    providerCategory: 'electricity',
  },
  {
    id: 'aba-post',
    name: 'Aba Electricity Postpaid',
    shortLabel: 'ABA Post',
    category: 'electricity',
    stateLabel: 'Abia',
    monnify_biller_code: 'biller-aba-post',
    providerCategory: 'electricity',
  },

  // Airtime
  {
    id: 'mtn-air',
    name: 'MTN',
    shortLabel: 'MTN',
    category: 'airtime',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'MTN',
    providerCategory: 'airtime',
  },
  {
    id: 'airtel-air',
    name: 'Airtel',
    shortLabel: 'Airtel',
    category: 'airtime',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'AIRTEL',
    providerCategory: 'airtime',
  },
  {
    id: 'glo-air',
    name: 'Glo',
    shortLabel: 'Glo',
    category: 'airtime',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'GLO',
    providerCategory: 'airtime',
  },
  {
    id: '9mobile-air',
    name: '9mobile',
    shortLabel: '9mobile',
    category: 'airtime',
    stateLabel: 'Nigeria',
    monnify_biller_code: '9MOBILE',
    providerCategory: 'airtime',
  },

  // Data (same networks — live product rows attach after sync)
  {
    id: 'mtn-data',
    name: 'MTN Data',
    shortLabel: 'MTN',
    category: 'data',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'MTN',
    providerCategory: 'data',
  },
  {
    id: 'airtel-data',
    name: 'Airtel Data',
    shortLabel: 'Airtel',
    category: 'data',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'AIRTEL',
    providerCategory: 'data',
  },
  {
    id: 'glo-data',
    name: 'Glo Data',
    shortLabel: 'Glo',
    category: 'data',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'GLO',
    providerCategory: 'data',
  },
  {
    id: '9mobile-data',
    name: '9mobile Data',
    shortLabel: '9mobile',
    category: 'data',
    stateLabel: 'Nigeria',
    monnify_biller_code: '9MOBILE',
    providerCategory: 'data',
  },

  // Cable TV
  {
    id: 'dstv',
    name: 'DStv',
    shortLabel: 'DStv',
    category: 'tv',
    stateLabel: 'Multichoice',
    monnify_biller_code: 'biller-dstv',
    providerCategory: 'tv',
  },
  {
    id: 'gotv',
    name: 'GOtv',
    shortLabel: 'GOtv',
    category: 'tv',
    stateLabel: 'Multichoice',
    monnify_biller_code: 'biller-gotv',
    providerCategory: 'tv',
  },
  {
    id: 'showmax',
    name: 'Showmax',
    shortLabel: 'Showmax',
    category: 'tv',
    stateLabel: 'Streaming',
    monnify_biller_code: 'biller-showmax',
    providerCategory: 'tv',
  },

  // Betting — live Monnify product billers only
  {
    id: 'bet9ja',
    name: 'Bet9ja',
    shortLabel: 'Bet9ja',
    category: 'betting',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'BET9JA',
    providerCategory: 'other',
  },
  {
    id: 'sportybet',
    name: 'SportyBet',
    shortLabel: 'SportyBet',
    category: 'betting',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'biller-sporty-bet',
    providerCategory: 'other',
  },
  {
    id: 'betking',
    name: 'BetKing',
    shortLabel: 'BetKing',
    category: 'betting',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'biller-bet-king',
    providerCategory: 'other',
  },
  {
    id: '1xbet',
    name: '1xBet',
    shortLabel: '1xBet',
    category: 'betting',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'biller-1x-bet',
    providerCategory: 'other',
  },
  {
    id: 'nairabet',
    name: 'NairaBet',
    shortLabel: 'NairaBet',
    category: 'betting',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'biller-nairabet',
    providerCategory: 'other',
  },
  {
    id: 'msport',
    name: 'MSport',
    shortLabel: 'MSport',
    category: 'betting',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'biller-m-sport',
    providerCategory: 'other',
  },
  {
    id: 'betway',
    name: 'BetWay',
    shortLabel: 'BetWay',
    category: 'betting',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'biller-bet-way',
    providerCategory: 'other',
  },
  {
    id: 'betpawa',
    name: 'BetPawa',
    shortLabel: 'BetPawa',
    category: 'betting',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'biller-betpawa',
    providerCategory: 'other',
  },
  {
    id: 'merrybet',
    name: 'MerryBet',
    shortLabel: 'MerryBet',
    category: 'betting',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'biller-merry-bet',
    providerCategory: 'other',
  },
  {
    id: 'bangbet',
    name: 'BangBet',
    shortLabel: 'BangBet',
    category: 'betting',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'biller-bang-bet',
    providerCategory: 'other',
  },
  {
    id: 'supabet',
    name: 'SupaBet',
    shortLabel: 'SupaBet',
    category: 'betting',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'biller-supa-bet',
    providerCategory: 'other',
  },
  {
    id: 'cloudbet',
    name: 'CloudBet',
    shortLabel: 'CloudBet',
    category: 'betting',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'biller-cloud-bet',
    providerCategory: 'other',
  },
  {
    id: 'betland',
    name: 'BetLand',
    shortLabel: 'BetLand',
    category: 'betting',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'biller-bet-land',
    providerCategory: 'other',
  },
  {
    id: 'livescorebet',
    name: 'LiveScoreBet',
    shortLabel: 'LiveScore',
    category: 'betting',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'biller-livescore-bet',
    providerCategory: 'other',
  },
  {
    id: 'naijabet',
    name: 'NaijaBet',
    shortLabel: 'NaijaBet',
    category: 'betting',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'biller-naija-bet',
    providerCategory: 'other',
  },
  {
    id: 'ilotbet',
    name: 'IlotBet',
    shortLabel: 'IlotBet',
    category: 'betting',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'biller-ilotbet',
    providerCategory: 'other',
  },
];

/** OPay-style quick amounts — ₦1,000 through ₦20,000 */
export const UTILITY_AMOUNT_PRESETS_KOBO = [
  1_000_00, 2_000_00, 3_000_00, 4_000_00, 5_000_00,
  6_000_00, 7_000_00, 8_000_00, 9_000_00, 10_000_00,
  12_000_00, 15_000_00, 18_000_00, 20_000_00,
] as const;

export function metaToStaticProvider(meta: NigeriaBillerMeta): UtilityProvider {
  return {
    id: `static-${meta.id}`,
    name: meta.name,
    category: meta.providerCategory,
    monnify_biller_code: meta.monnify_biller_code,
  };
}

export function getOfflineBillersForCategory(slug: UtilityCategorySlug): NigeriaBillerMeta[] {
  return NIGERIA_BILLER_CATALOG.filter((b) => b.category === slug);
}

export function getPopularBillersForCategory(slug: UtilityCategorySlug): NigeriaBillerMeta[] {
  const ids = POPULAR_BILLER_IDS[slug] ?? [];
  const catalog = getOfflineBillersForCategory(slug);
  const picked: NigeriaBillerMeta[] = [];
  for (const id of ids) {
    const meta = catalog.find((b) => b.id === id);
    if (meta) picked.push(meta);
  }
  return picked.length > 0 ? picked : catalog.slice(0, 3);
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Prefer live Monnify provider when online; attach catalog meta for UI. */
export function resolveCategoryBillers(
  slug: UtilityCategorySlug,
  liveProviders: UtilityProvider[] | undefined,
): { billers: Array<{ provider: UtilityProvider; meta: NigeriaBillerMeta }>; offline: boolean } {
  const catalog = getOfflineBillersForCategory(slug);
  const offline = !liveProviders || liveProviders.length === 0;

  if (offline) {
    return {
      offline: true,
      billers: catalog.map((meta) => ({ meta, provider: metaToStaticProvider(meta) })),
    };
  }

  const usedLive = new Set<string>();
  const billers: Array<{ provider: UtilityProvider; meta: NigeriaBillerMeta }> = [];

  /** Data/TV: every live product row is a selectable plan. Other categories: one row per biller. */
  const expandProducts = slug === 'data' || slug === 'tv';

  for (const meta of catalog) {
    const codeKey = normalizeKey(meta.monnify_biller_code);
    const nameKey = normalizeKey(meta.shortLabel);
    const liveMatches = liveProviders.filter((p) => {
      if (slug === 'airtime' && p.category !== 'airtime') return false;
      if (slug === 'data' && p.category !== 'data') return false;
      if (slug === 'tv' && p.category !== 'tv') return false;
      if (slug === 'electricity' && p.category !== 'electricity') return false;
      const pCode = normalizeKey(p.monnify_biller_code);
      const pName = normalizeKey(p.name);
      return (
        pCode === codeKey ||
        pCode.includes(codeKey) ||
        codeKey.includes(pCode) ||
        pName.includes(nameKey)
      );
    });

    if (expandProducts) {
      for (const live of liveMatches) {
        if (usedLive.has(live.id)) continue;
        usedLive.add(live.id);
        billers.push({
          meta: {
            ...meta,
            id: `${meta.id}-${live.id}`,
            name: live.name,
            shortLabel: meta.shortLabel,
          },
          provider: live,
        });
      }
      continue;
    }

    const live =
      liveMatches.find((p) => normalizeKey(p.monnify_biller_code) === codeKey) ?? liveMatches[0];
    if (live) {
      usedLive.add(live.id);
      billers.push({ meta, provider: live });
    }
  }

  // Append any extra live billers for this category not in catalog
  for (const live of liveProviders) {
    if (usedLive.has(live.id)) continue;
    if (slug === 'airtime' && live.category !== 'airtime') continue;
    if (slug === 'data' && live.category !== 'data') continue;
    if (slug === 'tv' && live.category !== 'tv') continue;
    if (slug === 'electricity' && live.category !== 'electricity') continue;
    if (slug === 'water' && live.category !== 'water') continue;
    if (slug === 'betting') {
      const n = normalizeKey(live.name + live.monnify_biller_code);
      if (
        live.category !== 'other' ||
        !/bet|sporty|naira|1x|msport|ilot|pawa|merry|bang|supa|cloud|livescore|naija/.test(n)
      ) {
        continue;
      }
    }
    if (slug === 'education') {
      const n = normalizeKey(live.name);
      if (live.category !== 'other' || !/waec|jamb|neco|education/.test(n)) continue;
    }

    const meta: NigeriaBillerMeta = {
      id: live.id,
      name: live.name,
      shortLabel: (live.name.split(/[\s—-]+/)[0] ?? live.name).trim(),
      category: slug,
      stateLabel: 'Nigeria',
      monnify_biller_code: live.monnify_biller_code,
      providerCategory: live.category,
    };
    billers.push({ meta, provider: live });
  }

  return { billers, offline: false };
}

export function slugFromFilterTab(tab: BillFilterTab): UtilityCategorySlug | null {
  const entry = Object.entries(UTILITY_CATEGORY_META).find(([, m]) => m.filterTab === tab);
  return (entry?.[0] as UtilityCategorySlug | undefined) ?? null;
}

export function normalizeUtilityCategorySlug(raw?: string): UtilityCategorySlug | null {
  if (!raw) return null;
  const key = raw.toLowerCase().replace(/\s+/g, '') as UtilityCategorySlug;
  if (UTILITY_CATEGORY_SLUGS.includes(key) || key === 'education') return key;
  const aliases: Record<string, UtilityCategorySlug> = {
    elec: 'electricity',
    electric: 'electricity',
    cabletv: 'tv',
    tv: 'tv',
    edu: 'education',
    education: 'education',
    bet: 'betting',
    waterbills: 'water',
    wastebill: 'waste',
    lawma: 'waste',
  };
  return aliases[key] ?? null;
}
