import { memo, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BillPayCardGrid } from '@/esopay/components/bills/BillPayCardGrid';
import { QUICK_PAY_HUB_CARDS, type BillPayHubCardConfig } from '@/esopay/data/billPayHubCatalog';
import { QUICK_ACTION_CATEGORY, esopayBillsTabHref } from '@/esopay/navigation/billCategories';
import type { QuickPayCategoryKey } from '@/esopay/data/quickPayCatalog';
import { useQuickPayInsights } from '@/esopay/hooks/useQuickPayInsights';
import { buildBillPayHubCardItems } from '@/esopay/lib/buildBillPayHubCardItems';
import type { HubHighlightKind } from '@/esopay/lib/billHubHighlights';
import { EsoPayOutlinePillButton } from '@/esopay/components/EsoPayOutlinePillButton';
import { luxury } from '@/esopay/theme/luxury';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';

type Props = {
  onSeeAll?: () => void;
};

const QUICK_PAY_KEYS = new Set<string>(['elec', 'air', 'data', 'tv']);

/** Home Pay a Bill — same BillPayCard grid as the Billing tab. */
export const QuickPayCarousel = memo(function QuickPayCarousel({ onSeeAll }: Props) {
  const router = useRouter();
  const { predictiveNudge, refresh, mostUsedKey, hasQuickPayHistory } = useQuickPayInsights();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

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

  const gridItems = useMemo(
    () => buildBillPayHubCardItems(QUICK_PAY_HUB_CARDS, openCategory, homeHighlights),
    [homeHighlights, openCategory],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Pay a Bill</Text>
        {onSeeAll ? (
          <EsoPayOutlinePillButton label="See all" onPress={onSeeAll} accessibilityLabel="See all bill payment options" />
        ) : null}
      </View>

      {predictiveNudge ? (
        <View style={styles.nudge}>
          <LinearGradient
            colors={['rgba(16,185,129,0.18)', 'rgba(16,185,129,0.04)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.nudgeText}>{predictiveNudge}</Text>
        </View>
      ) : null}

      <BillPayCardGrid items={gridItems} embedded />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  label: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: luxury.warmWhite,
  },
  nudge: {
    marginHorizontal: spacing.lg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  nudgeText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    lineHeight: 18,
    color: luxury.textPrimary,
  },
});
