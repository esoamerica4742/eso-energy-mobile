import type { UtilityProvider } from '@/esopay/api/types';
import type { UtilityCategorySlug } from '@/esopay/data/nigeriaBillers';
import { UTILITY_AMOUNT_PRESETS_KOBO } from '@/esopay/data/nigeriaBillers';

export type PaymentBundle = {
  id: string;
  label: string;
  sublabel?: string;
  amountKobo: number;
};

export type UtilityAmountMode = 'bundles' | 'presets';

export type UtilityAmountOptions = {
  mode: UtilityAmountMode;
  sectionTitle: string;
  bundles: PaymentBundle[];
  /** Extra ₦1k–₦20k chips shown below bundles (data/tv/airtime) */
  showPresetAmounts: boolean;
};

/** Quick chips — up to ₦2,000. Manual entry uses min/max below. */
export const AIRTIME_QUICK_MAX_KOBO = 2_000_00;
export const AIRTIME_MANUAL_MIN_KOBO = 50_00;
export const AIRTIME_MANUAL_MAX_KOBO = 1_000_000_00;

export const AIRTIME_QUICK_AMOUNTS_KOBO = [
  50_00, 100_00, 200_00, 500_00, 1_000_00, 2_000_00,
] as const;

const MTN_DATA: PaymentBundle[] = [
  { id: 'mtn-500mb', label: '500MB', sublabel: '1 day', amountKobo: 350_00 },
  { id: 'mtn-1gb', label: '1GB', sublabel: '1 day', amountKobo: 500_00 },
  { id: 'mtn-2gb', label: '2GB', sublabel: '2 days', amountKobo: 750_00 },
  { id: 'mtn-3gb', label: '3GB', sublabel: '2 days', amountKobo: 1_000_00 },
  { id: 'mtn-6gb', label: '6GB', sublabel: '7 days', amountKobo: 2_500_00 },
  { id: 'mtn-10gb', label: '10GB', sublabel: '30 days', amountKobo: 4_500_00 },
  { id: 'mtn-15gb', label: '15GB', sublabel: '30 days', amountKobo: 6_500_00 },
  { id: 'mtn-20gb', label: '20GB', sublabel: '30 days', amountKobo: 7_500_00 },
];

const AIRTEL_DATA: PaymentBundle[] = [
  { id: 'air-750mb', label: '750MB', sublabel: '1 day', amountKobo: 500_00 },
  { id: 'air-1.5gb', label: '1.5GB', sublabel: '2 days', amountKobo: 1_000_00 },
  { id: 'air-3gb', label: '3GB', sublabel: '2 days', amountKobo: 1_500_00 },
  { id: 'air-6gb', label: '6GB', sublabel: '7 days', amountKobo: 2_500_00 },
  { id: 'air-10gb', label: '10GB', sublabel: '30 days', amountKobo: 4_000_00 },
  { id: 'air-15gb', label: '15GB', sublabel: '30 days', amountKobo: 5_500_00 },
  { id: 'air-20gb', label: '20GB', sublabel: '30 days', amountKobo: 7_000_00 },
];

const GLO_DATA: PaymentBundle[] = [
  { id: 'glo-1gb', label: '1GB', sublabel: '1 day', amountKobo: 350_00 },
  { id: 'glo-2.5gb', label: '2.5GB', sublabel: '2 days', amountKobo: 1_000_00 },
  { id: 'glo-5gb', label: '5GB', sublabel: '7 days', amountKobo: 2_000_00 },
  { id: 'glo-10gb', label: '10GB', sublabel: '30 days', amountKobo: 4_000_00 },
  { id: 'glo-15gb', label: '15GB', sublabel: '30 days', amountKobo: 5_500_00 },
];

const NINE_MOBILE_DATA: PaymentBundle[] = [
  { id: '9m-750mb', label: '750MB', sublabel: '1 day', amountKobo: 450_00 },
  { id: '9m-1.5gb', label: '1.5GB', sublabel: '2 days', amountKobo: 900_00 },
  { id: '9m-3gb', label: '3GB', sublabel: '2 days', amountKobo: 1_400_00 },
  { id: '9m-6gb', label: '6GB', sublabel: '7 days', amountKobo: 2_200_00 },
  { id: '9m-10gb', label: '10GB', sublabel: '30 days', amountKobo: 4_000_00 },
];

const SMILE_DATA: PaymentBundle[] = [
  { id: 'smile-1gb', label: '1GB', sublabel: '30 days', amountKobo: 1_000_00 },
  { id: 'smile-2gb', label: '2GB', sublabel: '30 days', amountKobo: 1_800_00 },
  { id: 'smile-5gb', label: '5GB', sublabel: '30 days', amountKobo: 3_500_00 },
  { id: 'smile-10gb', label: '10GB', sublabel: '30 days', amountKobo: 6_000_00 },
];

