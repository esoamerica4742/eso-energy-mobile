import { memo, useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { esopayFonts } from '@/esopay/theme/fonts';
import { fonts } from '@/esopay/theme/typography';
import { EsoPayTokens as T } from '@/esopay/theme/tokens';
import {
  formatCurrency,
  formatCurrencyAmount,
  getCurrencySymbol,
} from '@/esopay/utils/currency';

type Props = {
  valueKobo: number;
  currency?: string;
  durationMs?: number;
  style?: StyleProp<TextStyle>;
  symbolStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  /** Always show .00 — wallet hero balance */
  alwaysDecimals?: boolean;
  /** When false, only the amount is rendered (symbol shown elsewhere). */
  showSymbol?: boolean;
};

/** Frame-interpolated currency display — symbol and amount in separate Text nodes to avoid overlap. */
export const NumberTicker = memo(function NumberTicker({
  valueKobo,
  currency = 'NGN',
  durationMs = T.animation.numberTickerDurationMs,
  style,
  symbolStyle,
  containerStyle,
  alwaysDecimals = false,
  showSymbol = true,
}: Props) {
  const formatParts = useCallback(
    (kobo: number) => ({
      symbol: getCurrencySymbol(currency),
      amount: formatCurrencyAmount(Math.round(kobo), currency, { alwaysDecimals }),
      label: formatCurrency(Math.round(kobo), currency),
    }),
    [alwaysDecimals, currency],
  );

  const animatedValue = useSharedValue(valueKobo);
  const [parts, setParts] = useState(() => formatParts(valueKobo));

  const syncDisplay = useCallback(
    (kobo: number) => {
      setParts(formatParts(kobo));
    },
    [formatParts],
  );

  useEffect(() => {
    setParts(formatParts(valueKobo));
    animatedValue.value = withTiming(valueKobo, {
      duration: durationMs,
      easing: Easing.out(Easing.cubic),
    });
  }, [animatedValue, durationMs, formatParts, valueKobo]);

  useAnimatedReaction(
    () => animatedValue.value,
    (current, previous) => {
      if (previous != null && current === previous) return;
      runOnJS(syncDisplay)(current);
    },
    [syncDisplay],
  );

  const amountStyle = StyleSheet.flatten([styles.amount, style]);
  const symbolTextStyle = StyleSheet.flatten([
    styles.symbol,
    amountStyle?.fontSize != null
      ? { fontSize: amountStyle.fontSize, lineHeight: amountStyle.lineHeight }
      : null,
    amountStyle?.color != null ? { color: amountStyle.color } : null,
    symbolStyle,
  ]);

  return (
    <View
      style={[styles.row, containerStyle]}
      accessibilityLabel={parts.label}
      accessible
    >
      {showSymbol ? <Text style={symbolTextStyle}>{parts.symbol}</Text> : null}
      <Text style={amountStyle}>{parts.amount}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexWrap: 'nowrap',
  },
  symbol: {
    padding: 0,
    margin: 0,
    marginRight: 2,
    fontFamily: fonts.uiMedium,
    fontSize: T.type.display.size,
    lineHeight: T.type.display.lineHeight,
    letterSpacing: 0,
    color: T.color.gold.primary,
  },
  amount: {
    padding: 0,
    margin: 0,
    fontFamily: esopayFonts.display,
    fontSize: T.type.display.size,
    lineHeight: T.type.display.lineHeight,
    letterSpacing: T.type.display.letterSpacing,
    color: T.color.gold.primary,
  },
});
