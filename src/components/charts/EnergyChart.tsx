/**
 * 24h power chart — Victory Native (SVG).
 * Gold = solar · Teal = grid.
 */
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { VictoryAxis, VictoryChart, VictoryLine } from 'victory-native';
import { colors, fontSize, fonts, radius, shadowCard, spacing } from '@/theme/tokens';

type Point = { hour: number; solar: number; grid: number };
type Props = { data: Point[] };

export function EnergyChart({ data }: Props) {
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(280, width - spacing.xl * 2 - spacing.md * 2);

  const GOLD = colors.gold;
  const TEAL = colors.solarDot;

  return (
    <View style={[styles.wrap, shadowCard]}>
      <View style={styles.header}>
        <Text style={styles.title}>Power Output</Text>
        <Text style={styles.eyebrow}>24H</Text>
      </View>

      <View style={styles.chart}>
        <VictoryChart
          width={chartWidth}
          height={180}
          padding={{ top: 16, bottom: 36, left: 44, right: 16 }}
        >
          <VictoryAxis
            tickFormat={(v) => `${v}h`}
            style={{
              tickLabels: { fill: colors.textTertiary, fontSize: 10, fontFamily: fonts.regular },
              axis: { stroke: colors.borderSubtle },
              grid: { stroke: colors.borderSubtle, strokeDasharray: '4,4' },
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              tickLabels: { fill: colors.textTertiary, fontSize: 10, fontFamily: fonts.regular },
              axis: { stroke: 'transparent' },
              grid: { stroke: colors.borderSubtle, strokeDasharray: '4,4' },
            }}
          />
          <VictoryLine
            data={data}
            x="hour"
            y="solar"
            interpolation="natural"
            style={{ data: { stroke: GOLD, strokeWidth: 2 } }}
          />
          <VictoryLine
            data={data}
            x="hour"
            y="grid"
            interpolation="natural"
            style={{ data: { stroke: TEAL, strokeWidth: 1.5 } }}
          />
        </VictoryChart>
      </View>

      <View style={styles.legend}>
        <LegendDot color={GOLD} label="Solar generation" />
        <LegendDot color={TEAL} label="Grid draw" />
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    overflow: 'hidden',
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.value,
    color: colors.textPrimary,
  },
  eyebrow: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.micro,
    color: colors.textTertiary,
    letterSpacing: 0.8,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 4,
    textAlign: 'center',
  },
  chart: {
    height: 180,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 3, borderRadius: 2 },
  legendText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.badge,
    color: colors.textTertiary,
  },
});
