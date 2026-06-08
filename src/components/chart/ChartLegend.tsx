import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import { formatLegendValue } from '@/utils/formatMetric';
import type { ChartSeries } from '@/types/telemetry';

type Props = {
  series: ChartSeries[];
  muted?: boolean;
};

export function ChartLegend({ series, muted = false }: Props) {
  return (
    <View style={styles.grid}>
      {series.map((item) => {
        const accent = muted ? Colors.textMuted : item.color;

        return (
          <View key={item.id} style={styles.cell}>
            <View style={[styles.dash, { backgroundColor: accent }]} />
            <Text style={styles.label} numberOfLines={1}>
              {item.label}
            </Text>
            <Text
              style={[styles.value, { color: accent }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {muted ? '—' : formatLegendValue(item.currentValue, item.unit)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cell: {
    flex: 1,
    minWidth: 0,
    minHeight: 72,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dash: {
    width: 18,
    height: 2,
    borderRadius: 1,
    marginBottom: 8,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: FontSize.micro,
    letterSpacing: 0.8,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
    textAlign: 'center',
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: FontSize.caption,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
});
