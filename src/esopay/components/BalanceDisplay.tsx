import { memo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { esopayFonts } from '@/esopay/theme/fonts';
import { EsoPayTokens as T } from '@/esopay/theme/tokens';
import { formatCurrency } from '@/esopay/utils/currency';

type Props = {
  label: string;
  amountKobo: number;
  currency?: string;
  /** Secondary line — e.g. "After payment" or "Shortfall" */
  caption?: string;
  variant?: 'default' | 'emphasis' | 'warning';
  loading?: boolean;
  style?: ViewStyle;
};

export const BalanceDisplay = memo(function BalanceDisplay({
  label,
  amountKobo,
  currency = 'NGN',
  caption,
  variant = 'default',
  loading = false,
  style,
}: Props) {
  const amountColor =
    variant === 'warning'
      ? T.color.red.alert
      : variant === 'emphasis'
        ? T.color.gold.shimmer
        : T.color.text.primary;

  return (
    <View style={[styles.shell, style]}>
      <LinearGradient
        colors={
          variant === 'emphasis'
            ? [`${T.color.gold.primary}12`, T.color.bg.inset]
            : [T.color.bg.inset, T.color.bg.inset]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          variant === 'warning' && { borderColor: `${T.color.red.alert}44` },
          variant === 'emphasis' && { borderColor: T.color.border.active },
        ]}
      >
        <Text style={styles.label}>{label}</Text>
        {loading ? (
          <ActivityIndicator color={T.color.gold.primary} style={styles.loader} />
        ) : (
          <Text style={[styles.amount, { color: amountColor }]}>
            {formatCurrency(amountKobo, currency)}
          </Text>
        )}
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  shell: {
    width: '100%',
  },
  card: {
    borderRadius: T.radius.sm,
    borderWidth: 1,
    borderColor: T.color.border.subtle,
    paddingHorizontal: T.spacing.lg,
    paddingVertical: T.spacing.md,
  },
  label: {
    fontFamily: esopayFonts.body,
    fontSize: T.type.label.size,
    lineHeight: T.type.label.lineHeight,
    letterSpacing: T.type.label.letterSpacing,
    color: T.color.text.secondary,
    textTransform: 'uppercase',
    marginBottom: T.spacing.xs,
  },
  loader: {
    alignSelf: 'flex-start',
  },
  amount: {
    fontFamily: esopayFonts.display,
    fontSize: T.type.h1.size,
    lineHeight: T.type.h1.lineHeight,
    letterSpacing: T.type.h1.letterSpacing,
  },
  caption: {
    marginTop: T.spacing.xs,
    fontFamily: esopayFonts.bodyLight,
    fontSize: T.type.caption.size,
    color: T.color.text.secondary,
  },
});
