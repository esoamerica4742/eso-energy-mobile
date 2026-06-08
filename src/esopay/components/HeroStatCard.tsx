import { memo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { esopayFonts } from '@/esopay/theme/fonts';
import { EsoPayTokens as T } from '@/esopay/theme/tokens';
import { formatCurrencyCompact } from '@/esopay/utils/currency';

type Props = {
  label: string;
  value: number;
  currency?: string;
  currencyFormat?: boolean;
  trend?: 'up' | 'down';
  loading?: boolean;
  style?: ViewStyle;
};

export const HeroStatCard = memo(function HeroStatCard({
  label,
  value,
  currency = 'NGN',
  currencyFormat = true,
  trend,
  loading = false,
  style,
}: Props) {
  const displayValue = currencyFormat
    ? formatCurrencyCompact(value, currency)
    : value.toLocaleString('en-NG');

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>

      <View style={styles.valueRow}>
        {loading ? (
          <ActivityIndicator color={T.color.gold.primary} size="small" />
        ) : (
          <>
            <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>
              {displayValue}
            </Text>
            {trend ? (
              trend === 'up' ? (
                <TrendingUp size={16} color={T.color.gold.primary} strokeWidth={2.2} />
              ) : (
                <TrendingDown size={16} color={T.color.red.alert} strokeWidth={2.2} />
              )
            ) : null}
          </>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: T.color.bg.surface,
    borderRadius: T.radius.sm,
    borderWidth: 1,
    borderColor: T.color.border.subtle,
    paddingHorizontal: T.spacing.lg,
    paddingVertical: T.spacing.lg,
    ...T.shadow.card,
  },
  label: {
    fontFamily: esopayFonts.body,
    fontSize: T.type.label.size,
    lineHeight: T.type.label.lineHeight,
    letterSpacing: T.type.label.letterSpacing,
    color: T.color.text.secondary,
    textTransform: 'uppercase',
    marginBottom: T.spacing.sm,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: T.spacing.xs,
    minHeight: 36,
  },
  value: {
    flexShrink: 1,
    fontFamily: esopayFonts.display,
    fontSize: T.type.display.size,
    lineHeight: T.type.display.lineHeight,
    letterSpacing: T.type.display.letterSpacing,
    color: T.color.text.primary,
  },
});
