import type { ReactNode } from 'react';
import type { RecentUtilityPayment, UtilityProvider } from '@/esopay/api/types';
import { BillPayCategoryIcon } from '@/esopay/components/bills/BillPayCategoryIcon';
import type { BillPayCardItem } from '@/esopay/components/bills/BillPayCard';
import { getBillerBrandStyle } from '@/esopay/data/billerBrands';
import {
  type NigeriaBillerMeta,
  type UtilityCategorySlug,
} from '@/esopay/data/nigeriaBillers';
import { getCategoryBillPayVisual } from '@/esopay/lib/categoryBillPayVisual';
import { getBillerGridSubtitle } from '@/esopay/lib/billPayCardHelpers';

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
    <BillPayCategoryIcon slug={slug} color={visual.iconColor} />
  );
  const subtitle = options?.paidBefore
    ? 'Paid before'
    : getBillerGridSubtitle(entry.meta.stateLabel, slug);

  return {
    id: entry.provider.id,
    title: entry.meta.name,
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

/** All billers in a 2-column grid — recent first. */
export function buildCategoryBillPayGridItems(
  slug: UtilityCategorySlug,
  billers: CategoryBillerEntry[],
  recentPayments: RecentUtilityPayment[],
  onSelect: (entry: CategoryBillerEntry) => void,
): BillPayCardItem[] {
  const recentEntries: CategoryBillerEntry[] = [];
  const recentIds = new Set<string>();

  for (const payment of recentPayments) {
    const entry = findBillerEntry(billers, payment.provider);
    if (!entry || recentIds.has(entry.provider.id)) continue;
    recentIds.add(entry.provider.id);
    recentEntries.push(entry);
  }

  const rest = billers.filter((entry) => !recentIds.has(entry.provider.id));
  const ordered = [...recentEntries, ...rest];

  return ordered.map((entry, index) => {
    const paidBefore = recentIds.has(entry.provider.id);
    return buildCard(slug, entry, index, () => onSelect(entry), { paidBefore });
  });
}

export { getCategoryBillPayVisual };
