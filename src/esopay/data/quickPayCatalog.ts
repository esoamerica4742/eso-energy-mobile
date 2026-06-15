import type { BillFilterTab } from '@/esopay/data/utilities';
import { QUICK_ACTION_CATEGORY } from '@/esopay/navigation/billCategories';
import { ESO_PAY_BORDER, ESO_PAY_GOLD, ESO_PAY_GOLD_MUTED } from '@/esopay/theme/brandColors';

export type QuickPayCategoryKey = 'elec' | 'air' | 'data' | 'tv';

/** Legacy brand ids stored in quick-pay history. */
export type QuickPayBrandId = 'ikeja' | 'mtn' | 'airtel' | 'dstv' | 'glo';

export type QuickPayCardConfig = {
  key: QuickPayCategoryKey;
  label: string;
  category: BillFilterTab;
  badgeText: string;
  badgeBg: string;
  badgeFg: string;
  tint: string;
  borderGlow: string;
  iconColor: string;
};

const GOLD_CARD_VISUAL = {
  tint: 'transparent',
  borderGlow: ESO_PAY_BORDER,
  iconColor: ESO_PAY_GOLD,
};

export const QUICK_PAY_CARDS: QuickPayCardConfig[] = [
  {
    key: 'elec',
    label: 'Electricity',
    category: QUICK_ACTION_CATEGORY.elec,
    badgeText: '',
    badgeBg: ESO_PAY_GOLD_MUTED,
    badgeFg: '#0A0F1E',
    ...GOLD_CARD_VISUAL,
  },
  {
    key: 'air',
    label: 'Airtime',
    category: QUICK_ACTION_CATEGORY.air,
    badgeText: '',
    badgeBg: ESO_PAY_GOLD_MUTED,
    badgeFg: '#0A0F1E',
    ...GOLD_CARD_VISUAL,
  },
  {
    key: 'data',
    label: 'Data',
    category: QUICK_ACTION_CATEGORY.data,
    badgeText: '',
    badgeBg: ESO_PAY_GOLD_MUTED,
    badgeFg: '#0A0F1E',
    ...GOLD_CARD_VISUAL,
  },
  {
    key: 'tv',
    label: 'Cable TV',
    category: QUICK_ACTION_CATEGORY.tv,
    badgeText: '',
    badgeBg: ESO_PAY_GOLD_MUTED,
    badgeFg: '#0A0F1E',
    ...GOLD_CARD_VISUAL,
  },
];

