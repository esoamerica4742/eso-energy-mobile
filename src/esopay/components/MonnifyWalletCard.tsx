import { memo, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Eye, EyeOff, History, Plus } from 'lucide-react-native';
import { Skeleton } from '@/esopay/components/Skeleton';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';
import { colors } from '@/esopay/theme/colors';
import { luxury } from '@/esopay/theme/luxury';
import { formatCurrencyAmount } from '@/esopay/utils/currency';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const FUND_WALLET_GRADIENT = [colors.goldDark, colors.gold, colors.goldBright] as const;
const FUND_WALLET_GRADIENT_LOCATIONS = [0, 0.52, 1] as const;

/** Demo / empty-wallet display — ₦57,000.00 */
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
  onHistoryPress?: () => void;
  onDetailsPress?: () => void;
};

function CompactAddFundsButton({ onPress }: { onPress?: () => void }) {
  const scale = useSharedValue(1);
  const disabled = !onPress;

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (disabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => {
        if (disabled) return;
        scale.value = withTiming(0.97, { duration: 120, easing: Easing.out(Easing.ease) });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120, easing: Easing.out(Easing.ease) });
      }}
      disabled={disabled}
      style={[styles.addFundsOuter, pressStyle, disabled && styles.addFundsDisabled]}
      accessibilityRole="button"
      accessibilityLabel="Add funds"
    >
      <LinearGradient
        colors={[...FUND_WALLET_GRADIENT]}
        locations={[...FUND_WALLET_GRADIENT_LOCATIONS]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.addFundsGradient}
      >
        <View style={styles.addFundsSheen} pointerEvents="none" />
        <Plus size={15} color={colors.white} strokeWidth={2.6} />
        <Text style={styles.addFundsText}>Add Funds</Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

