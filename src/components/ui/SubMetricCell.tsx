import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import { formatMetric } from '@/utils/formatMetric';
import type { SubMetric } from '@/types/dashboard';

type Props = {
  metric: SubMetric;
};

const colorMap = {
  gold: Colors.gold,
  mint: Colors.mint,
  white: Colors.textPrimary,
  muted: Colors.textMuted,
} as const;

export function SubMetricCell({ metric }: Props) {
  const display = formatMetric(metric.rawValue, metric.unit, metric.abbreviate);
  const accent = colorMap[metric.valueColor];

  return (
    <View style={styles.cell}>
      <Text style={styles.label} numberOfLines={1}>
        {metric.label}
      </Text>
      <Text
        style={[styles.value, { color: accent }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {display}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    minWidth: 0,
    minHeight: 64,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.micro,
    letterSpacing: 0.8,
    color: Colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  value: {
    fontSize: FontSize.body,
    fontFamily: fonts.bold,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
});
