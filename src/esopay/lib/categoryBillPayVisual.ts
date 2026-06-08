import type { BillPayCardVisual } from '@/esopay/components/bills/BillPayCard';
import type { UtilityCategorySlug } from '@/esopay/data/nigeriaBillers';

const CATEGORY_VISUAL: Record<UtilityCategorySlug, BillPayCardVisual> = {
  electricity: {
    tint: 'rgba(120, 72, 12, 0.28)',
    borderGlow: 'rgba(217, 119, 6, 0.38)',
    iconColor: '#F59E0B',
  },
  airtime: {
    tint: 'rgba(13, 94, 84, 0.32)',
    borderGlow: 'rgba(45, 212, 191, 0.35)',
    iconColor: '#2DD4BF',
  },
  data: {
    tint: 'rgba(56, 189, 248, 0.14)',
    borderGlow: 'rgba(56, 189, 248, 0.42)',
    iconColor: '#38BDF8',
  },
  tv: {
    tint: 'rgba(168, 85, 247, 0.14)',
    borderGlow: 'rgba(192, 132, 252, 0.4)',
    iconColor: '#C084FC',
  },
  education: {
    tint: 'rgba(251, 146, 60, 0.14)',
    borderGlow: 'rgba(251, 146, 60, 0.38)',
    iconColor: '#FB923C',
  },
  betting: {
    tint: 'rgba(244, 63, 94, 0.14)',
    borderGlow: 'rgba(244, 63, 94, 0.38)',
    iconColor: '#FB7185',
  },
  water: {
    tint: 'rgba(14, 165, 233, 0.18)',
    borderGlow: 'rgba(14, 165, 233, 0.4)',
    iconColor: '#38BDF8',
  },
  waste: {
    tint: 'rgba(132, 204, 22, 0.16)',
    borderGlow: 'rgba(132, 204, 22, 0.38)',
    iconColor: '#A3E635',
  },
};

export function getCategoryBillPayVisual(slug: UtilityCategorySlug): BillPayCardVisual {
  return CATEGORY_VISUAL[slug];
}
