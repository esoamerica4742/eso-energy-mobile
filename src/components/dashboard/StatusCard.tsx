/**
 * Live metrics status card.
 * Reads from telemetryStore via selector — only re-renders when THIS device changes.
 */
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
import Svg, { Circle, Path } from 'react-native-svg';
import { Thermometer, Zap, Battery, Activity, type LucideIcon } from 'lucide-react-native';
import { useTelemetryStore, selectLatest } from '@/stores/telemetryStore';
import { colors, fontSize, fonts, spacing } from '@/theme/tokens';

type Props = {
  deviceId: string;
  deviceName: string;
};

export const StatusCard = memo(function StatusCard({ deviceId, deviceName }: Props) {
  const point = useTelemetryStore(selectLatest(deviceId));

  const battPct    = point?.battery_pct    ?? 0;
  const loadKw     = point?.load_kw        ?? 0;
  const tempC      = point?.temperature_c  ?? 0;
  const powerKw    = point?.power_kw       ?? 0;
  const hasData    = point !== null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Card entrance
  const appear = useSharedValue(0);
  useEffect(() => {
    appear.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [appear]);

  // Pulse animation when a live update arrives
  const glow = useSharedValue(0);
  useEffect(() => {
    if (!point) return;
    glow.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 800 }),
    );
  // Only run when timestamp changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [point?.timestamp]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value * 0.25,
  }));
  const appearStyle = useAnimatedStyle(() => ({
    opacity: appear.value,
    transform: [{ translateY: interpolate(appear.value, [0, 1], [20, 0]) }],
  }));

  const battColor =
    battPct > 60 ? colors.positiveText :
    battPct > 25 ? colors.warningDot :
                   colors.offlineDot;

  const tempColor =
    tempC > 60 ? colors.offlineDot :
    tempC > 48 ? colors.warningDot :
                 colors.textSecondary;

  const livePulseA = useSharedValue(0);
  const livePulseB = useSharedValue(0);
  useEffect(() => {
    livePulseA.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false);
    livePulseB.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 600 }),
        withTiming(1, { duration: 1200, easing: Easing.out(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [livePulseA, livePulseB]);

  const ringA = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(livePulseA.value, [0, 1], [1, 2]) }],
    opacity: interpolate(livePulseA.value, [0, 1], [0.4, 0]),
  }));
  const ringB = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(livePulseB.value, [0, 1], [1, 2]) }],
    opacity: interpolate(livePulseB.value, [0, 1], [0.4, 0]),
  }));

  const battCount = useCountUp(Math.round(battPct), 1600, 0);
  const loadCount = useCountUp(loadKw, 1600, 100, 1);
  const powerCount = useCountUp(powerKw, 1600, 200, 2);
  const tempCount = useCountUp(Math.round(tempC), 1600, 300);

  return (
    <Animated.View style={[appearStyle, glowStyle, { shadowColor: colors.gold }]}>
      <LinearGradient colors={['#0F1117', '#0A0D14']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <View style={styles.cardInsetTop} />
        <View style={styles.cardBloom} />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.liveDotWrap}>
          <Animated.View style={[styles.liveRing, ringA]} />
          <Animated.View style={[styles.liveRing, ringB]} />
          <View style={[styles.liveDot, { backgroundColor: hasData ? colors.positiveText : colors.textTertiary }]} />
        </View>
        <Text style={styles.name} numberOfLines={1}>{deviceName}</Text>
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>● LIVE</Text>
        </View>
      </View>

      {/* 2 × 2 metric grid */}
      {hasData && mounted ? (
      <View style={styles.grid}>
        <Metric
          Icon={Battery}
          label="Battery"
          value={`${Math.round(battCount)}%`}
          valueColor={battColor}
          metricType="battery"
          meterProgress={Math.max(0, Math.min(100, battPct))}
          sub={battPct < 25 ? 'Low' : battPct < 50 ? 'Fair' : 'Good'}
        />
        <Metric
          Icon={Zap}
          label="Load"
          value={`${loadCount.toFixed(1)} kW`}
          valueColor={colors.gridText}
          metricType="load"
          sub="Active draw"
        />
        <Metric
          Icon={Activity}
          label="Power"
          value={`${powerCount.toFixed(2)} kW`}
          valueColor={colors.gold}
          metricType="power"
          sub="Output"
        />
        <Metric
          Icon={Thermometer}
          label="Temp"
          value={`${Math.round(tempCount)}°C`}
          valueColor={tempColor}
          metricType="temp"
          sub={tempC > 60 ? 'Critical' : tempC > 48 ? 'Warm' : 'Normal'}
        />
      </View>
      ) : (
        <StatusSkeleton />
      )}
      </LinearGradient>
    </Animated.View>
  );
});

