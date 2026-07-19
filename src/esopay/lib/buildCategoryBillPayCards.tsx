import type { ReactNode } from 'react';
import type { RecentUtilityPayment, UtilityProvider } from '@/esopay/api/types';
import { BillPayCategoryIcon } from '@/esopay/components/bills/BillPayCategoryIcon';
import type { BillPayCardItem } from '@/esopay/components/bills/BillPayCard';
import { ServiceCardIcon } from '@/esopay/components/bills/ServiceCardIcon';
import { getBillerBrandStyle } from '@/esopay/data/billerBrands';
import {
  getPopularBillersForCategory,
  type NigeriaBillerMeta,
  type UtilityCategorySlug,
} from '@/esopay/data/nigeriaBillers';
import { getCategoryBillPayVisual } from '@/esopay/lib/categoryBillPayVisual';
import { getBillerGridSubtitle, getProviderCardTitle } from '@/esopay/lib/billPayCardHelpers';

export type CategoryBillerEntry = {
  provider: UtilityProvider;
  meta: NigeriaBillerMeta;
};

function normalizeMatchKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findBillerEntry(
  billers: CategoryBillerEntry[],
  provider: UtilityProvider,
): CategoryBillerEntry | undefined {
  const nameKey = normalizeMatchKey(provider.name);
  const codeKey = normalizeMatchKey(provider.monnify_biller_code);

  return billers.find(({ provider: p, meta }) => {
    if (p.id === provider.id) return true;
    const pName = normalizeMatchKey(p.name);
    const mCode = normalizeMatchKey(meta.monnify_biller_code);
    return (
      pName === nameKey ||
      pName.includes(nameKey) ||
      nameKey.includes(pName) ||
      mCode === codeKey ||
      normalizeMatchKey(meta.shortLabel) === nameKey
    );
  });
}

function buildCard(
  slug: UtilityCategorySlug,
  entry: CategoryBillerEntry,
  index: number,
  onPress: () => void,
  options?: { paidBefore?: boolean },
): BillPayCardItem {
  const visual = getCategoryBillPayVisual(slug);
  const brand = getBillerBrandStyle(entry.provider);
  const icon: ReactNode = (
    <ServiceCardIcon>
      <BillPayCategoryIcon slug={slug} color={visual.iconColor} size={22} />
    </ServiceCardIcon>
  );
  const subtitle = options?.paidBefore
    ? 'Paid before'
    : getBillerGridSubtitle(entry.meta.stateLabel, slug);

  return {
    id: entry.provider.id,
    title: slug === 'electricity' ? getProviderCardTitle(entry.meta) : entry.meta.name,
    subtitle,
    badgeText: entry.meta.shortLabel,
    badgeBg: brand.logoBg,
    badgeFg: brand.logoFg,
    icon,
    visual,
    index,
    highlightBadge: options?.paidBefore ? 'recent' : null,
    onPress,
  };
}

/** Recent → popular → A–Z (Opay-style ordering). */
export function buildOrderedCategoryBillers(
  slug: UtilityCategorySlug,
  billers: CategoryBillerEntry[],
  recentPayments: RecentUtilityPayment[],
): CategoryBillerEntry[] {
  const recentEntries: CategoryBillerEntry[] = [];
  const recentIds = new Set<string>();

  for (const payment of recentPayments) {
    const entry = findBillerEntry(billers, payment.provider);
    if (!entry || recentIds.has(entry.provider.id)) continue;
    recentIds.add(entry.provider.id);
    recentEntries.push(entry);
  }

  const rest = billers.filter((entry) => !recentIds.has(entry.provider.id));

  const popularCodes = new Set(
    getPopularBillersForCategory(slug).map((m) => normalizeMatchKey(m.monnify_biller_code)),
  );
  const popularRest: CategoryBillerEntry[] = [];
  const otherRest: CategoryBillerEntry[] = [];
  for (const entry of rest) {
    const code = normalizeMatchKey(entry.meta.monnify_biller_code);
    if (popularCodes.has(code)) popularRest.push(entry);
    else otherRest.push(entry);
  }
  otherRest.sort((a, b) => a.meta.name.localeCompare(b.meta.name));

  return [...recentEntries, ...popularRest, ...otherRest];
}

/** All billers in a 2-column grid — recent first. */
export function buildCategoryBillPayGridItems(
  slug: UtilityCategorySlug,
  billers: CategoryBillerEntry[],
  recentPayments: RecentUtilityPayment[],
  onSelect: (entry: CategoryBillerEntry) => void,
): BillPayCardItem[] {
  const recentIds = new Set<string>();
  for (const payment of recentPayments) {
    const entry = findBillerEntry(billers, payment.provider);
    if (entry) recentIds.add(entry.provider.id);
  }

  const ordered = buildOrderedCategoryBillers(slug, billers, recentPayments);

  return ordered.map((entry, index) => {
    const paidBefore = recentIds.has(entry.provider.id);
    return buildCard(slug, entry, index, () => onSelect(entry), { paidBefore });
  });
}

export { getCategoryBillPayVisual };
