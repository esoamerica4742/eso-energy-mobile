import { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SkeletonChart } from '@/components/atoms/Skeleton';
import { VictoryAxis, VictoryChart, VictoryLine } from 'victory-native';
import { useEnodeTelemetry } from '@/hooks/useEnodeTelemetry';
import { useInterpolatedSeries, useMicroFluctuation, useSyncStatus } from '@/hooks/useTelemetryPerception';
import { useRealtimeTelemetryStore } from '@/stores/realtimeTelemetryStore';
import { startFrameDropMonitor } from '@/lib/mobileObservability';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

type Props = {
  deviceId: string;
};

export function EnodePowerChart({ deviceId }: Props) {
  const { data: points = [], isLoading, isError } = useEnodeTelemetry(deviceId);
  const realtimePoint = useRealtimeTelemetryStore((s) => s.byDevice[deviceId] ?? null);

  const baseChartData = useMemo(
    () =>
      points.map((p, i) => ({
        hour: i,
        solar: Number(p.production_kw ?? 0),
        grid: Number(p.grid_kw ?? 0),
        charge: Number(p.charge_kw ?? 0),
      })),
    [points],
  );
  const chartData = useInterpolatedSeries(baseChartData, 2500);
  const lastPoint = points[points.length - 1];
  const solarLive = useMicroFluctuation(Number(realtimePoint?.solarKw ?? lastPoint?.production_kw ?? 0), {
    minPct: 0.005,
    maxPct: 0.01,
    intervalMs: 3500,
  });
  const loadLive = useMicroFluctuation(Number(realtimePoint?.loadKw ?? lastPoint?.grid_kw ?? 0), {
    minPct: 0.005,
    maxPct: 0.01,
    intervalMs: 3800,
  });
  const sync = useSyncStatus(realtimePoint?.updatedAt ?? lastPoint?.recorded_at ?? null, 300_000);

  useEffect(() => {
    const stop = startFrameDropMonitor(18);
    return stop;
  }, []);

  if (isLoading) {
    return <SkeletonChart height={200} />;
  }

  if (isError || chartData.length === 0) {
    return (
      <View style={[styles.wrap, styles.center]}>
        <Text style={styles.empty}>Power history will appear after the first sync</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.label}>POWER FLOW · 24H</Text>
        <Text style={[styles.syncLabel, sync.syncingSoon && styles.syncingSoon]}>{sync.label}</Text>
      </View>
      <View style={styles.chart}>
        <VictoryChart
          width={320}
          height={140}
          padding={{ top: 12, bottom: 28, left: 40, right: 12 }}
        >
          <VictoryAxis
            style={{
              tickLabels: { fill: colors.textTertiary, fontSize: 9 },
              axis: { stroke: colors.borderSubtle },
              grid: { stroke: colors.borderSubtle, strokeDasharray: '3,3' },
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              tickLabels: { fill: colors.textTertiary, fontSize: 9 },
              axis: { stroke: 'transparent' },
              grid: { stroke: colors.borderSubtle, strokeDasharray: '3,3' },
            }}
          />
          <VictoryLine
            data={chartData}
            x="hour"
            y="solar"
            style={{ data: { stroke: colors.solarDot, strokeWidth: 1.5 } }}
          />
          <VictoryLine
            data={chartData}
            x="hour"
            y="grid"
            style={{ data: { stroke: colors.gridDot, strokeWidth: 1.5 } }}
          />
        </VictoryChart>
      </View>
      <View style={styles.legend}>
        <LegendDot color={colors.solarDot} label={`Solar ${solarLive.toFixed(2)} kW`} />
        <LegendDot color={colors.gridDot} label={`Load ${loadLive.toFixed(2)} kW`} />
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
    padding: spacing.lg,
    minHeight: 200,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.label,
    color: colors.textSecondary,
    letterSpacing: 0.7,
  },
  syncLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.2,
  },
  syncingSoon: {
    color: '#10B981',
    opacity: 0.9,
  },
  chart: { flex: 1, minHeight: 140 },
  empty: {
    fontFamily: fonts.regular,
    fontSize: fontSize.badge,
    color: colors.textTertiary,
    textAlign: 'center',
    padding: spacing.lg,
  },
  legend: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textTertiary,
  },
});
