import { memo, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated from 'react-native-reanimated';
import { Eye, EyeSlash, Plus, CaretRight } from 'phosphor-react-native';
import { Skeleton } from '@/esopay/components/Skeleton';
import {
  ESO_PAY_BG,
  ESO_PAY_SURFACE_ELEVATED,
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
} from '@/esopay/theme/brandColors';
import { grid } from '@/esopay/theme/homeGrid';
import { ds } from '@/esopay/theme/designSystem';
import { useButtonPressAnimation } from '@/lib/motion/springMotion';
import { inter } from '@/theme/fonts';
import { formatCurrencyAmount } from '@/esopay/utils/currency';

export const HOME_WALLET_DISPLAY_KOBO = 5_700_000;

export function resolveHomeWalletKobo(balanceKobo: number): number {
  return balanceKobo;
}

export const MONNIFY_WALLET_CARD_DEBUG = false;

type Variant = 'hero' | 'pass';

type Props = {
  balanceKobo: number;
  loading?: boolean;
  stableDisplay?: boolean;
  /** `hero` = Revolut open balance. `pass` = Apple Wallet card. */
  variant?: Variant;
  onFundPress?: () => void;
  onManagePress?: () => void;
};

function SoftCta({
  label,
  onPress,
  primary,
  icon,
}: {
  label: string;
  onPress?: () => void;
  primary?: boolean;
  icon?: 'plus' | 'chevron';
}) {
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
      style={[styles.softCtaHit, disabled && styles.ctaDisabled]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View
        style={[styles.softCta, primary ? styles.softCtaPrimary : styles.softCtaSecondary, btnStyle]}
      >
        {icon === 'plus' ? (
          <Plus size={16} color={primary ? ESO_PAY_BG : ESO_PAY_TEXT_PRIMARY} weight="bold" />
        ) : null}
        <Text style={[styles.softCtaText, primary ? styles.softCtaTextPrimary : null]}>{label}</Text>
        {icon === 'chevron' ? (
          <CaretRight size={14} color={ESO_PAY_TEXT_SECONDARY} weight="bold" />
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

function BalanceBlock({
  hidden,
  showSkeleton,
  amountLabel,
  size,
  onToggleHidden,
}: {
  hidden: boolean;
  showSkeleton: boolean;
  amountLabel: string;
  size: 'hero' | 'pass';
  onToggleHidden: () => void;
}) {
  const amountStyle = size === 'hero' ? styles.amountHero : styles.amountPass;
  const symbolStyle = size === 'hero' ? styles.symbolHero : styles.symbolPass;
  const hiddenStyle = size === 'hero' ? styles.hiddenHero : styles.hiddenPass;

  return (
    <View style={styles.balanceRow}>
      {showSkeleton ? (
        <Skeleton height={size === 'hero' ? 56 : 44} width="72%" borderRadius={8} />
      ) : (
        <View style={styles.balanceVisible}>
          <Text style={symbolStyle}>₦</Text>
          <Text
            style={hidden ? hiddenStyle : amountStyle}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
          >
            {hidden ? '••••••' : amountLabel}
          </Text>
        </View>
      )}
      <Pressable
        onPress={() => {
          void Haptics.selectionAsync();
          onToggleHidden();
        }}
        hitSlop={12}
        style={styles.eyeBtn}
        accessibilityRole="button"
        accessibilityLabel={hidden ? 'Show balance' : 'Hide balance'}
      >
        {hidden ? (
          <EyeSlash size={18} color={ESO_PAY_TEXT_SECONDARY} weight="regular" />
        ) : (
          <Eye size={18} color={ESO_PAY_TEXT_SECONDARY} weight="regular" />
        )}
      </Pressable>
    </View>
  );
}

export const MonnifyWalletCard = memo(function MonnifyWalletCard({
  balanceKobo,
  loading = false,
  stableDisplay = false,
  variant = 'pass',
  onFundPress,
  onManagePress,
}: Props) {
  const [hidden, setHidden] = useState(false);
  const isHero = variant === 'hero';

  const displayKobo = stableDisplay ? balanceKobo : resolveHomeWalletKobo(balanceKobo);
  const amountLabel = useMemo(
    () => formatCurrencyAmount(displayKobo, 'NGN', { alwaysDecimals: true }),
    [displayKobo],
  );
  const showSkeleton = loading && balanceKobo <= 0;

  if (MONNIFY_WALLET_CARD_DEBUG) {
    return (
      <View style={styles.debugBox}>
        <Text style={styles.debugText}>TESTING VISIBILITY</Text>
      </View>
    );
  }

  if (isHero) {
    return (
      <View style={styles.heroRoot}>
        <Text style={styles.heroCaption}>Main · NGN</Text>
        <BalanceBlock
          hidden={hidden}
          showSkeleton={showSkeleton}
          amountLabel={amountLabel}
          size="hero"
          onToggleHidden={() => setHidden((v) => !v)}
        />
        <View style={styles.heroActions}>
          <SoftCta label="Add money" onPress={onFundPress} primary icon="plus" />
          <SoftCta label="Details" onPress={onManagePress} icon="chevron" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.passOuter}>
      <View style={styles.passCard}>
        <View style={styles.passTop}>
          <Text style={styles.passBrand}>Eso Pay</Text>
          <Text style={styles.passCaptionInline}>NGN</Text>
        </View>
        <View style={styles.passBalance}>
          <Text style={styles.passCaption}>Available balance</Text>
          <BalanceBlock
            hidden={hidden}
            showSkeleton={showSkeleton}
            amountLabel={amountLabel}
            size="pass"
            onToggleHidden={() => setHidden((v) => !v)}
          />
        </View>
        {onFundPress ? (
          <View style={styles.passActions}>
            <SoftCta label="Add money" onPress={onFundPress} primary icon="plus" />
            {onManagePress ? <SoftCta label="Details" onPress={onManagePress} /> : null}
          </View>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  heroRoot: {
    width: '100%',
    gap: 18,
    paddingTop: 4,
    paddingBottom: 4,
  },
  heroCaption: {
    fontFamily: inter.medium,
    fontSize: 13,
    lineHeight: 18,
    color: ESO_PAY_TEXT_SECONDARY,
    letterSpacing: 0.1,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: grid.sm,
    minHeight: 52,
  },
  balanceVisible: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  symbolHero: {
    fontFamily: inter.medium,
    fontSize: 28,
    lineHeight: 40,
    marginTop: 10,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  amountHero: {
    fontFamily: inter.bold,
    fontSize: 52,
    lineHeight: 58,
    letterSpacing: -2,
    fontWeight: '700',
    color: ESO_PAY_TEXT_PRIMARY,
    flexShrink: 1,
  },
  hiddenHero: {
    fontFamily: inter.bold,
    fontSize: 40,
    lineHeight: 52,
    letterSpacing: 6,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  symbolPass: {
    fontFamily: inter.medium,
    fontSize: 20,
    lineHeight: 28,
    marginTop: 8,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  amountPass: {
    fontFamily: inter.bold,
    ...ds.type.amount,
    fontWeight: '700',
    color: ESO_PAY_TEXT_PRIMARY,
    flexShrink: 1,
  },
  hiddenPass: {
    fontFamily: inter.bold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 5,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  eyeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  softCtaHit: {
    flexGrow: 0,
  },
  softCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 18,
    minHeight: 42,
  },
  softCtaPrimary: {
    backgroundColor: ESO_PAY_TEXT_PRIMARY,
  },
  softCtaSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  softCtaText: {
    fontFamily: inter.semibold,
    fontSize: 14,
    fontWeight: '600',
    color: ESO_PAY_TEXT_PRIMARY,
  },
  softCtaTextPrimary: {
    color: ESO_PAY_BG,
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  passOuter: {
    width: '100%',
    alignSelf: 'stretch',
  },
  passCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: ESO_PAY_SURFACE_ELEVATED,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 18,
    gap: 22,
    overflow: 'hidden',
    minHeight: 168,
  },
  passTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passBrand: {
    fontFamily: inter.semibold,
    fontSize: 15,
    letterSpacing: 0.2,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  passCaptionInline: {
    fontFamily: inter.medium,
    fontSize: 12,
    color: ESO_PAY_TEXT_SECONDARY,
    letterSpacing: 0.4,
  },
  passBalance: {
    gap: 8,
  },
  passCaption: {
    fontFamily: inter.medium,
    fontSize: 12,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  passActions: {
    flexDirection: 'row',
    gap: 10,
  },
  debugBox: {
    width: '100%',
    minHeight: 168,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
  debugText: {
    fontFamily: inter.bold,
    color: 'white',
    fontSize: 24,
  },
});
