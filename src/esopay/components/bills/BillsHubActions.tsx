import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { WifiHigh } from 'phosphor-react-native';
import { BillPayCategoryIcon } from '@/esopay/components/bills/BillPayCategoryIcon';
import type { BillPayHubCardConfig } from '@/esopay/data/billPayHubCatalog';
import {
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
} from '@/esopay/theme/brandColors';
import { grid } from '@/esopay/theme/homeGrid';
import { useButtonPressAnimation } from '@/lib/motion/springMotion';
import { inter } from '@/theme/fonts';

type Props = {
  cards: BillPayHubCardConfig[];
  onSelect: (card: BillPayHubCardConfig) => void;
};

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
      <WifiHigh size={24} color={ESO_PAY_TEXT_PRIMARY} weight="regular" />
    ) : card.slug ? (
      <BillPayCategoryIcon slug={card.slug} color={ESO_PAY_TEXT_PRIMARY} size={24} />
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

/** Revolut / Home-style circular service actions for the Pay tab hub. */
export const BillsHubActions = memo(function BillsHubActions({ cards, onSelect }: Props) {
  if (cards.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {cards.map((card) => (
          <ActionCircle key={card.key} card={card} onPress={() => onSelect(card)} />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: grid.sm,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 16,
    columnGap: 8,
    justifyContent: 'flex-start',
  },
  action: {
    width: '31%',
    maxWidth: '31%',
    alignItems: 'center',
    gap: 8,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionLabel: {
    fontFamily: inter.medium,
    fontSize: 11,
    lineHeight: 14,
    color: ESO_PAY_TEXT_SECONDARY,
    textAlign: 'center',
  },
});
