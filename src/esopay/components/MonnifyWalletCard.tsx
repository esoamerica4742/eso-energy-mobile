import { memo, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Eye, EyeSlash, Plus } from 'phosphor-react-native';
import { Skeleton } from '@/esopay/components/Skeleton';
import {
  ESO_PAY_BG,
  ESO_PAY_GOLD,
  ESO_PAY_GOLD_AMBIENT,
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_GOLD_SHADOW,
  ESO_PAY_TEXT_SECONDARY,
  GOLD_CTA,
  HOME_WALLET_SURFACE,
  WALLET_CARD_SHADOW,
} from '@/esopay/theme/brandColors';
import { grid } from '@/esopay/theme/homeGrid';
import { ds } from '@/esopay/theme/designSystem';
import { useButtonPressAnimation } from '@/lib/motion/springMotion';
import { inter } from '@/theme/fonts';
import { formatCurrencyAmount } from '@/esopay/utils/currency';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const BALANCE_FONT_SIZE = ds.type.amount.fontSize;
const CURRENCY_FONT_SIZE = BALANCE_FONT_SIZE * 0.55;
const SPRING = { stiffness: 300, damping: 22 };
const MOTION_MS = 250;

export const HOME_WALLET_DISPLAY_KOBO = 5_700_000;

export function resolveHomeWalletKobo(balanceKobo: number): number {
  return balanceKobo;
}

export const MONNIFY_WALLET_CARD_DEBUG = false;

type Props = {
  balanceKobo: number;
  loading?: boolean;
  stableDisplay?: boolean;
  onFundPress?: () => void;
  onManagePress?: () => void;
};

function AddFundsButton({ onPress }: { onPress?: () => void }) {
  const { style: btnStyle, onPressIn, onPressOut } = useButtonPressAnimation();
  const disabled = !onPress;

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress?.();
      }}
      onPressIn={() => {
        if (disabled) return;
        onPressIn();
      }}
      onPressOut={() => {
        if (disabled) return;
        onPressOut();
      }}
      disabled={disabled}
      style={[styles.addFundsOuter, disabled && styles.addFundsDisabled]}
      accessibilityRole="button"
      accessibilityLabel="Add funds"
    >
      <Animated.View style={[styles.addFundsInner, btnStyle]}>
        <Plus size={17} color={ESO_PAY_BG} weight="bold" />
        <Text style={styles.addFundsText}>Add Funds</Text>
      </Animated.View>
    </Pressable>
  );
}

function ActiveBadge() {
  return (
    <View style={styles.activeBadge} accessibilityLabel="Wallet active">
      <View style={styles.activeDot} />
      <Text style={styles.activeText}>Active</Text>
    </View>
  );
}

function BalanceDisplay({
  hidden,
  showSkeleton,
  amountLabel,
}: {
  hidden: boolean;
  showSkeleton: boolean;
  amountLabel: string;
}) {
  if (showSkeleton) {
    return <Skeleton height={40} width="70%" borderRadius={8} />;
  }

  if (hidden) {
    return (
      <Animated.View entering={FadeIn.duration(MOTION_MS)} exiting={FadeOut.duration(MOTION_MS)} style={styles.balanceVisible}>
        <Text style={styles.currencySymbol}>₦</Text>
        <Text style={styles.balanceHidden}>••••••</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(MOTION_MS)} exiting={FadeOut.duration(MOTION_MS)} style={styles.balanceVisible}>
      <Text style={styles.currencySymbol}>₦</Text>
      <Text
        style={styles.balanceAmount}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.55}
      >
        {amountLabel}
      </Text>
    </Animated.View>
  );
}

