import type { QuickPayCategoryKey } from '@/esopay/data/quickPayCatalog';
import type { UtilityCategorySlug } from '@/esopay/data/nigeriaBillers';

/** Max 2–3 words — always fits one line on BillPayCard / service tiles. */
export const BILL_PAY_CARD_HELPERS: Record<UtilityCategorySlug, string> = {
  electricity: 'Choose DISCO',
  airtime: 'Choose network',
  data: 'Select plan',
  tv: 'Choose provider',
  education: 'Select plan',
  betting: 'Fund wallet',
  water: 'Choose provider',
  waste: 'Choose provider',
};

export const QUICK_PAY_CARD_HELPERS: Record<QuickPayCategoryKey, string> = {
  elec: BILL_PAY_CARD_HELPERS.electricity,
  air: BILL_PAY_CARD_HELPERS.airtime,
  data: BILL_PAY_CARD_HELPERS.data,
  tv: BILL_PAY_CARD_HELPERS.tv,
};

export const QUICK_ACTION_HELPERS: Record<string, string> = {
  elec: BILL_PAY_CARD_HELPERS.electricity,
  air: BILL_PAY_CARD_HELPERS.airtime,
  data: BILL_PAY_CARD_HELPERS.data,
  tv: BILL_PAY_CARD_HELPERS.tv,
  edu: BILL_PAY_CARD_HELPERS.education,
  education: BILL_PAY_CARD_HELPERS.education,
  betting: BILL_PAY_CARD_HELPERS.betting,
  water: BILL_PAY_CARD_HELPERS.water,
  waste: BILL_PAY_CARD_HELPERS.waste,
  'tv-license': 'Choose provider',
  insurance: 'View plans',
  ins: 'View plans',
  bet: BILL_PAY_CARD_HELPERS.betting,
  more: 'See all',
};

export function getBillPayCardHelper(slug: UtilityCategorySlug): string {
  return BILL_PAY_CARD_HELPERS[slug];
}

export function getQuickPayCardHelper(key: QuickPayCategoryKey): string {
  return QUICK_PAY_CARD_HELPERS[key];
}

export function getQuickActionHelper(key: string): string {
  return QUICK_ACTION_HELPERS[key] ?? 'Choose provider';
}

/** Short region/network label for provider grid cards (no truncation). */
export function getBillerGridSubtitle(stateLabel: string, category: UtilityCategorySlug): string {
  const trimmed = stateLabel.trim();
  if (!trimmed) return BILL_PAY_CARD_HELPERS[category];
  const primary = trimmed.split('·')[0]?.trim() ?? trimmed;
  if (primary.length <= 20) return primary;
  return BILL_PAY_CARD_HELPERS[category];
}
