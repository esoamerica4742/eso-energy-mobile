import { memo, useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ArrowUpRight, Wallet } from 'lucide-react-native';
import type { MonnifyWalletStatus } from '@/esopay/api/types';
import { LiveStatusDot } from '@/esopay/components/LiveStatusDot';
import { esopayFonts } from '@/esopay/theme/fonts';
import { EsoPayTokens as T, type EsoPayStatusKey } from '@/esopay/theme/tokens';
import { formatCurrency } from '@/esopay/utils/currency';

type Props = {
  balanceKobo: number;
  currency?: string;
  status?: MonnifyWalletStatus;
  loading?: boolean;
  subtitle?: string;
  /** Slightly higher-contrast subtitle (Fund wallet). */
  subtitleEmphasis?: boolean;
  /** Subtle animated gold border pulse. */
  borderGlow?: boolean;
  /** e.g. "Last funded 2h ago" — shown under balance. */
  balanceMeta?: string;
  onFundPress?: () => void;
  style?: ViewStyle;
};

function walletStatusKey(status?: MonnifyWalletStatus): EsoPayStatusKey {
  if (status === 'active') return 'live';
  if (status === 'suspended') return 'offline';
  return 'partial';
}

function walletStatusLabel(status: MonnifyWalletStatus = 'active'): string {
  if (status === 'active') return 'ACTIVE';
  if (status === 'suspended') return 'SUSPENDED';
  return 'PENDING';
}

export const WalletBalanceCard = memo(function WalletBalanceCard({
  balanceKobo,
  currency = 'NGN',
  status = 'active',
  loading = false,
  subtitle = 'Eso wallet · Ready for settlement',
  subtitleEmphasis = false,
  borderGlow = false,
  balanceMeta,
  onFundPress,
  style,
}: Props) {
  const liveKey = walletStatusKey(status);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (!borderGlow) return;
    glow.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [borderGlow, glow]);

  const glowStyle = useAnimatedStyle(() => {
    if (!borderGlow) return {};
    return {
      borderColor: interpolateColor(
        glow.value,
        [0, 1],
        [T.color.border.subtle, T.color.border.active],
      ),
      shadowOpacity: 0.12 + glow.value * 0.2,
    };
  });

  const card = (
    <LinearGradient
      colors={[T.color.bg.elevated, T.color.bg.surface]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.cardInner, style]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconWrap}>
            <Wallet size={18} color={T.color.gold.primary} strokeWidth={2} />
          </View>
          <Text style={styles.eyebrow}>ESO WALLET</Text>
        </View>
        <View style={styles.statusPill}>
          <LiveStatusDot status={liveKey} size={6} />
          <Text style={styles.statusText}>{walletStatusLabel(status)}</Text>
        </View>
      </View>

      <Text style={[styles.subtitle, subtitleEmphasis && styles.subtitleEmphasis]}>{subtitle}</Text>

      {loading ? (
        <ActivityIndicator color={T.color.gold.primary} style={styles.loader} />
      ) : (
        <>
          <Text style={styles.amount}>{formatCurrency(balanceKobo, currency)}</Text>
          {balanceMeta ? (
            <View style={styles.balanceMetaRow}>
              <View
                style={[
                  styles.balanceMetaTrack,
                  balanceMeta !== 'No top-ups yet' && styles.balanceMetaTrackActive,
                ]}
              />
              <Text style={styles.balanceMeta}>{balanceMeta}</Text>
            </View>
          ) : null}
        </>
      )}

      {onFundPress ? (
        <View style={styles.footer}>
          <Pressable onPress={onFundPress} style={styles.fundBtn} accessibilityRole="button">
            <Text style={styles.fundLabel}>Manage wallet</Text>
            <ArrowUpRight size={14} color={T.color.gold.shimmer} strokeWidth={2.2} />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.accentBar} />
    </LinearGradient>
  );

  if (!borderGlow) {
    return <View style={styles.cardShell}>{card}</View>;
  }

  return (
    <Animated.View style={[styles.cardShell, styles.cardGlow, glowStyle]}>
      {card}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  cardShell: {
    borderRadius: T.radius.md,
    overflow: 'hidden',
  },
  cardGlow: {
    borderWidth: 1,
    borderRadius: T.radius.md,
    shadowColor: T.color.gold.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 4,
  },
  cardInner: {
    borderRadius: T.radius.md,
    borderWidth: 1,
    borderColor: T.color.border.subtle,
    padding: T.spacing.xl,
    overflow: 'hidden',
    ...T.shadow.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: T.spacing.sm,
    gap: T.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: T.spacing.md,
    flex: 1,
    minWidth: 0,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: T.radius.sm,
    backgroundColor: `${T.color.gold.primary}18`,
    borderWidth: 1,
    borderColor: T.color.border.active,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    flexShrink: 1,
    fontFamily: esopayFonts.subheading,
    fontSize: T.type.label.size,
    letterSpacing: T.type.label.letterSpacing,
    color: T.color.gold.primary,
    textTransform: 'uppercase',
  },
  subtitle: {
    marginTop: T.spacing.sm,
    marginBottom: T.spacing.md,
    fontFamily: esopayFonts.body,
    fontSize: T.type.caption.size,
    color: T.color.text.secondary,
  },
  subtitleEmphasis: {
    color: T.color.platinum.paid,
    letterSpacing: 0.4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: T.spacing.xs,
    paddingHorizontal: T.spacing.sm,
    paddingVertical: T.spacing.xs,
    borderRadius: 999,
    backgroundColor: `${T.color.gold.primary}12`,
    borderWidth: 1,
    borderColor: T.color.border.active,
  },
  statusText: {
    fontFamily: esopayFonts.mono,
    fontSize: 9,
    letterSpacing: 1.2,
    color: T.color.text.secondary,
  },
  loader: {
    alignSelf: 'flex-start',
    marginVertical: T.spacing.md,
  },
  amount: {
    fontFamily: esopayFonts.display,
    fontSize: T.type.hero.size,
    lineHeight: T.type.hero.lineHeight,
    letterSpacing: T.type.hero.letterSpacing,
    color: T.color.gold.shimmer,
    marginBottom: T.spacing.sm,
  },
  balanceMetaRow: {
    gap: T.spacing.xs,
    marginBottom: T.spacing.lg,
  },
  balanceMetaTrack: {
    height: 2,
    borderRadius: 1,
    backgroundColor: T.color.border.subtle,
    width: '18%',
  },
  balanceMetaTrackActive: {
    width: '42%',
    backgroundColor: T.color.gold.muted,
  },
  balanceMeta: {
    fontFamily: esopayFonts.mono,
    fontSize: T.type.caption.size,
    color: T.color.text.disabled,
    letterSpacing: 0.3,
  },
  footer: {
    gap: T.spacing.sm,
  },
  hint: {
    fontFamily: esopayFonts.bodyLight,
    fontSize: T.type.caption.size,
    lineHeight: T.type.caption.lineHeight,
    color: T.color.text.secondary,
  },
  fundBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: T.spacing.xs,
    paddingVertical: T.spacing.xs,
  },
  fundLabel: {
    fontFamily: esopayFonts.subheading,
    fontSize: T.type.label.size,
    color: T.color.gold.primary,
    letterSpacing: 0.5,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: T.color.gold.primary,
  },
});
