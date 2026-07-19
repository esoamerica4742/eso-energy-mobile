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

/**
 * Full billing hub — includes Betting.
 * Education omitted until Monnify returns EDUCATION products; water/waste not on live catalog.
 */
export const BILL_HUB_CARDS: BillPayHubCardConfig[] = [
  ...fromQuickPay(),
  hubCard('betting', 'Betting', 'betting', { text: 'BET', bg: '#F43F5E', fg: '#FFFFFF' }),
];

/** Home shortcuts only — Betting stays on the Pay/Billing hub. */
export const QUICK_PAY_HUB_CARDS = BILL_HUB_CARDS.filter((c) =>
  (['elec', 'air', 'data', 'tv'] as string[]).includes(c.key),
);

export type BillPayHubGroupId = 'services';

export type BillPayHubGroup = {
  id: BillPayHubGroupId;
  title: string;
  cardKeys: string[];
};

const HUB_BY_KEY = new Map(BILL_HUB_CARDS.map((c) => [c.key, c]));

/**
 * Pay tab hub — all live services in one grid (Opay/PalmPay style).
 * Education + Betting sit with essentials; no buried "More" section.
 */
export const BILL_HUB_GROUPS: BillPayHubGroup[] = [
  {
    id: 'services',
    title: 'Services',
    cardKeys: ['elec', 'air', 'data', 'tv', 'betting'],
  },
];

export function resolveBillHubGroupCards(group: BillPayHubGroup): BillPayHubCardConfig[] {
  return group.cardKeys
    .map((key) => HUB_BY_KEY.get(key))
    .filter((c): c is BillPayHubCardConfig => Boolean(c));
}
