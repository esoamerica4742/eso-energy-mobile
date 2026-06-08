/**
 * Live telemetry chart — subscribes to one device's history from the store.
 * Uses Victory Native (SVG) for chart rendering.
 * Re-renders only when the device's history array reference changes.
 */
import { memo, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VictoryArea, VictoryAxis, VictoryChart, VictoryLine, VictoryScatter } from 'victory-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTelemetryStore, selectHistory } from '@/stores/telemetryStore';
import { ChartColors } from '@/tokens/design';
import { colors, fontSize, fonts, spacing } from '@/theme/tokens';

type Series = 'power_kw' | 'battery_pct' | 'voltage' | 'load_kw';

const SERIES_CONFIG: Record<Series, { label: string; color: string; unit: string; scale?: number }> = {
  power_kw:    { label: 'Power',   color: ChartColors.power,   unit: 'kW'  },
  battery_pct: { label: 'Battery', color: ChartColors.battery, unit: '%'   },
  voltage:     { label: 'Voltage', color: colors.gridText,     unit: 'V'   },
  load_kw:     { label: 'Load',    color: ChartColors.load,    unit: 'kW' },
};

type Props = {
  deviceId: string;
  activeSeries?: Series[];
};

export const LiveChart = memo(function LiveChart({
  deviceId,
  activeSeries = ['power_kw', 'battery_pct'],
}: Props) {
  const history = useTelemetryStore(selectHistory(deviceId));
  const [crosshairIndex, setCrosshairIndex] = useState<number | null>(null);
  const [chartWidth, setChartWidth] = useState(0);

  const chartData = useMemo(
    () =>
      history.map((p, i) => ({
        t:           i,
        power_kw:    p.power_kw,
        battery_pct: p.battery_pct / 100, // normalise to 0–1 range so it shares axis with kW
        voltage:     p.voltage / 100,
        load_kw:     p.load_kw,
      })),
    [history],
  );

  const latest = history[history.length - 1];
  const hasData = chartData.length >= 2;

  const livePulse = useSharedValue(0);
  useEffect(() => {
    livePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [livePulse]);
  const liveDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(livePulse.value, [0, 1], [1, 1.5]) }],
    opacity: interpolate(livePulse.value, [0, 1], [1, 0.3]),
  }));

  const trailingPulse = useSharedValue(0);
  useEffect(() => {
    trailingPulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 750 }), withTiming(0, { duration: 750 })),
      -1,
      false,
    );
  }, [trailingPulse]);
  const trailingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(trailingPulse.value, [0, 1], [1, 1.4]) }],
  }));

  const crossPoint = useMemo(() => {
    if (crosshairIndex === null || crosshairIndex < 0 || crosshairIndex >= history.length) return null;
    return history[crosshairIndex];
  }, [crosshairIndex, history]);

  const smoothPower = useSmoothNumber(latest?.power_kw ?? 0, 350);
  const smoothBattery = useSmoothNumber(latest?.battery_pct ?? 0, 350);
  const smoothLoad = useSmoothNumber(latest?.load_kw ?? 0, 350);

  return (
    <LinearGradient colors={['#0F1117', '#0A0D14']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.wrap}>
      <View style={styles.cardInsetTop} />
      <View style={styles.tealGlow} />
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Live Telemetry</Text>
          <Text style={styles.sub}>
            {history.length > 0
              ? `${history.length} readings · last ${formatAgo(latest?.timestamp)}`
              : 'Waiting for data…'}
          </Text>
        </View>
        <View style={styles.liveTag}>
          <Animated.View style={[styles.liveDot, liveDotStyle]} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Chart */}
      <View
        style={styles.chartArea}
        onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
        onTouchStart={(e) => {
          if (chartWidth <= 0 || history.length === 0) return;
          const x = e.nativeEvent.locationX;
          const idx = Math.max(0, Math.min(history.length - 1, Math.round((x / chartWidth) * (history.length - 1))));
          setCrosshairIndex(idx);
        }}
        onTouchMove={(e) => {
          if (chartWidth <= 0 || history.length === 0) return;
          const x = e.nativeEvent.locationX;
          const idx = Math.max(0, Math.min(history.length - 1, Math.round((x / chartWidth) * (history.length - 1))));
          setCrosshairIndex(idx);
        }}
        onTouchEnd={() => setCrosshairIndex(null)}
      >
        <View style={styles.chartBgGlow} />
        {hasData ? (
          <VictoryChart
            width={Math.max(chartWidth, 280)}
            height={220}
            padding={{ top: 16, bottom: 28, left: 8, right: 8 }}
          >
            <VictoryAxis
              style={{
                axis: { stroke: 'transparent' },
                ticks: { stroke: 'transparent' },
                tickLabels: { fill: 'transparent' },
                grid: { stroke: 'rgba(255,255,255,0.04)' },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: 'transparent' },
                ticks: { stroke: 'transparent' },
                tickLabels: { fill: 'transparent' },
                grid: { stroke: 'rgba(255,255,255,0.04)' },
              }}
            />
            {activeSeries.map((key) => (
              <VictoryArea
                key={`${key}-area`}
                data={chartData}
                x="t"
                y={key}
                interpolation="natural"
                style={{
                  data: {
                    fill: seriesColor(key),
                    fillOpacity: seriesAreaOpacity(key),
                    stroke: 'transparent',
                  },
                }}
              />
            ))}
            {activeSeries.map((key) => (
              <VictoryLine
                key={`${key}-line`}
                data={chartData}
                x="t"
                y={key}
                interpolation="natural"
                style={{
                  data: {
                    stroke: seriesColor(key),
                    strokeWidth: key === 'power_kw' ? 2.5 : 2,
                  },
                }}
              />
            ))}
            {activeSeries.map((key) => {
              const lastPoint = chartData[chartData.length - 1];
              return lastPoint ? (
                <VictoryScatter
                  key={`${key}-dot`}
                  data={[lastPoint]}
                  x="t"
                  y={key}
                  size={3}
                  style={{ data: { fill: seriesColor(key) } }}
                />
              ) : null;
            })}
          </VictoryChart>
        ) : (
          <ChartSkeleton />
        )}

        {/* Y axis labels */}
        <View pointerEvents="none" style={styles.yLabels}>
          <Text style={styles.axisLabel}>3.0 kW</Text>
          <Text style={styles.axisLabel}>2.0 kW</Text>
          <Text style={styles.axisLabel}>1.0 kW</Text>
          <Text style={styles.axisLabel}>0.0 kW</Text>
        </View>
        {/* X axis labels */}
        <View pointerEvents="none" style={styles.xLabels}>
          <Text style={styles.axisLabel}>5m</Text>
          <Text style={styles.axisLabel}>10m</Text>
          <Text style={styles.axisLabel}>15m</Text>
        </View>

        {/* Trailing dots */}
        {hasData ? (
          <View pointerEvents="none" style={styles.trailingRow}>
            {activeSeries.map((key) => (
              <Animated.View
                key={key}
                style={[
                  styles.trailingDot,
                  trailingStyle,
                  {
                    backgroundColor: seriesColor(key),
                  },
                ]}
              />
            ))}
          </View>
        ) : null}

        {/* Crosshair + tooltip */}
        {crossPoint && chartWidth > 0 ? (
          <>
            <View style={[styles.crosshair, { left: (crosshairIndex! / Math.max(1, history.length - 1)) * chartWidth }]} />
            <View style={[styles.tooltip, { left: Math.max(8, Math.min(chartWidth - 160, (crosshairIndex! / Math.max(1, history.length - 1)) * chartWidth - 70)) }]}>
              <Text style={styles.tooltipTime}>{new Date(crossPoint.timestamp).toLocaleTimeString()}</Text>
              <Text style={[styles.tooltipVal, { color: ChartColors.power }]}>{`Power ${crossPoint.power_kw.toFixed(2)} kW`}</Text>
              <Text style={[styles.tooltipVal, { color: ChartColors.battery }]}>{`Battery ${Math.round(crossPoint.battery_pct)}%`}</Text>
              <Text style={[styles.tooltipVal, { color: ChartColors.load }]}>{`Load ${crossPoint.load_kw.toFixed(2)} kW`}</Text>
            </View>
          </>
        ) : null}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: ChartColors.power }]} />
          <Text style={styles.legendLabel}>Power</Text>
          <Text style={[styles.legendValue, { color: ChartColors.power }]}>{`${smoothPower.toFixed(2)} kW`}</Text>
        </View>
        <Text style={styles.legendDotSep}>·</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: ChartColors.battery }]} />
          <Text style={styles.legendLabel}>Battery</Text>
          <Text style={[styles.legendValue, { color: ChartColors.battery }]}>{`${Math.round(smoothBattery)}%`}</Text>
        </View>
        <Text style={styles.legendDotSep}>·</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: ChartColors.load }]} />
          <Text style={styles.legendLabel}>Load</Text>
          <Text style={[styles.legendValue, { color: ChartColors.load }]}>{`${smoothLoad.toFixed(2)} kW`}</Text>
        </View>
      </View>
    </LinearGradient>
  );
});

