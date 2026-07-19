import type { ReactNode } from 'react';
import type { BillPayCardItem } from '@/esopay/components/bills/BillPayCard';
import { BillPayCategoryIcon } from '@/esopay/components/bills/BillPayCategoryIcon';
import { ServiceCardIcon } from '@/esopay/components/bills/ServiceCardIcon';
import type { BillPayHubCardConfig } from '@/esopay/data/billPayHubCatalog';
import type { UtilityCategorySlug } from '@/esopay/data/nigeriaBillers';
import { getBillPayCardHelper, getQuickActionHelper } from '@/esopay/lib/billPayCardHelpers';
import { PROVIDER_ICON_COLOR } from '@/esopay/lib/categoryBillPayVisual';
import type { HubHighlightKind } from '@/esopay/lib/billHubHighlights';

function subtitleFor(card: BillPayHubCardConfig): string {
  if (card.slug) return getBillPayCardHelper(card.slug);
  return getQuickActionHelper(card.key);
}

function iconFor(card: BillPayHubCardConfig): ReactNode {
  const slug: UtilityCategorySlug =
    card.slug ??
    (card.key === 'tv-license' ? 'tv' : card.key === 'insurance' ? 'education' : 'electricity');

  return (
    <ServiceCardIcon>
      <BillPayCategoryIcon slug={slug} color={PROVIDER_ICON_COLOR} size={22} />
    </ServiceCardIcon>
  );
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
      iconColor: PROVIDER_ICON_COLOR,
    },
    highlightBadge: (() => {
      const kind = highlights?.get(card.key);
      return kind === 'popular' ? null : kind ?? null;
    })(),
    index,
    onPress: () => onSelect(card),
    accessibilityLabel: card.label,
  }));
}
