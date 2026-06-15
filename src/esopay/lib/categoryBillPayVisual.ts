import type { BillPayCardVisual } from '@/esopay/components/bills/BillPayCard';
import type { UtilityCategorySlug } from '@/esopay/data/nigeriaBillers';
import { ESO_PAY_GOLD, ESO_PAY_GOLD_MUTED, ESO_PAY_BORDER } from '@/esopay/theme/brandColors';

const GOLD_VISUAL: BillPayCardVisual = {
  tint: 'transparent',
  borderGlow: ESO_PAY_BORDER,
  iconColor: ESO_PAY_GOLD,
};

const CATEGORY_VISUAL: Record<UtilityCategorySlug, BillPayCardVisual> = {
  electricity: GOLD_VISUAL,
  airtime: GOLD_VISUAL,
  data: GOLD_VISUAL,
  tv: GOLD_VISUAL,
  education: GOLD_VISUAL,
  betting: GOLD_VISUAL,
  water: GOLD_VISUAL,
  waste: GOLD_VISUAL,
};

export function getCategoryBillPayVisual(slug: UtilityCategorySlug): BillPayCardVisual {
  return CATEGORY_VISUAL[slug] ?? GOLD_VISUAL;
}

/** Icon container background for billing hub cards. */
export const BILL_PAY_ICON_CONTAINER_BG = ESO_PAY_GOLD_MUTED;

/** Provider selection card icons — unified gold. */
export const PROVIDER_ICON_COLOR = ESO_PAY_GOLD;
export const PROVIDER_ICON_BG = ESO_PAY_GOLD_MUTED;