function CardLoadingShimmer({ visible }: { visible: boolean }) {
  const translateX = useSharedValue(-240);

  useEffect(() => {
    if (!visible) return;
    translateX.value = withRepeat(
      withTiming(420, { duration: 1800, easing: Easing.linear }),
      -1,
      false,
    );
  }, [translateX, visible]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={styles.shimmerOverlay} pointerEvents="none">
      <Animated.View style={[styles.shimmerBand, shimmerStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.07)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </Animated.View>
  );
}

export const MonnifyWalletCard = memo(function MonnifyWalletCard({
  balanceKobo,
  loading = false,
  stableDisplay = false,
  onFundPress,
  onHistoryPress,
  onDetailsPress,
}: Props) {
  const [hidden, setHidden] = useState(false);
  const displayKobo = stableDisplay ? balanceKobo : resolveHomeWalletKobo(balanceKobo);
  const amountLabel = useMemo(
    () => formatCurrencyAmount(displayKobo, 'NGN', { alwaysDecimals: true }),
    [displayKobo],
  );
  const showSkeleton = !stableDisplay && loading && balanceKobo <= 0;
  const showCardShimmer = loading && (showSkeleton || (stableDisplay && balanceKobo <= 0));

  if (MONNIFY_WALLET_CARD_DEBUG) {
    return (
      <View style={styles.debugBox}>
        <Text style={styles.debugText}>TESTING VISIBILITY</Text>
      </View>
    );
  }

  return (
    <View style={styles.outer}>
      <View style={styles.card}>
        <CardLoadingShimmer visible={showCardShimmer} />

        <View style={styles.backdrop} pointerEvents="none">
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 400 120"
            preserveAspectRatio="none"
            style={StyleSheet.absoluteFill}
          >
            <Defs>
              <RadialGradient id="walletMesh" cx="0%" cy="0%" rx="100%" ry="100%">
                <Stop offset="0%" stopColor="#0E2A20" stopOpacity={1} />
                <Stop offset="55%" stopColor={luxury.bg} stopOpacity={1} />
                <Stop offset="100%" stopColor="#07140F" stopOpacity={1} />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="400" height="120" fill="url(#walletMesh)" />
          </Svg>
        </View>

        <View style={styles.content}>
          <View style={styles.mainRow}>
            <View style={styles.balanceSection}>
              {showSkeleton ? (
                <Skeleton height={32} width={140} borderRadius={8} />
              ) : hidden ? (
                <View style={styles.balanceVisible}>
                  <Text style={styles.currencySymbol}>₦</Text>
                  <Text style={styles.balanceHidden}>••••••</Text>
                </View>
              ) : (
                <View style={styles.balanceVisible}>
                  <Text style={styles.currencySymbol}>₦</Text>
                  <Text style={styles.balanceAmount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                    {amountLabel}
                  </Text>
                </View>
              )}

              <Pressable
                onPress={() => setHidden((v) => !v)}
                hitSlop={8}
                style={styles.eyeBtn}
                accessibilityRole="button"
                accessibilityLabel={hidden ? 'Show balance' : 'Hide balance'}
              >
                {hidden ? (
                  <EyeOff size={17} color={luxury.gold} strokeWidth={2.2} />
                ) : (
                  <Eye size={17} color={luxury.gold} strokeWidth={2.2} />
                )}
              </Pressable>
            </View>

            <CompactAddFundsButton onPress={onFundPress} />
          </View>

          <View style={styles.footerRow}>
            <Pressable
              onPress={() => {
                if (!onHistoryPress) return;
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onHistoryPress();
              }}
              disabled={!onHistoryPress}
              style={({ pressed }) => [
                styles.historyBtn,
                pressed && styles.footerPressed,
                !onHistoryPress && styles.footerDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Transaction history"
            >
              <LinearGradient
                colors={['rgba(237, 232, 220, 0.14)', 'rgba(16, 185, 129, 0.08)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.historyGradient}
              >
                <History size={14} color="#F0FDF4" strokeWidth={2.2} />
                <Text style={styles.historyText}>History</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={() => {
                if (!onDetailsPress) return;
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onDetailsPress();
              }}
              disabled={!onDetailsPress}
              style={({ pressed }) => [
                styles.detailsLink,
                pressed && styles.footerPressed,
                !onDetailsPress && styles.footerDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Wallet details"
            >
              <Text style={styles.detailsText}>Details</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    alignSelf: 'stretch',
  },
  card: {
    width: '100%',
    minHeight: 148,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: luxury.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#D4A017',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.24,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    overflow: 'hidden',
    zIndex: 0,
  },
  content: {
    gap: spacing.sm,
    zIndex: 2,
    position: 'relative',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  balanceSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  balanceVisible: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    flex: 1,
    minWidth: 0,
  },
  currencySymbol: {
    fontFamily: fonts.uiMedium,
    fontSize: 22,
    lineHeight: 28,
    color: luxury.gold,
    opacity: 0.9,
  },
  balanceAmount: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.5,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  balanceHidden: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: 3,
    color: luxury.textMuted,
  },
  eyeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  addFundsOuter: {
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.45)',
    flexShrink: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#FFC800',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
        shadowColor: colors.fundWalletShadow,
      },
      default: {},
    }),
  },
  addFundsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    minHeight: 38,
  },
  addFundsSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  addFundsText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: colors.white,
  },
  addFundsDisabled: {
    opacity: 0.45,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  historyBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(167, 243, 208, 0.22)',
    backgroundColor: 'rgba(12, 18, 16, 0.65)',
  },
  historyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  historyText: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    letterSpacing: 0.2,
    color: luxury.warmWhite,
    opacity: 0.92,
  },
  detailsLink: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  detailsText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    letterSpacing: 0.25,
    color: luxury.warmWhite,
    opacity: 0.92,
  },
  footerPressed: {
    opacity: 0.85,
  },
  footerDisabled: {
    opacity: 0.45,
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    overflow: 'hidden',
    zIndex: 4,
  },
  shimmerBand: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
  },
  debugBox: {
    width: '100%',
    minHeight: 148,
    backgroundColor: 'red',
    borderWidth: 5,
    borderColor: 'yellow',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  debugText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
