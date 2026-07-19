import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BillPayCategoryIcon } from '@/esopay/components/bills/BillPayCategoryIcon';
import { WifiHigh } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated from 'react-native-reanimated';
import { QUICK_PAY_HUB_CARDS, type BillPayHubCardConfig } from '@/esopay/data/billPayHubCatalog';
import { esopayUtilityCategoryHref } from '@/esopay/navigation/routes';
import { EsoPayOutlinePillButton } from '@/esopay/components/EsoPayOutlinePillButton';
import {
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
} from '@/esopay/theme/brandColors';
import { grid } from '@/esopay/theme/homeGrid';
import { useButtonPressAnimation } from '@/lib/motion/springMotion';
import { inter } from '@/theme/fonts';

type Props = {
  onSeeAll?: () => void;
};

const ICON_COLOR = ESO_PAY_TEXT_PRIMARY;

function ActionCircle({
  card,
  onPress,
}: {
  card: BillPayHubCardConfig;
  onPress: () => void;
}) {
  const { style, onPressIn, onPressOut } = useButtonPressAnimation();
  const icon =
    card.slug === 'data' ? (
      <WifiHigh size={24} color={ICON_COLOR} weight="regular" />
    ) : card.slug ? (
      <BillPayCategoryIcon slug={card.slug} color={ICON_COLOR} size={24} />
    ) : null;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.action}
      accessibilityRole="button"
      accessibilityLabel={card.label}
    >
      <Animated.View style={[styles.circle, style]}>{icon}</Animated.View>
      <Text style={styles.actionLabel} numberOfLines={1}>
        {card.label}
      </Text>
    </Pressable>
  );
}

/** Revolut-style circular quick actions on Home — mirrors Pay hub live services. */
export const QuickPayCarousel = memo(function QuickPayCarousel({ onSeeAll }: Props) {
  const router = useRouter();

  const openCategory = useCallback(
    (card: BillPayHubCardConfig) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (!card.slug) return;
      router.push(esopayUtilityCategoryHref(card.slug));
    },
    [router],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Pay</Text>
        {onSeeAll ? (
          <EsoPayOutlinePillButton
            label="See all"
            onPress={onSeeAll}
            accessibilityLabel="See all bill payment options"
          />
        ) : null}
      </View>

      <View style={styles.row}>
        {QUICK_PAY_HUB_CARDS.map((card) => (
          <ActionCircle key={card.key} card={card} onPress={() => openCategory(card)} />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: grid.md,
    paddingHorizontal: grid.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: inter.semibold,
    fontSize: 15,
    lineHeight: 20,
    color: ESO_PAY_TEXT_PRIMARY,
    letterSpacing: -0.1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    gap: 12,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionLabel: {
    fontFamily: inter.medium,
    fontSize: 12,
    lineHeight: 16,
    color: ESO_PAY_TEXT_SECONDARY,
    textAlign: 'center',
  },
});