function ChartSkeleton() {
  const shimmer = useSharedValue(0);
  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.linear }), -1, false);
  }, [shimmer]);
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [240, -240]) }],
  }));
  return (
    <View style={styles.skeletonWrap}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.skelLine, { top: 24 + i * 34 }]}>
          <Animated.View style={[styles.skelShimmer, shimmerStyle]} />
        </View>
      ))}
    </View>
  );
}

function useSmoothNumber(target: number, duration: number): number {
  const [v, setV] = useState(target);
  useEffect(() => {
    const start = v;
    const t0 = Date.now();
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (Date.now() - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(start + (target - start) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);
  return v;
}

function formatAgo(ts?: string): string {
  if (!ts) return '—';
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 5)  return 'just now';
  if (diff < 60) return `${diff}s ago`;
  return `${Math.floor(diff / 60)}m ago`;
}

function seriesColor(key: Series): string {
  if (key === 'power_kw') return ChartColors.power;
  if (key === 'load_kw') return ChartColors.load;
  if (key === 'battery_pct') return ChartColors.battery;
  return SERIES_CONFIG[key].color;
}

function seriesAreaOpacity(key: Series): number {
  if (key === 'power_kw') return 0.15;
  if (key === 'load_kw') return 0.1;
  if (key === 'battery_pct') return 0.12;
  return 0.08;
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowRadius: 48,
    shadowOffset: { width: 0, height: 24 },
    elevation: 7,
  },
  cardInsetTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  tealGlow: {
    position: 'absolute',
    right: -40,
    bottom: -40,
    width: 180,
    height: 140,
    borderRadius: 100,
    backgroundColor: 'rgba(0,229,160,0.06)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    letterSpacing: -0.44,
    color: colors.textPrimary,
  },
  sub: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.12,
    marginTop: 2,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,229,160,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,160,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
  },
  liveDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.positiveText,
  },
  liveText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.positiveText,
    letterSpacing: 1,
  },
  chartArea: { height: 184, paddingHorizontal: spacing.md, paddingTop: spacing.sm, position: 'relative' },
  chartBgGlow: {
    position: 'absolute',
    bottom: 24,
    left: '28%',
    width: 180,
    height: 90,
    borderRadius: 90,
    backgroundColor: 'rgba(201,155,58,0.03)',
  },
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.badge,
    color: colors.textTertiary,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendLine: { width: 14, height: 2, borderRadius: 1 },
  legendLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  legendValue: {
    fontFamily: fonts.bold,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  legendDotSep: {
    color: 'rgba(255,255,255,0.28)',
    fontSize: 12,
    marginHorizontal: 2,
  },
  yLabels: {
    position: 'absolute',
    left: 2,
    top: 10,
    bottom: 24,
    justifyContent: 'space-between',
  },
  xLabels: {
    position: 'absolute',
    left: 42,
    right: 16,
    bottom: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  axisLabel: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: 'rgba(255,255,255,0.2)',
  },
  trailingRow: {
    position: 'absolute',
    right: 12,
    top: 34,
    gap: 8,
  },
  trailingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  crosshair: {
    position: 'absolute',
    top: 8,
    bottom: 18,
    width: 1,
    borderLeftWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderStyle: 'dashed',
  },
  tooltip: {
    position: 'absolute',
    top: 14,
    width: 152,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(10,13,20,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tooltipTime: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  tooltipVal: {
    fontFamily: fonts.bold,
    fontSize: 11,
    marginBottom: 2,
  },
  skeletonWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  skelLine: {
    position: 'absolute',
    left: 18,
    right: 18,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#0F1117',
    overflow: 'hidden',
  },
  skelShimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 140,
    backgroundColor: '#1A2035',
  },
});
