import type { UtilityProvider } from '@/esopay/api/types';

export type UtilityService = {
  id: string;
  name: string;
  category: UtilityCatalogCategory;
  shortCode?: string;
};

export const BILL_FILTER_TABS = [
  'ALL',
  'ELECTRICITY',
  'AIRTIME',
  'DATA',
  'CABLE TV',
  'EDUCATION',
  'BETTING',
] as const;

export const BILL_CATEGORIES = BILL_FILTER_TABS;

export type BillFilterTab = (typeof BILL_FILTER_TABS)[number];
export type BillCategoryChip = BillFilterTab;

export const BILL_FILTER_OPTIONS: { value: BillFilterTab; label: string }[] = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'ELECTRICITY', label: 'Electricity' },
  { value: 'AIRTIME', label: 'Airtime' },
  { value: 'DATA', label: 'Data' },
  { value: 'CABLE TV', label: 'Cable TV' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'BETTING', label: 'Betting' },
];

type UtilityCatalogCategory =
  | 'ELECTRICITY'
  | 'AIRTIME'
  | 'DATA'
  | 'CABLE_TV'
  | 'EDUCATION'
  | 'BETTING'
  | 'OTHER';

export type BillerDisplayGroup =
  | 'electricity'
  | 'airtime'
  | 'data'
  | 'cable_tv'
  | 'education'
  | 'betting'
  | 'others';

export const BILLER_GROUP_ORDER: BillerDisplayGroup[] = [
  'electricity',
  'airtime',
  'data',
  'cable_tv',
  'education',
  'betting',
  'others',
];

export const BILLER_GROUP_META: Record<
  BillerDisplayGroup,
  {
    title: string;
    hint: string;
    filterTab: BillFilterTab | null;
  }
> = {
  electricity: {
    title: 'Electricity',
    hint: 'Prepaid & postpaid meters',
    filterTab: 'ELECTRICITY',
  },
  airtime: {
    title: 'Airtime',
    hint: 'MTN · Airtel · Glo · 9mobile',
    filterTab: 'AIRTIME',
  },
  data: {
    title: 'Data',
    hint: 'Mobile data bundles',
    filterTab: 'DATA',
  },
  cable_tv: {
    title: 'Cable TV',
    hint: 'DStv · GOtv · Startimes',
    filterTab: 'CABLE TV',
  },
  education: {
    title: 'Education',
    hint: 'WAEC · NECO · JAMB',
    filterTab: 'EDUCATION',
  },
  betting: {
    title: 'Betting',
    hint: 'Fund your wallet',
    filterTab: 'BETTING',
  },
  others: {
    title: 'Others',
    hint: 'More billers',
    filterTab: null,
  },
};

/** Map filter tab → folder key for quick-jump from category tiles */
export function filterTabToDisplayGroup(tab: BillFilterTab): BillerDisplayGroup | null {
  if (tab === 'ALL') return null;
  const entry = BILLER_GROUP_ORDER.find((key) => BILLER_GROUP_META[key].filterTab === tab);
  return entry ?? null;
}

export const UTILITY_SERVICES: UtilityService[] = [
  { id: 'ie', name: 'Ikeja Electric (IE)', category: 'ELECTRICITY' },
  { id: 'ekedc', name: 'Eko Electric (EKEDC)', category: 'ELECTRICITY' },
  { id: 'aedc', name: 'Abuja Electric (AEDC)', category: 'ELECTRICITY' },
  { id: 'eedc', name: 'Enugu Electric (EEDC)', category: 'ELECTRICITY' },
  { id: 'ibedc', name: 'Ibadan Electric (IBEDC)', category: 'ELECTRICITY' },
  { id: 'phed', name: 'Port Harcourt Electric', category: 'ELECTRICITY' },
  { id: 'mtn-air', name: 'MTN', category: 'AIRTIME', shortCode: 'MTN' },
  { id: 'airtel-air', name: 'Airtel', category: 'AIRTIME', shortCode: 'Airtel' },
  { id: 'glo-air', name: 'Glo', category: 'AIRTIME', shortCode: 'Glo' },
  { id: '9mobile-air', name: '9mobile', category: 'AIRTIME', shortCode: '9mobile' },
  { id: 'mtn-data', name: 'MTN Data', category: 'DATA', shortCode: 'MTN' },
  { id: 'airtel-data', name: 'Airtel Data', category: 'DATA', shortCode: 'Airtel' },
  { id: 'glo-data', name: 'Glo Data', category: 'DATA', shortCode: 'Glo' },
  { id: '9mobile-data', name: '9mobile Data', category: 'DATA', shortCode: '9mobile' },
  { id: 'dstv', name: 'DStv', category: 'CABLE_TV' },
  { id: 'gotv', name: 'GOtv', category: 'CABLE_TV' },
  { id: 'startimes', name: 'Startimes', category: 'CABLE_TV' },
  { id: 'showmax', name: 'Showmax', category: 'CABLE_TV' },
  { id: 'waec', name: 'WAEC Result Checker', category: 'EDUCATION' },
  { id: 'bet9ja', name: 'Bet9ja', category: 'BETTING' },
  { id: 'smile', name: 'Smile Telecom', category: 'OTHER' },
];

