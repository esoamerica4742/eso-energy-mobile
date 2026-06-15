import { memo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { ds } from '@/esopay/theme/designSystem';
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
      ? ds.color.error
      : variant === 'emphasis'
        ? ds.color.gold
        : ds.color.textPrimary;

  return (
    <View style={[styles.shell, style]}>
      <View
        style={[
          styles.card,
          variant === 'warning' && styles.cardWarning,
          variant === 'emphasis' && styles.cardEmphasis,
        ]}
      >
        <Text style={styles.label}>{label}</Text>
        {loading ? (
          <ActivityIndicator color={ds.color.gold} style={styles.loader} />
        ) : (
          <Text style={[styles.amount, { color: amountColor }]}>
            {formatCurrency(amountKobo, currency)}
          </Text>
        )}
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  shell: {
    width: '100%',
  },
  card: {
    borderRadius: ds.radius.input,
    borderWidth: 1,
    borderColor: ds.color.border,
    backgroundColor: ds.color.surface1,
    paddingHorizontal: ds.space.screen,
    paddingVertical: ds.space.component,
  },
  cardWarning: {
    borderColor: 'rgba(255, 77, 79, 0.35)',
    backgroundColor: ds.color.errorMuted,
  },
  cardEmphasis: {
    borderColor: ds.color.goldMuted35,
    backgroundColor: ds.color.goldMuted04,
  },
  label: {
    fontFamily: ds.font.label,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    letterSpacing: 0.6,
    color: ds.color.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  loader: {
    alignSelf: 'flex-start',
  },
  amount: {
    fontFamily: ds.font.amount,
    fontSize: ds.type.title.fontSize,
    lineHeight: ds.type.title.lineHeight,
    letterSpacing: -0.3,
  },
  caption: {
    marginTop: 4,
    fontFamily: ds.font.body,
    fontSize: ds.type.caption.fontSize,
    color: ds.color.textSecondary,
  },
});