function Metric({
  Icon,
  label,
  value,
  valueColor,
  metricType,
  meterProgress,
  sub,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  valueColor: string;
  metricType: 'battery' | 'load' | 'power' | 'temp';
  meterProgress?: number;
  sub: string;
}) {
  const histogram = useMemo(() => [0.2, 0.36, 0.24, 0.48, 0.3, 0.58, 0.41], []);
  const wave = useMemo(() => {
    const periods = 3;
    const width = 132;
    const mid = 40;
    const amp = 6;
    let d = 'M 0 40';
    for (let x = 0; x <= width; x += 4) {
      const y = mid + Math.sin((x / width) * periods * Math.PI * 2) * amp;
      d += ` L ${x} ${y}`;
    }
    return d;
  }, []);
  const battStroke = 2 * Math.PI * 24;
  const battFill = battStroke * ((meterProgress ?? 0) / 100);

  return (
    <View style={styles.metric}>
      {metricType === 'temp' ? <View style={styles.tempBg} /> : null}
      {metricType === 'load' ? (
        <View style={styles.histogram}>
          {histogram.map((h, i) => (
            <View key={i} style={[styles.histBar, { height: 30 * h }]} />
          ))}
        </View>
      ) : null}
      {metricType === 'power' ? (
        <Svg width="132" height="48" style={styles.wave}>
          <Path d={wave} stroke="rgba(201,155,58,0.12)" strokeWidth={1.5} fill="none" />
        </Svg>
      ) : null}
      <View style={styles.metricHeader}>
        <Icon size={12} color={valueColor} strokeWidth={2} />
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
      {metricType === 'battery' ? (
        <Svg width="58" height="58" style={styles.batteryArc}>
          <Circle cx="29" cy="29" r="24" stroke="rgba(16,185,129,0.25)" strokeWidth={3} fill="none" />
          <Circle
            cx="29"
            cy="29"
            r="24"
            stroke={colors.positiveText}
            strokeWidth={3}
            fill="none"
            strokeDasharray={`${battFill} ${battStroke}`}
            transform="rotate(-90 29 29)"
          />
        </Svg>
      ) : null}
      <Text style={[styles.metricValue, { color: valueColor }]}>{value}</Text>
      <Text style={[styles.metricSub, (metricType === 'battery' || metricType === 'temp') && styles.metricSubGood]}>
        {(metricType === 'battery' || metricType === 'temp') ? `✦ ${sub}` : sub}
      </Text>
    </View>
  );
}

function StatusSkeleton() {
  const shimmer = useSharedValue(0);
  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.linear }), -1, false);
  }, [shimmer]);
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [240, -240]) }],
  }));
  return (
    <View>
      <Skel style={styles.skelHead} shimmerStyle={shimmerStyle} />
      <View style={styles.grid}>
        <Skel style={styles.skelMetric} shimmerStyle={shimmerStyle} />
        <Skel style={styles.skelMetric} shimmerStyle={shimmerStyle} />
        <Skel style={styles.skelMetric} shimmerStyle={shimmerStyle} />
        <Skel style={styles.skelMetric} shimmerStyle={shimmerStyle} />
      </View>
    </View>
  );
}

function Skel({ style, shimmerStyle }: { style: object; shimmerStyle: object }) {
  return (
    <View style={[styles.skeleton, style]}>
      <Animated.View style={[styles.skeletonShimmer, shimmerStyle]} />
    </View>
  );
}

function useCountUp(target: number, duration: number, delay = 0, decimals = 0): number {
  const [v, setV] = useState(0);
  const currentRef = useRef(0);
  useEffect(() => {
    currentRef.current = v;
  }, [v]);
  useEffect(() => {
    let raf = 0;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const startRun = () => {
      const start = Date.now();
      const startValue = currentRef.current;
      const tick = () => {
        const t = Math.min(1, (Date.now() - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const n = startValue + (target - startValue) * eased;
        const p = decimals > 0 ? Number(n.toFixed(decimals)) : Math.round(n);
        setV(p);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    timeout = setTimeout(startRun, delay);
    return () => {
      if (timeout) clearTimeout(timeout);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, duration, delay, decimals]);
  return v;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    overflow: 'hidden',
    shadowColor: colors.gold,
    shadowOpacity: 0.25,
    shadowRadius: 48,
    shadowOffset: { width: 0, height: 24 },
  },
  cardInsetTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  cardBloom: {
    position: 'absolute',
    left: -40,
    bottom: -30,
    width: 180,
    height: 140,
    borderRadius: 100,
    backgroundColor: 'rgba(201,155,58,0.07)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    paddingBottom: spacing.md,
  },
  liveDotWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveRing: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.positiveText,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 18,
    letterSpacing: -0.18,
    color: colors.textPrimary,
  },
  liveBadge: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(0,229,160,0.25)',
    backgroundColor: 'rgba(0,229,160,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveBadgeText: {
    color: colors.positiveText,
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metric: {
    width: '47%',
    backgroundColor: '#0F131B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  metricLabel: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metricValue: {
    fontFamily: fonts.bold,
    fontSize: 36,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
    marginBottom: 2,
  },
  metricSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  metricSubGood: {
    color: colors.positiveText,
    fontFamily: fonts.semibold,
    fontWeight: '600',
  },
  batteryArc: {
    position: 'absolute',
    right: 8,
    top: 12,
    opacity: 0.8,
  },
  histogram: {
    position: 'absolute',
    right: 10,
    top: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    opacity: 0.15,
  },
  histBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  wave: {
    position: 'absolute',
    right: 0,
    top: 24,
  },
  tempBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    backgroundColor: 'rgba(0,229,160,0.06)',
  },
  skeleton: {
    borderRadius: 12,
    backgroundColor: '#0F1117',
    overflow: 'hidden',
  },
  skeletonShimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 140,
    backgroundColor: '#1A2035',
  },
  skelHead: {
    width: '62%',
    height: 28,
    marginBottom: spacing.md,
    borderRadius: 8,
  },
  skelMetric: {
    width: '47%',
    height: 130,
    borderRadius: 16,
  },
});
