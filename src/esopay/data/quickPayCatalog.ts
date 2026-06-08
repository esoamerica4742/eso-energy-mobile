import type { BillFilterTab } from '@/esopay/data/utilities';
import { QUICK_ACTION_CATEGORY } from '@/esopay/navigation/billCategories';

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

export const QUICK_PAY_CARDS: QuickPayCardConfig[] = [
  {
    key: 'elec',
    label: 'Electricity',
    category: QUICK_ACTION_CATEGORY.elec,
    badgeText: 'IE',
    badgeBg: '#F59E0B',
    badgeFg: '#1A1200',
    tint: 'rgba(120, 72, 12, 0.28)',
    borderGlow: 'rgba(217, 119, 6, 0.38)',
    iconColor: '#F59E0B',
  },
  {
    key: 'air',
    label: 'Airtime',
    category: QUICK_ACTION_CATEGORY.air,
    badgeText: 'MTN',
    badgeBg: '#FFCC00',
    badgeFg: '#1A1400',
    tint: 'rgba(13, 94, 84, 0.32)',
    borderGlow: 'rgba(45, 212, 191, 0.35)',
    iconColor: '#2DD4BF',
  },
  {
    key: 'data',
    label: 'Data',
    category: QUICK_ACTION_CATEGORY.data,
    badgeText: 'MTN',
    badgeBg: '#FFCC00',
    badgeFg: '#1A1400',
    tint: 'rgba(56, 189, 248, 0.14)',
    borderGlow: 'rgba(56, 189, 248, 0.42)',
    iconColor: '#38BDF8',
  },
  {
    key: 'tv',
    label: 'Cable TV',
    category: QUICK_ACTION_CATEGORY.tv,
    badgeText: 'DStv',
    badgeBg: '#E50914',
    badgeFg: '#FFFFFF',
    tint: 'rgba(168, 85, 247, 0.14)',
    borderGlow: 'rgba(192, 132, 252, 0.4)',
    iconColor: '#C084FC',
  },
];
