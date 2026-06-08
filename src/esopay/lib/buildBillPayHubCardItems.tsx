import type { ReactNode } from 'react';
import type { BillPayCardItem } from '@/esopay/components/bills/BillPayCard';
import { BillPayCategoryIcon } from '@/esopay/components/bills/BillPayCategoryIcon';
import type { BillPayHubCardConfig } from '@/esopay/data/billPayHubCatalog';
import type { UtilityCategorySlug } from '@/esopay/data/nigeriaBillers';
import { getBillPayCardHelper, getQuickActionHelper } from '@/esopay/lib/billPayCardHelpers';
import type { HubHighlightKind } from '@/esopay/lib/billHubHighlights';

function subtitleFor(card: BillPayHubCardConfig): string {
  if (card.slug) return getBillPayCardHelper(card.slug);
  return getQuickActionHelper(card.key);
}

function iconFor(card: BillPayHubCardConfig): ReactNode {
  if (card.slug) {
    return <BillPayCategoryIcon slug={card.slug} color={card.iconColor} />;
  }
  const slug: UtilityCategorySlug =
    card.key === 'tv-license' ? 'tv' : card.key === 'insurance' ? 'education' : 'electricity';
  return <BillPayCategoryIcon slug={slug} color={card.iconColor} />;
}

export function buildBillPayHubCardItems(
  cards: BillPayHubCardConfig[],
  onSelect: (card: BillPayHubCardConfig) => void,
  highlights?: Map<string, HubHighlightKind>,
): BillPayCardItem[] {
  return cards.map((card, index) => ({
    id: card.key,
    title: card.label,
    subtitle: subtitleFor(card),
    badgeText: card.badgeText,
    badgeBg: card.badgeBg,
    badgeFg: card.badgeFg,
    icon: iconFor(card),
    visual: {
      tint: card.tint,
      borderGlow: card.borderGlow,
      iconColor: card.iconColor,
    },
    highlightBadge: highlights?.get(card.key) ?? null,
    index,
    onPress: () => onSelect(card),
    accessibilityLabel: card.label,
  }));
}