const DSTV_BOUQUETS: PaymentBundle[] = [
  { id: 'dstv-padi', label: 'Padi', sublabel: 'Entry bouquet', amountKobo: 2_950_00 },
  { id: 'dstv-yanga', label: 'Yanga', sublabel: 'Family starter', amountKobo: 4_200_00 },
  { id: 'dstv-confam', label: 'Confam', sublabel: 'Popular plan', amountKobo: 7_400_00 },
  { id: 'dstv-compact', label: 'Compact', sublabel: 'Sports lite', amountKobo: 12_600_00 },
  { id: 'dstv-compact-plus', label: 'Compact+', sublabel: 'Sports & movies', amountKobo: 19_800_00 },
  { id: 'dstv-premium', label: 'Premium', sublabel: 'All channels', amountKobo: 37_000_00 },
  { id: 'dstv-premium-w', label: 'Premium W/Afr', sublabel: 'Premium + extra', amountKobo: 42_000_00 },
  { id: 'dstv-asian', label: 'Asian', sublabel: 'Add-on', amountKobo: 2_800_00 },
];

const GOTV_BOUQUETS: PaymentBundle[] = [
  { id: 'gotv-smallie', label: 'Smallie', sublabel: 'Monthly', amountKobo: 1_575_00 },
  { id: 'gotv-jinja', label: 'Jinja', sublabel: 'Monthly', amountKobo: 3_300_00 },
  { id: 'gotv-jolli', label: 'Jolli', sublabel: 'Monthly', amountKobo: 4_850_00 },
  { id: 'gotv-max', label: 'Max', sublabel: 'Monthly', amountKobo: 7_200_00 },
  { id: 'gotv-supaplus', label: 'Supa+', sublabel: 'Monthly', amountKobo: 12_500_00 },
];

const STARTIMES_BOUQUETS: PaymentBundle[] = [
  { id: 'star-nova', label: 'Nova', sublabel: 'Monthly', amountKobo: 1_700_00 },
  { id: 'star-basic', label: 'Basic', sublabel: 'Monthly', amountKobo: 3_000_00 },
  { id: 'star-smart', label: 'Smart', sublabel: 'Monthly', amountKobo: 4_500_00 },
  { id: 'star-classic', label: 'Classic', sublabel: 'Monthly', amountKobo: 6_000_00 },
  { id: 'star-super', label: 'Super', sublabel: 'Monthly', amountKobo: 8_500_00 },
];

const SHOWMAX_BOUQUETS: PaymentBundle[] = [
  { id: 'show-mobile', label: 'Mobile', sublabel: '1 device', amountKobo: 1_200_00 },
  { id: 'show-full', label: 'Full', sublabel: 'All devices', amountKobo: 3_500_00 },
  { id: 'show-sport', label: 'Sports', sublabel: 'Sports add-on', amountKobo: 2_900_00 },
];

const WAEC_BUNDLES: PaymentBundle[] = [
  { id: 'waec-pin-1', label: 'Result Checker PIN', sublabel: '1 candidate', amountKobo: 3_650_00 },
  { id: 'waec-pin-2', label: 'Result Checker PIN', sublabel: '2 candidates', amountKobo: 7_300_00 },
  { id: 'waec-pin-5', label: 'Result Checker PIN', sublabel: '5 candidates', amountKobo: 18_250_00 },
];

const NECO_BUNDLES: PaymentBundle[] = [
  { id: 'neco-token', label: 'NECO Token', sublabel: '1 check', amountKobo: 1_000_00 },
  { id: 'neco-token-5', label: 'NECO Token', sublabel: '5 checks', amountKobo: 4_500_00 },
];

const JAMB_BUNDLES: PaymentBundle[] = [
  { id: 'jamb-epin', label: 'JAMB ePIN', sublabel: 'UTME registration', amountKobo: 7_700_00 },
  { id: 'jamb-mock', label: 'Mock ePIN', sublabel: 'Mock exam', amountKobo: 2_000_00 },
];

const NABTEB_BUNDLES: PaymentBundle[] = [
  { id: 'nabteb-pin', label: 'NABTEB PIN', sublabel: '1 check', amountKobo: 1_500_00 },
];

function airtimeBundles(): PaymentBundle[] {
  return AIRTIME_QUICK_AMOUNTS_KOBO.map((amountKobo) => ({
    id: `air-${amountKobo}`,
    label: `₦${(amountKobo / 100).toLocaleString('en-NG')}`,
    sublabel: 'Airtime',
    amountKobo,
  }));
}

/** Static data catalogs for offline / network-first Opay data UI. */
export function getStaticDataBundles(provider: UtilityProvider): PaymentBundle[] {
  return bundlesForName(provider.name, 'data') ?? MTN_DATA;
}

function presetBundles(): PaymentBundle[] {
  return UTILITY_AMOUNT_PRESETS_KOBO.map((amountKobo) => ({
    id: `preset-${amountKobo}`,
    label: formatNairaLabel(amountKobo),
    sublabel: undefined,
    amountKobo,
  }));
}

