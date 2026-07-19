import type { UtilityProvider } from '@/esopay/api/types';
import type { PaymentBundle } from '@/esopay/data/bundles';
import {
  getOfflineBillersForCategory,
  metaToStaticProvider,
  type NigeriaBillerMeta,
} from '@/esopay/data/nigeriaBillers';
import type { CategoryBillerEntry } from '@/esopay/lib/buildCategoryBillPayCards';

export type DataPlanTab = 'hot' | 'daily' | 'weekly' | 'monthly';

export type DataPlanCard = {
  id: string;
  label: string;
  validity: string;
  amountKobo: number;
  tab: DataPlanTab;
  provider: UtilityProvider;
  meta: NigeriaBillerMeta;
};

/** Opay airtime amount grid. */
export const AIRTIME_OPAY_AMOUNTS_KOBO = [
  50_00, 100_00, 200_00, 500_00, 1_000_00, 2_000_00,
] as const;

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchNetworkProvider(
  meta: NigeriaBillerMeta,
  provider: UtilityProvider,
  slug: 'airtime' | 'data',
): boolean {
  if (provider.category !== slug) return false;
  const codeKey = normalizeKey(meta.monnify_biller_code);
  const nameKey = normalizeKey(meta.shortLabel);
  const pCode = normalizeKey(provider.monnify_biller_code);
  const pName = normalizeKey(provider.name);
  return (
    pCode === codeKey ||
    pCode.includes(codeKey) ||
    codeKey.includes(pCode) ||
    pName.includes(nameKey)
  );
}

/** Network rows only (no expanded Monnify product plans). */
export function resolveTelecomNetworks(
  slug: 'airtime' | 'data',
  liveProviders: UtilityProvider[] | undefined,
): { networks: CategoryBillerEntry[]; offline: boolean } {
  const catalog = getOfflineBillersForCategory(slug);
  const offline = !liveProviders || liveProviders.length === 0;

  if (offline) {
    return {
      offline: true,
      networks: catalog.map((meta) => ({ meta, provider: metaToStaticProvider(meta) })),
    };
  }

  const networks: CategoryBillerEntry[] = catalog.map((meta) => {
    const live = liveProviders.find((p) => matchNetworkProvider(meta, p, slug));
    return {
      meta,
      provider: live ?? metaToStaticProvider(meta),
    };
  });

  return { offline: false, networks };
}

export function findNetworkByCode(
  networks: CategoryBillerEntry[],
  code: string,
): CategoryBillerEntry | undefined {
  const codeKey = normalizeKey(code);
  return networks.find(
    (n) =>
      normalizeKey(n.meta.monnify_biller_code) === codeKey ||
      normalizeKey(n.provider.monnify_biller_code) === codeKey ||
      normalizeKey(n.meta.shortLabel) === codeKey ||
      normalizeKey(n.meta.id).includes(codeKey),
  );
}

function daysFromValidity(text: string): number | null {
  const lower = text.toLowerCase();
  if (/30\s*day|monthly|1\s*month/.test(lower)) return 30;
  if (/7\s*day|weekly|1\s*week/.test(lower)) return 7;
  if (/2\s*day/.test(lower)) return 2;
  if (/1\s*day|daily|24\s*h/.test(lower)) return 1;
  const m = lower.match(/(\d+)\s*day/);
  if (m) return Number(m[1]);
  return null;
}

export function tabForValidity(validity: string): DataPlanTab {
  const days = daysFromValidity(validity);
  if (days == null) return 'daily';
  if (days <= 2) return 'daily';
  if (days <= 7) return 'weekly';
  return 'monthly';
}