export const MonnifyWalletCard = memo(function MonnifyWalletCard({
  balanceKobo,
  loading = false,
  stableDisplay = false,
  onFundPress,
  onManagePress,
}: Props) {
  const reduceMotion = useReducedMotion() ?? false;
  const [hidden, setHidden] = useState(false);
  const cardLift = useSharedValue(reduceMotion ? 1 : 0.98);
  const cardOpacity = useSharedValue(reduceMotion ? 1 : 0);

  const displayKobo = stableDisplay ? balanceKobo : resolveHomeWalletKobo(balanceKobo);
  const amountLabel = useMemo(
    () => formatCurrencyAmount(displayKobo, 'NGN', { alwaysDecimals: true }),
    [displayKobo],
  );
  const showSkeleton = loading && balanceKobo <= 0;

  useEffect(() => {
    if (reduceMotion) {
      cardLift.value = 1;
      cardOpacity.value = 1;
      return;
    }
    cardOpacity.value = withTiming(1, { duration: MOTION_MS });
    cardLift.value = withSpring(1, SPRING);
  }, [cardLift, cardOpacity, reduceMotion]);

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardLift.value }],
    opacity: cardOpacity.value,
  }));

  if (MONNIFY_WALLET_CARD_DEBUG) {
    return (
      <View style={styles.debugBox}>
        <Text style={styles.debugText}>TESTING VISIBILITY</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.outer, cardAnimStyle]}>
      <View style={styles.ambientGlow} pointerEvents="none" />
      <View style={styles.card}>
        <Pressable
          onPress={onManagePress}
          disabled={!onManagePress}
          style={styles.topRow}
          accessibilityRole={onManagePress ? 'button' : undefined}
          accessibilityLabel={onManagePress ? 'Open wallet details' : undefined}
        >
          <Text style={styles.walletLabel}>Eso Pay Wallet</Text>
          <ActiveBadge />
        </Pressable>

        <View style={styles.balanceBlock}>
          <Text style={styles.balanceCaption}>Available balance</Text>
          <View style={styles.balanceRow}>
            <BalanceDisplay hidden={hidden} showSkeleton={showSkeleton} amountLabel={amountLabel} />
            <Pressable
              onPress={() => {
                void Haptics.selectionAsync();
                setHidden((v) => !v);
              }}
              hitSlop={10}
              style={styles.eyeBtn}
              accessibilityRole="button"
              accessibilityLabel={hidden ? 'Show balance' : 'Hide balance'}
            >
              {hidden ? (
                <EyeSlash size={14} color={ESO_PAY_GOLD} weight="regular" />
              ) : (
                <Eye size={14} color={ESO_PAY_GOLD} weight="regular" />
              )}
            </Pressable>
          </View>
        </View>

        <AddFundsButton onPress={onFundPress} />
      </View>
    </Animated.View>
  );
});

const CARD_RADIUS = 24;
/** Uniform vertical rhythm between wallet title, balance block, and CTA. */
const CARD_SECTION_GAP = 10;

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    alignSelf: 'stretch',
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    top: grid.sm,
    left: grid.md,
    right: grid.md,
    bottom: 0,
    borderRadius: CARD_RADIUS + 4,
    backgroundColor: ESO_PAY_GOLD_AMBIENT,
  },
  card: {
    width: '100%',
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(211, 153, 26, 0.14)',
    backgroundColor: HOME_WALLET_SURFACE,
    paddingHorizontal: grid.md,
    paddingVertical: 8,
    gap: CARD_SECTION_GAP,
    ...WALLET_CARD_SHADOW,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: grid.xs,
  },
  walletLabel: {
    fontFamily: inter.medium,
    fontSize: 11,
    letterSpacing: 1.8,
    fontWeight: '500',
    textTransform: 'uppercase',
    color: ESO_PAY_TEXT_SECONDARY,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(211, 153, 26, 0.07)',
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: ESO_PAY_GOLD,
  },
  activeText: {
    fontFamily: inter.medium,
    fontSize: 10,
    letterSpacing: 0.6,
    fontWeight: '500',
    color: ESO_PAY_GOLD,
  },
  balanceBlock: {
    gap: 4,
    paddingVertical: 0,
  },
  balanceCaption: {
    fontFamily: inter.medium,
    fontSize: 11,
    letterSpacing: 0.2,
    fontWeight: '500',
    color: 'rgba(245, 240, 232, 0.62)',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: grid.sm,
    minHeight: 32,
  },
  balanceVisible: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  currencySymbol: {
    fontFamily: inter.bold,
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 2,
    fontWeight: '700',
    color: ESO_PAY_GOLD,
  },
  balanceAmount: {
    fontFamily: inter.bold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.2,
    fontWeight: '700',
    color: ESO_PAY_TEXT_PRIMARY,
    flexShrink: 1,
  },
  balanceHidden: {
    fontFamily: inter.bold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 5,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  eyeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(211, 153, 26, 0.06)',
    marginBottom: 6,
  },
  addFundsOuter: {
    width: '100%',
  },
  addFundsInner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 16,
    backgroundColor: GOLD_CTA,
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: grid.md,
  },
  addFundsText: {
    fontFamily: inter.bold,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.25,
    color: ESO_PAY_BG,
  },
  addFundsDisabled: {
    opacity: 0.45,
  },
  debugBox: {
    width: '100%',
    minHeight: 168,
    backgroundColor: 'red',
    borderWidth: 5,
    borderColor: 'yellow',
    alignItems: 'center',
    justifyContent: 'center',
    padding: grid.md,
  },
  debugText: {
    fontFamily: inter.bold,
    color: 'white',
    fontSize: 24,
  },
});