function mapCatalogCategory(category: UtilityCatalogCategory): UtilityProvider['category'] {
  switch (category) {
    case 'ELECTRICITY':
      return 'electricity';
    case 'AIRTIME':
      return 'airtime';
    case 'DATA':
      return 'data';
    case 'CABLE_TV':
      return 'tv';
    case 'EDUCATION':
    case 'BETTING':
    case 'OTHER':
      return 'other';
    default:
      return 'other';
  }
}

export const STATIC_UTILITY_PROVIDERS: UtilityProvider[] = UTILITY_SERVICES.map((service) => ({
  id: `static-${service.id}`,
  name: service.name,
  category: mapCatalogCategory(service.category),
  monnify_biller_code: service.shortCode ?? service.id.toUpperCase(),
}));

export function staticUtilityProviders(): UtilityProvider[] {
  return STATIC_UTILITY_PROVIDERS;
}

export function getBillerDisplayGroup(provider: UtilityProvider): BillerDisplayGroup {
  const name = provider.name.toLowerCase();

  if (provider.category === 'electricity') return 'electricity';
  if (provider.category === 'airtime') return 'airtime';
  if (provider.category === 'data') return 'data';
  if (provider.category === 'tv') return 'cable_tv';
  if (name.includes('waec') || name.includes('neco') || name.includes('jamb')) return 'education';
  if (
    /bet9ja|betting|sporty|nairabet|1xbet|msport|ilot|betpawa|merrybet|bangbet|supabet|cloudbet|betway|betland|betking|livescore|naijabet/.test(
      name.replace(/[\s_-]/g, ''),
    )
  ) {
    return 'betting';
  }
  if (provider.category === 'other') return 'others';
  return 'others';
}

export function matchesBillFilterTab(provider: UtilityProvider, tab: BillFilterTab): boolean {
  if (tab === 'ALL') return true;
  const group = getBillerDisplayGroup(provider);
  return BILLER_GROUP_META[group].filterTab === tab;
}

export function groupBillers(
  providers: UtilityProvider[],
): Record<BillerDisplayGroup, UtilityProvider[]> {
  const groups = Object.fromEntries(
    BILLER_GROUP_ORDER.map((key) => [key, [] as UtilityProvider[]]),
  ) as Record<BillerDisplayGroup, UtilityProvider[]>;

  for (const provider of providers) {
    groups[getBillerDisplayGroup(provider)].push(provider);
  }

  for (const key of BILLER_GROUP_ORDER) {
    if (key === 'electricity') {
      groups[key].sort(compareElectricityBillers);
    } else {
      groups[key].sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  return groups;
}

const ELECTRICITY_RANK: Record<string, number> = {
  aedc: 0,
  ekedc: 1,
  eedc: 2,
  ibedc: 3,
  ie: 4,
  phed: 5,
};

function electricityRank(provider: UtilityProvider): number {
  const id = provider.id.replace(/^static-/, '').toLowerCase();
  const base = id.replace(/-air$|-data$/, '');
  if (base in ELECTRICITY_RANK) return ELECTRICITY_RANK[base]!;
  const name = provider.name.toLowerCase();
  if (name.includes('abuja')) return 0;
  if (name.includes('eko')) return 1;
  if (name.includes('enugu')) return 2;
  if (name.includes('ibadan')) return 3;
  if (name.includes('ikeja')) return 4;
  if (name.includes('port harcourt')) return 5;
  return 99;
}

function compareElectricityBillers(a: UtilityProvider, b: UtilityProvider): number {
  return electricityRank(a) - electricityRank(b);
}

export function getBillerCardLabel(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('abuja') || lower.includes('aedc')) return 'AEDC';
  if (lower.includes('eko') || lower.includes('ekedc')) return 'EKEDC';
  if (lower.includes('enugu')) return 'Enugu Electric';
  if (lower.includes('ibadan') || lower.includes('ibedc')) return 'IBEDC';
  if (lower.includes('ikeja')) return 'Ikeja Electric';
  if (lower.includes('port harcourt')) return 'Port Harcourt Electric';
  if (lower === 'mtn' || lower.startsWith('mtn ')) return lower.includes('data') ? 'MTN Data' : 'MTN';
  return name;
}

export function isOfflineStaticProvider(provider: UtilityProvider): boolean {
  return provider.id.startsWith('static-');
}
