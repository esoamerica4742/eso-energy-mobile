import type { Href } from 'expo-router';
import { BILL_FILTER_TABS, type BillFilterTab } from '@/esopay/data/utilities';
import { slugFromFilterTab } from '@/esopay/data/nigeriaBillers';
import { ESOPAY_BILLS_HREF, esopayUtilityCategoryHref } from '@/esopay/navigation/routes';

export type { BillFilterTab as BillCategoryChip };

const LEGACY_CATEGORY_MAP: Record<string, BillFilterTab> = {
  'AIRTIME & DATA': 'ALL',
  TV: 'CABLE TV',
  MORE: 'ALL',
};

export function normalizeBillCategory(raw?: string | string[]): BillFilterTab | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;

  const decoded = decodeURIComponent(value).trim();
  const exact = BILL_FILTER_TABS.find((tab) => tab.toLowerCase() === decoded.toLowerCase());
  if (exact) return exact;

  const upper = decoded.toUpperCase();
  if (BILL_FILTER_TABS.includes(upper as BillFilterTab)) {
    return upper as BillFilterTab;
  }

  return LEGACY_CATEGORY_MAP[upper] ?? null;
}

export const QUICK_ACTION_CATEGORY: Record<string, BillFilterTab> = {
  elec: 'ELECTRICITY',
  air: 'AIRTIME',
  data: 'DATA',
  tv: 'CABLE TV',
  edu: 'EDUCATION',
  ins: 'ALL',
  bet: 'BETTING',
};

export function esopayBillsTabHref(category?: BillFilterTab): Href {
  if (!category || category === 'ALL') return ESOPAY_BILLS_HREF;
  const slug = slugFromFilterTab(category);
  if (slug) return esopayUtilityCategoryHref(slug);
  return ESOPAY_BILLS_HREF;
}
