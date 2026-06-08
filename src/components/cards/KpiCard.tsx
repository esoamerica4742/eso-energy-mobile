import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fonts, radius, shadowCard, spacing } from '@/theme/tokens';
import { MetricDelta } from '@/components/atoms/MetricDelta';

export const CARD_WIDTH = 156;

type Props = {
  label: string;
  value: string;
  unit: string;
  delta: string;
  positive: boolean;
  accent?: 'gold' | 'teal' | 'default';
};

export function KpiCard({ label, value, unit, delta, positive, accent = 'default' }: Props) {
  const accentColor =
    accent === 'gold'
      ? colors.gold
      : accent === 'teal'
        ? colors.solarDot
        : colors.borderDefault;

  return (
    <View style={[styles.card, shadowCard]}>
      {/* Top accent line */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      <View style={styles.inner}>
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
          {value}
          {unit ? <Text style={styles.unit}> {unit}</Text> : null}
        </Text>
        <MetricDelta delta={delta} positive={positive} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  accentBar: {
    height: 2,
    width: '100%',
  },
  inner: {
    padding: spacing.lg,
    paddingTop: spacing.md + 2,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.label,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.textPrimary,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
    lineHeight: 32,
  },
  unit: {
    fontFamily: fonts.regular,
    fontSize: fontSize.value,
    color: colors.textSecondary,
    letterSpacing: 0,
  },
});