function parseLivePlanLabel(name: string): { label: string; validity: string } {
  const parts = name.split('—').map((p) => p.trim());
  const tail = parts[parts.length - 1] ?? name;
  const dataMatch = tail.match(/(\d+(?:\.\d+)?\s*(?:GB|MB|TB))/i);
  const label = dataMatch?.[1]?.replace(/\s+/g, '') ?? tail;
  const dayMatch = tail.match(/(\d+\s*days?|daily|weekly|monthly|1\s*month)/i);
  let validity = 'Plan';
  if (dayMatch?.[1]) {
    const raw = dayMatch[1];
    if (/daily/i.test(raw)) validity = '1 Day';
    else if (/weekly/i.test(raw)) validity = '7 Days';
    else if (/monthly|month/i.test(raw)) validity = '30 Days';
    else validity = raw.replace(/days?/i, (m) => (/^day/i.test(m) ? 'Day' : 'Days'));
  }
  return { label, validity };
}

function fixedPlanAmount(provider: UtilityProvider): number | null {
  const max = provider.maximum_amount_kobo;
  const min = provider.minimum_amount_kobo;
  if (max != null && max > 0 && (min == null || min === max)) return max;
  if (min != null && max != null && min === max && min > 0) return min;
  return null;
}

/** Build Opay-style data plan cards for a selected network. */
export function buildDataPlanCards(
  network: CategoryBillerEntry,
  liveProviders: UtilityProvider[] | undefined,
  staticBundles: PaymentBundle[],
): DataPlanCard[] {
  const livePlans = (liveProviders ?? []).filter((p) =>
    matchNetworkProvider(network.meta, p, 'data'),
  );

  const cards: DataPlanCard[] = [];

  for (const provider of livePlans) {
    const amount = fixedPlanAmount(provider);
    if (amount == null || amount <= 0) continue;
    const { label, validity } = parseLivePlanLabel(provider.name);
    cards.push({
      id: provider.id,
      label,
      validity,
      amountKobo: amount,
      tab: tabForValidity(validity),
      provider,
      meta: {
        ...network.meta,
        id: `${network.meta.id}-${provider.id}`,
        name: provider.name,
      },
    });
  }

  if (cards.length === 0) {
    for (const bundle of staticBundles) {
      cards.push({
        id: bundle.id,
        label: bundle.label,
        validity: bundle.sublabel ?? 'Plan',
        amountKobo: bundle.amountKobo,
        tab: tabForValidity(bundle.sublabel ?? ''),
        provider: network.provider,
        meta: network.meta,
      });
    }
  }

  return cards;
}

/** HOT = cheapest plans; other tabs filter by validity. */
export function filterDataPlansByTab(plans: DataPlanCard[], tab: DataPlanTab): DataPlanCard[] {
  if (tab === 'hot') {
    return [...plans].sort((a, b) => a.amountKobo - b.amountKobo).slice(0, 9);
  }
  return plans.filter((p) => p.tab === tab);
}

export function countDataPlansByTab(plans: DataPlanCard[]): Record<DataPlanTab, number> {
  return {
    hot: filterDataPlansByTab(plans, 'hot').length,
    daily: filterDataPlansByTab(plans, 'daily').length,
    weekly: filterDataPlansByTab(plans, 'weekly').length,
    monthly: filterDataPlansByTab(plans, 'monthly').length,
  };
}

/** Prefer last-used network, else MTN, else first. */
export function preferTelecomNetwork(
  networks: CategoryBillerEntry[],
  recentCodeOrName?: string | null,
): CategoryBillerEntry | null {
  if (networks.length === 0) return null;
  if (recentCodeOrName) {
    const match = findNetworkByCode(networks, recentCodeOrName);
    if (match) return match;
    const nameKey = normalizeKey(recentCodeOrName);
    const byName = networks.find(
      (n) =>
        normalizeKey(n.meta.shortLabel).includes(nameKey) ||
        nameKey.includes(normalizeKey(n.meta.shortLabel)) ||
        normalizeKey(n.provider.name).includes(nameKey),
    );
    if (byName) return byName;
  }
  return findNetworkByCode(networks, 'MTN') ?? networks[0] ?? null;
}

export function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

export function phoneDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 11);
}