function formatNairaLabel(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString('en-NG')}`;
}

function bundlesForName(name: string, category: UtilityProvider['category']): PaymentBundle[] | null {
  const lower = name.toLowerCase();
  if (category === 'data' || lower.includes('data')) {
    if (lower.includes('mtn')) return MTN_DATA;
    if (lower.includes('airtel')) return AIRTEL_DATA;
    if (lower.includes('glo')) return GLO_DATA;
    if (lower.includes('9mobile') || lower.includes('etisalat')) return NINE_MOBILE_DATA;
    if (lower.includes('smile')) return SMILE_DATA;
    return MTN_DATA;
  }
  if (category === 'tv' || lower.includes('dstv') || lower.includes('gotv') || lower.includes('startimes')) {
    if (lower.includes('gotv')) return GOTV_BOUQUETS;
    if (lower.includes('startimes')) return STARTIMES_BOUQUETS;
    if (lower.includes('showmax')) return SHOWMAX_BOUQUETS;
    return DSTV_BOUQUETS;
  }
  if (category === 'airtime') return airtimeBundles();
  if (lower.includes('waec')) return WAEC_BUNDLES;
  if (lower.includes('neco')) return NECO_BUNDLES;
  if (lower.includes('jamb')) return JAMB_BUNDLES;
  if (lower.includes('nabteb')) return NABTEB_BUNDLES;
  return null;
}

export function getPaymentBundles(provider: UtilityProvider): PaymentBundle[] | null {
  const live = !provider.id.startsWith('static-');
  if (live && (provider.category === 'data' || provider.category === 'tv')) {
    const fixed = getFixedPlanAmountKobo(provider);
    if (fixed != null) {
      const parts = provider.name.split('—');
      return [
        {
          id: `live-${provider.id}`,
          label: (parts[parts.length - 1] ?? provider.name).trim(),
          sublabel: 'Live price',
          amountKobo: fixed,
        },
      ];
    }
    return null;
  }
  return bundlesForName(provider.name, provider.category);
}

export function isQuickAmountBundles(provider: UtilityProvider): boolean {
  return provider.category === 'airtime';
}

/** Fixed Monnify plan price when min/max collapse to one amount (data/TV product rows). */
export function getFixedPlanAmountKobo(provider: UtilityProvider): number | null {
  const max = provider.maximum_amount_kobo;
  const min = provider.minimum_amount_kobo;
  if (max != null && max > 0 && (min == null || min === max)) return max;
  if (min != null && max != null && min === max && min > 0) return min;
  return null;
}

function isLiveProvider(provider: UtilityProvider): boolean {
  return !provider.id.startsWith('static-');
}

function livePlanLabel(provider: UtilityProvider): string {
  const parts = provider.name.split('—');
  return (parts[parts.length - 1] ?? provider.name).trim();
}

/** OPay-style amount step options for utility flow screens. */
export function getUtilityAmountOptions(
  slug: UtilityCategorySlug,
  provider: UtilityProvider,
): UtilityAmountOptions {
  const live = isLiveProvider(provider);
  const fixed = getFixedPlanAmountKobo(provider);

  // Online data/TV: never show stale static bouquet prices — use Monnify product amount.
  if (live && (slug === 'data' || slug === 'tv')) {
    if (fixed != null) {
      return {
        mode: 'bundles',
        sectionTitle: slug === 'tv' ? 'Selected package' : 'Selected plan',
        bundles: [
          {
            id: `live-${provider.id}`,
            label: livePlanLabel(provider),
            sublabel: 'Live price',
            amountKobo: fixed,
          },
        ],
        showPresetAmounts: false,
      };
    }
    return {
      mode: 'presets',
      sectionTitle: 'Amount',
      bundles: presetBundles(),
      showPresetAmounts: false,
    };
  }

  const fromProvider = bundlesForName(provider.name, provider.category);

  switch (slug) {
    case 'data':
      return {
        mode: 'bundles',
        sectionTitle: 'Data plans',
        bundles: fromProvider ?? MTN_DATA,
        showPresetAmounts: true,
      };
    case 'tv':
      return {
        mode: 'bundles',
        sectionTitle: 'Subscription packages',
        bundles: fromProvider ?? DSTV_BOUQUETS,
        showPresetAmounts: true,
      };
    case 'airtime':
      return {
        mode: 'bundles',
        sectionTitle: 'Top-up amount',
        bundles: airtimeBundles(),
        showPresetAmounts: false,
      };
    case 'education':
      return {
        mode: 'bundles',
        sectionTitle: 'Select product',
        bundles: fromProvider ?? WAEC_BUNDLES,
        showPresetAmounts: true,
      };
    case 'electricity':
      return {
        mode: 'presets',
        sectionTitle: 'Token amount',
        bundles: presetBundles(),
        showPresetAmounts: false,
      };
    case 'betting':
      return {
        mode: 'presets',
        sectionTitle: 'Fund amount',
        bundles: presetBundles(),
        showPresetAmounts: false,
      };
    default:
      return {
        mode: 'presets',
        sectionTitle: 'Amount',
        bundles: presetBundles(),
        showPresetAmounts: false,
      };
  }
}
