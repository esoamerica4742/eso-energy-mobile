import { memo, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BillPayCategoryIcon } from '@/esopay/components/bills/BillPayCategoryIcon';
import { WifiHigh } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BillPayCardGrid } from '@/esopay/components/bills/BillPayCardGrid';
import { QUICK_PAY_HUB_CARDS, type BillPayHubCardConfig } from '@/esopay/data/billPayHubCatalog';
import { QUICK_ACTION_CATEGORY, esopayBillsTabHref } from '@/esopay/navigation/billCategories';
import type { QuickPayCategoryKey } from '@/esopay/data/quickPayCatalog';
import { useQuickPayInsights } from '@/esopay/hooks/useQuickPayInsights';
import { buildBillPayHubCardItems } from '@/esopay/lib/buildBillPayHubCardItems';
import type { HubHighlightKind } from '@/esopay/lib/billHubHighlights';
import { EsoPayOutlinePillButton } from '@/esopay/components/EsoPayOutlinePillButton';
import { EsoPaySectionLabel } from '@/esopay/components/EsoPaySectionLabel';
import { HOME_BILL_CATEGORY_CARD_HEIGHT } from '@/esopay/components/bills/billPayCardTheme';
import { ESO_PAY_GOLD, ESO_PAY_GOLD_MUTED, ESO_PAY_GOLD_MUTED_06, ESO_PAY_TEXT_PRIMARY } from '@/esopay/theme/brandColors';
import { grid } from '@/esopay/theme/homeGrid';
import { ds } from '@/esopay/theme/designSystem';
import { fonts } from '@/esopay/theme/typography';

type Props = {
  onSeeAll?: () => void;
};

const QUICK_PAY_KEYS = new Set<string>(['elec', 'air', 'data', 'tv']);
const HOME_BILL_ICON_COLOR = ESO_PAY_GOLD;
const HOME_BILL_ICON_CONTAINER_BG = ESO_PAY_GOLD_MUTED_06;

/** Home Pay a Bill — same BillPayCard grid as the Billing tab. */
export const QuickPayCarousel = memo(function QuickPayCarousel({ onSeeAll }: Props) {
  const router = useRouter();
  const { predictiveNudge, mostUsedKey, hasQuickPayHistory } = useQuickPayInsights();

  const openCategory = useCallback(
    (card: BillPayHubCardConfig) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (!QUICK_PAY_KEYS.has(card.key)) return;
      router.push(esopayBillsTabHref(QUICK_ACTION_CATEGORY[card.key as QuickPayCategoryKey]));
    },
    [router],
  );

  const homeHighlights = useMemo(() => {
    const map = new Map<string, HubHighlightKind>();
    if (mostUsedKey && hasQuickPayHistory) {
      map.set(mostUsedKey, 'recent');
    }
    return map;
  }, [hasQuickPayHistory, mostUsedKey]);

  const gridItems = useMemo(() => {
    const items = buildBillPayHubCardItems(QUICK_PAY_HUB_CARDS, openCategory, homeHighlights);
    return items.map((item) => {
      const card = QUICK_PAY_HUB_CARDS.find((c) => c.key === item.id);
      if (!card?.slug) return item;
      const iconNode =
        card.slug === 'data' ? (
          <WifiHigh
            size={22}
            color={HOME_BILL_ICON_COLOR}
            weight="duotone"
            duotoneColor={HOME_BILL_ICON_COLOR}
          />
        ) : (
          <BillPayCategoryIcon slug={card.slug} color={HOME_BILL_ICON_COLOR} size={22} />
        );
      return {
        ...item,
        visual: { ...item.visual, iconColor: HOME_BILL_ICON_COLOR, tint: 'transparent' },
        icon: <View style={styles.billIconContainer}>{iconNode}</View>,
      };
    });
  }, [homeHighlights, openCategory]);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <EsoPaySectionLabel>Services</EsoPaySectionLabel>
        {onSeeAll ? (
          <EsoPayOutlinePillButton label="See all" onPress={onSeeAll} accessibilityLabel="See all bill payment options" />
        ) : null}
      </View>

      {predictiveNudge ? (
        <View style={styles.nudge}>
          <Text style={styles.nudgeText}>{predictiveNudge}</Text>
        </View>
      ) : null}

      <BillPayCardGrid
        items={gridItems}
        embedded
        hubCards
        cardHeight={HOME_BILL_CATEGORY_CARD_HEIGHT}
        contentPaddingH={0}
        columnGap={grid.sm}
        itemMargin={0}
        rowGap={grid.xs}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: grid.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  nudge: {
    borderRadius: ds.radius.input,
    borderWidth: 1,
    borderColor: ESO_PAY_GOLD,
    backgroundColor: ESO_PAY_GOLD_MUTED,
    paddingVertical: grid.xs,
    paddingHorizontal: grid.sm,
  },
  nudgeText: {
    fontFamily: fonts.uiMedium,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  billIconContainer: {
    backgroundColor: HOME_BILL_ICON_CONTAINER_BG,
    borderRadius: 10,
    padding: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(211, 153, 26, 0.08)',
  },
});
