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

export const UTILITY_CATEGORY_SLUGS: UtilityCategorySlug[] = [
  'electricity',
  'airtime',
  'data',
  'tv',
  'education',
  'betting',
  'water',
  'waste',
];

/** Top quick-pick billers per category (catalog meta ids). */
export const POPULAR_BILLER_IDS: Record<UtilityCategorySlug, string[]> = {
  electricity: ['ie', 'ekedc', 'aedc'],
  airtime: ['mtn-air', 'airtel-air', 'glo-air'],
  data: ['mtn-data', 'airtel-data', 'glo-data'],
  tv: ['dstv', 'gotv', 'startimes'],
  education: ['waec', 'jamb', 'neco'],
  betting: ['bet9ja', 'sportybet', 'betking'],
  water: ['lagos-water', 'fct-water', 'rivers-water'],
  waste: ['lawma', 'revenue-plus', 'environ-waste'],
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

/** Nigeria DISCOs + networks + TV + education + betting — offline catalog. */
export const NIGERIA_BILLER_CATALOG: NigeriaBillerMeta[] = [
  // Electricity — all major DISCOs with coverage states
  {
    id: 'aedc',
    name: 'Abuja Electricity (AEDC)',
    shortLabel: 'AEDC',
    category: 'electricity',
    stateLabel: 'FCT · Niger · Kogi · Nasarawa',
    monnify_biller_code: 'AEDC',
    providerCategory: 'electricity',
  },
  {
    id: 'bedc',
    name: 'Benin Electricity (BEDC)',
    shortLabel: 'BEDC',
    category: 'electricity',
    stateLabel: 'Edo · Delta · Ondo · Ekiti',
    monnify_biller_code: 'BEDC',
    providerCategory: 'electricity',
  },
  {
    id: 'ekedc',
    name: 'Eko Electricity (EKEDC)',
    shortLabel: 'EKEDC',
    category: 'electricity',
    stateLabel: 'Lagos South',
    monnify_biller_code: 'EKEDC',
    providerCategory: 'electricity',
  },
  {
    id: 'eedc',
    name: 'Enugu Electricity (EEDC)',
    shortLabel: 'EEDC',
    category: 'electricity',
    stateLabel: 'Enugu · Anambra · Ebonyi · Imo · Abia',
    monnify_biller_code: 'EEDC',
    providerCategory: 'electricity',
  },
  {
    id: 'ibedc',
    name: 'Ibadan Electricity (IBEDC)',
    shortLabel: 'IBEDC',
    category: 'electricity',
    stateLabel: 'Oyo · Ogun · Osun · Kwara',
    monnify_biller_code: 'IBEDC',
    providerCategory: 'electricity',
  },
  {
    id: 'ie',
    name: 'Ikeja Electric (IE)',
    shortLabel: 'IE',
    category: 'electricity',
    stateLabel: 'Lagos North',
    monnify_biller_code: 'IE',
    providerCategory: 'electricity',
  },
  {
    id: 'jed',
    name: 'Jos Electricity (JED)',
    shortLabel: 'JED',
    category: 'electricity',
    stateLabel: 'Plateau · Benue · Gombe · Bauchi',
    monnify_biller_code: 'JED',
    providerCategory: 'electricity',
  },
  {
    id: 'kaedco',
    name: 'Kaduna Electric (KAEDCO)',
    shortLabel: 'KAEDCO',
    category: 'electricity',
    stateLabel: 'Kaduna · Sokoto · Kebbi · Zamfara',
    monnify_biller_code: 'KAEDCO',
    providerCategory: 'electricity',
  },
  {
    id: 'kedco',
    name: 'Kano Electricity (KEDCO)',
    shortLabel: 'KEDCO',
    category: 'electricity',
    stateLabel: 'Kano · Katsina · Jigawa',
    monnify_biller_code: 'KEDCO',
    providerCategory: 'electricity',
  },
  {
    id: 'phed',
    name: 'Port Harcourt Electric (PHED)',
    shortLabel: 'PHED',
    category: 'electricity',
    stateLabel: 'Rivers · Bayelsa · Cross River · Akwa Ibom',
    monnify_biller_code: 'PHED',
    providerCategory: 'electricity',
  },
  {
    id: 'yedc',
    name: 'Yola Electricity (YEDC)',
    shortLabel: 'YEDC',
    category: 'electricity',
    stateLabel: 'Adamawa · Taraba · Borno · Yobe',
    monnify_biller_code: 'YEDC',
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
    monnify_biller_code: 'Airtel',
    providerCategory: 'airtime',
  },
  {
    id: 'glo-air',
    name: 'Glo',
    shortLabel: 'Glo',
    category: 'airtime',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'Glo',
    providerCategory: 'airtime',
  },
  {
    id: '9mobile-air',
    name: '9mobile',
    shortLabel: '9mobile',
    category: 'airtime',
    stateLabel: 'Nigeria',
    monnify_biller_code: '9mobile',
    providerCategory: 'airtime',
  },
  // Data
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
    monnify_biller_code: 'Airtel',
    providerCategory: 'data',
  },
  {
    id: 'glo-data',
    name: 'Glo Data',
    shortLabel: 'Glo',
    category: 'data',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'Glo',
    providerCategory: 'data',
  },
  {
    id: '9mobile-data',
    name: '9mobile Data',
    shortLabel: '9mobile',
    category: 'data',
    stateLabel: 'Nigeria',
    monnify_biller_code: '9mobile',
    providerCategory: 'data',
  },
  {
    id: 'smile-data',
    name: 'Smile Data',
    shortLabel: 'Smile',
    category: 'data',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'Smile',
    providerCategory: 'data',
  },
  // Cable TV
  {
    id: 'dstv',
    name: 'DStv',
    shortLabel: 'DStv',
    category: 'tv',
    stateLabel: 'Multichoice',
    monnify_biller_code: 'DSTV',
    providerCategory: 'tv',
  },
  {
    id: 'gotv',
    name: 'GOtv',
    shortLabel: 'GOtv',
    category: 'tv',
    stateLabel: 'Multichoice',
    monnify_biller_code: 'GOTV',
    providerCategory: 'tv',
  },
  {
    id: 'startimes',
    name: 'Startimes',
    shortLabel: 'Startimes',
    category: 'tv',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'STARTIMES',
    providerCategory: 'tv',
  },
  {
    id: 'showmax',
    name: 'Showmax',
    shortLabel: 'Showmax',
    category: 'tv',
    stateLabel: 'Streaming',
    monnify_biller_code: 'SHOWMAX',
    providerCategory: 'tv',
  },
  // Education
  {
    id: 'waec',
    name: 'WAEC Result Checker',
    shortLabel: 'WAEC',
    category: 'education',
    stateLabel: 'West Africa',
    monnify_biller_code: 'WAEC',
    providerCategory: 'other',
  },
  {
    id: 'neco',
    name: 'NECO Result Checker',
    shortLabel: 'NECO',
    category: 'education',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'NECO',
    providerCategory: 'other',
  },
  {
    id: 'jamb',
    name: 'JAMB ePIN',
    shortLabel: 'JAMB',
    category: 'education',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'JAMB',
    providerCategory: 'other',
  },
  {
    id: 'nabteb',
    name: 'NABTEB',
    shortLabel: 'NABTEB',
    category: 'education',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'NABTEB',
    providerCategory: 'other',
  },
  // Betting
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
    monnify_biller_code: 'SPORTYBET',
    providerCategory: 'other',
  },
  {
    id: 'betking',
    name: 'BetKing',
    shortLabel: 'BetKing',
    category: 'betting',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'BETKING',
    providerCategory: 'other',
  },
  {
    id: '1xbet',
    name: '1xBet',
    shortLabel: '1xBet',
    category: 'betting',
    stateLabel: 'Nigeria',
    monnify_biller_code: '1XBET',
    providerCategory: 'other',
  },
  {
    id: 'nairabet',
    name: 'NairaBet',
    shortLabel: 'NairaBet',
    category: 'betting',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'NAIRABET',
    providerCategory: 'other',
  },
  {
    id: 'msport',
    name: 'MSport',
    shortLabel: 'MSport',
    category: 'betting',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'MSPORT',
    providerCategory: 'other',
  },
  // Water
  {
    id: 'lagos-water',
    name: 'Lagos Water Corporation',
    shortLabel: 'LWC',
    category: 'water',
    stateLabel: 'Lagos State',
    monnify_biller_code: 'LWC',
    providerCategory: 'water',
  },
  {
    id: 'fct-water',
    name: 'FCT Water Board',
    shortLabel: 'FCT',
    category: 'water',
    stateLabel: 'Abuja FCT',
    monnify_biller_code: 'FCTWATER',
    providerCategory: 'water',
  },
  {
    id: 'rivers-water',
    name: 'Rivers State Water',
    shortLabel: 'RSWB',
    category: 'water',
    stateLabel: 'Rivers State',
    monnify_biller_code: 'RSWATER',
    providerCategory: 'water',
  },
  // Waste
  {
    id: 'lawma',
    name: 'LAWMA',
    shortLabel: 'LAWMA',
    category: 'waste',
    stateLabel: 'Lagos State',
    monnify_biller_code: 'LAWMA',
    providerCategory: 'other',
  },
  {
    id: 'revenue-plus',
    name: 'Revenue Plus (PSP)',
    shortLabel: 'Rev+',
    category: 'waste',
    stateLabel: 'Lagos PSP',
    monnify_biller_code: 'REVPLUS',
    providerCategory: 'other',
  },
  {
    id: 'environ-waste',
    name: 'Environmental Waste Mgmt',
    shortLabel: 'EWM',
    category: 'waste',
    stateLabel: 'Nigeria',
    monnify_biller_code: 'EWM',
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

  for (const meta of catalog) {
    const codeKey = normalizeKey(meta.monnify_biller_code);
    const nameKey = normalizeKey(meta.shortLabel);
    const live = liveProviders.find((p) => {
      const pCode = normalizeKey(p.monnify_biller_code);
      const pName = normalizeKey(p.name);
      return pCode.includes(codeKey) || pName.includes(nameKey) || nameKey.includes(pCode);
    });
    if (live) {
      usedLive.add(live.id);
      billers.push({ meta, provider: live });
    } else {
      billers.push({ meta, provider: metaToStaticProvider(meta) });
    }
  }

  // Append any extra live billers for this category not in catalog
  for (const live of liveProviders) {
    if (usedLive.has(live.id)) continue;
    const meta: NigeriaBillerMeta = {
      id: live.id,
      name: live.name,
      shortLabel: live.name.split(' ')[0] ?? live.name,
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
  if (UTILITY_CATEGORY_SLUGS.includes(key)) return key;
  const aliases: Record<string, UtilityCategorySlug> = {
    elec: 'electricity',
    electric: 'electricity',
    cabletv: 'tv',
    tv: 'tv',
    edu: 'education',
    bet: 'betting',
    waterbills: 'water',
    wastebill: 'waste',
    lawma: 'waste',
  };
  return aliases[key] ?? null;
}
