import type { UtilityCategorySlug } from '@/esopay/data/nigeriaBillers';
import { QUICK_PAY_CARDS, type QuickPayCategoryKey } from '@/esopay/data/quickPayCatalog';
import { getCategoryBillPayVisual } from '@/esopay/lib/categoryBillPayVisual';

export type BillPayHubCardConfig = {
  key: string;
  label: string;
  slug?: UtilityCategorySlug;
  badgeText: string;
  badgeBg: string;
  badgeFg: string;
  tint: string;
  borderGlow: string;
  iconColor: string;
};

const QUICK_PAY_SLUG: Record<QuickPayCategoryKey, UtilityCategorySlug> = {
  elec: 'electricity',
  air: 'airtime',
  data: 'data',
  tv: 'tv',
};

function fromQuickPay(): BillPayHubCardConfig[] {
  return QUICK_PAY_CARDS.map((card) => ({
    key: card.key,
    label: card.label,
    slug: QUICK_PAY_SLUG[card.key],
    badgeText: card.badgeText,
    badgeBg: card.badgeBg,
    badgeFg: card.badgeFg,
    tint: card.tint,
    borderGlow: card.borderGlow,
    iconColor: card.iconColor,
  }));
}

function hubCard(
  key: string,
  label: string,
  slug: UtilityCategorySlug | undefined,
  badge: { text: string; bg: string; fg: string },
): BillPayHubCardConfig {
  const visual = slug ? getCategoryBillPayVisual(slug) : getCategoryBillPayVisual('electricity');
  return {
    key,
    label,
    slug,
    badgeText: badge.text,
    badgeBg: badge.bg,
    badgeFg: badge.fg,
    tint: visual.tint,
    borderGlow: visual.borderGlow,
    iconColor: visual.iconColor,
  };
}

/** Full billing hub — home Pay a Bill cards use the first four entries (same styling). */
export const BILL_HUB_CARDS: BillPayHubCardConfig[] = [
  ...fromQuickPay(),
  hubCard('education', 'Education', 'education', { text: 'WAEC', bg: '#FB923C', fg: '#1A1200' }),
  hubCard('betting', 'Betting', 'betting', { text: 'BET', bg: '#F43F5E', fg: '#FFFFFF' }),
  hubCard('water', 'Water', 'water', { text: 'H2O', bg: '#0EA5E9', fg: '#FFFFFF' }),
  hubCard('waste', 'Waste', 'waste', { text: 'LAWMA', bg: '#84CC16', fg: '#1A1400' }),
];

export const QUICK_PAY_HUB_CARDS = BILL_HUB_CARDS.filter((c) =>
  (['elec', 'air', 'data', 'tv'] as string[]).includes(c.key),
);

export type BillPayHubGroupId = 'essentials' | 'more';

export type BillPayHubGroup = {
  id: BillPayHubGroupId;
  title: string;
  cardKeys: string[];
};

const HUB_BY_KEY = new Map(BILL_HUB_CARDS.map((c) => [c.key, c]));

/** Grouped layout for the Billing tab hub (reduces visual noise). */
export const BILL_HUB_GROUPS: BillPayHubGroup[] = [
  {
    id: 'essentials',
    title: 'Services',
    cardKeys: ['elec', 'air', 'data', 'tv'],
  },
  {
    id: 'more',
    title: 'More services',
    cardKeys: ['education', 'betting', 'water', 'waste'],
  },
];

export function resolveBillHubGroupCards(group: BillPayHubGroup): BillPayHubCardConfig[] {
  return group.cardKeys
    .map((key) => HUB_BY_KEY.get(key))
    .filter((c): c is BillPayHubCardConfig => Boolean(c));
}
