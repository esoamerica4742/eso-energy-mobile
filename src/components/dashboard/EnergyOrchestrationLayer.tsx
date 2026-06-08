import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  Extrapolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { SunMedium, BrainCircuit, Building2, BatteryCharging } from 'lucide-react-native';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

type Props = {
  batterySoc: number;
  reducedMotion?: boolean;
};

export function EnergyOrchestrationLayer({ batterySoc, reducedMotion = false }: Props) {
  const [bootLoading, setBootLoading] = useState(true);
  const reveal = useSharedValue(0);
  const fill = useSharedValue(0);
  const glow = useSharedValue(0);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => setBootLoading(false), 520);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    reveal.value = withTiming(1, { duration: 320 });
  }, [reveal, bootLoading]);

  useEffect(() => {
    if (bootLoading) {
      fill.value = 0;
      return;
    }
    const target = Math.max(0.06, Math.min(1, batterySoc / 100));
    fill.value = withTiming(target, {
      duration: 1200,
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    });
  }, [batterySoc, bootLoading, fill]);

  useEffect(() => {
    if (reducedMotion) {
      glow.value = withTiming(0, { duration: 120 });
      shimmer.value = withTiming(0, { duration: 120 });
      return;
    }
    glow.value = withRepeat(withTiming(1, { duration: 1700 }), -1, true);
    shimmer.value = withRepeat(withDelay(400, withTiming(1, { duration: 1500 })), -1, false);
  }, [glow, shimmer, reducedMotion]);

  const centerGlow = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(glow.value, [0, 1], [0.2, 0.44]),
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-120, 220]) }],
    opacity: interpolate(shimmer.value, [0, 0.1, 0.9, 1], [0, 0.3, 0.3, 0]),
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(100, fill.value * 100))}%`,
  }));

  const contentReveal = useAnimatedStyle(() => ({
    opacity: reveal.value,
  }));

  return (
    <LinearGradient colors={['#0F1117', '#0A0D14']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View style={styles.cardTopInset} />
      <View style={styles.goldBloom} pointerEvents="none" />
      {bootLoading ? (
        <SkeletonLayer />
      ) : (
        <Animated.View style={contentReveal}>
          <Text style={styles.subtitle}>SOVEREIGN TRANSFER TOPOLOGY</Text>

          <View style={styles.nodesShell}>
            <LinearGradient pointerEvents="none" colors={['#0A0D14', 'transparent']} style={styles.fadeLeft} />
            <LinearGradient pointerEvents="none" colors={['transparent', '#0A0D14']} style={styles.fadeRight} />
            <ScrollView
              horizontal
              bounces={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.row}
            >
              <Node icon={<SunMedium size={16} color={colors.gold} strokeWidth={2.1} />} label="Solar Capture Fields" />
              <FlowWire reducedMotion={reducedMotion} />
              <Node
                icon={<BrainCircuit size={16} color={colors.gold} strokeWidth={2.1} />}
                label="ESO Inverter Intelligence"
                center
                centerGlowStyle={centerGlow}
              />
              <FlowWire reducedMotion={reducedMotion} />
              <Node icon={<Building2 size={16} color={colors.gold} strokeWidth={2.1} />} label="Facility Grid Load" />
            </ScrollView>
          </View>

          <View style={styles.storageRow}>
            <View style={styles.storageIconGlow}>
              <BatteryCharging size={12} color={colors.solarDot} strokeWidth={2.2} />
            </View>
            <Text style={styles.storageLabel}>Metallic Lithium Reserve</Text>
            <Text style={styles.storageValue}>{`${Math.round(batterySoc)}% SoC`}</Text>
          </View>
          <View style={styles.storageTrack}>
            <Animated.View style={[styles.storageFill, fillStyle]}>
              <LinearGradient colors={['#059669', '#10B981', '#34D399']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.storageGradient} />
            </Animated.View>
            <Animated.View style={[styles.storageShimmer, shimmerStyle]} />
          </View>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

function Node({
  icon,
  label,
  center = false,
  centerGlowStyle,
}: {
  icon: ReactNode;
  label: string;
  center?: boolean;
  centerGlowStyle?: object;
}) {
  return (
    <View style={styles.nodeWrap}>
      <Animated.View style={[styles.node, center && styles.nodeCenter, centerGlowStyle]}>
        <View style={styles.nodeIconGlow}>{icon}</View>
      </Animated.View>
      <Text style={styles.nodeLabel} numberOfLines={2}>{label}</Text>
    </View>
  );
}

function FlowWire({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const t = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      t.value = withTiming(0, { duration: 120 });
      return;
    }
    t.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.linear }), -1, false);
  }, [t, reducedMotion]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(t.value, [0, 1], [0, 36]) }],
    opacity: interpolate(t.value, [0, 0.15, 0.85, 1], [0, 1, 1, 0]),
  }));

  const dash = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(t.value, [0, 1], [0, -18], Extrapolate.CLAMP),
  }));

  return (
    <View style={styles.wire}>
      <Svg width={36} height={8}>
        <AnimatedPath
          d="M0 4 H36"
          stroke="rgba(201,155,58,0.25)"
          strokeWidth={1}
          fill="none"
          strokeDasharray="5 4"
          animatedProps={dash}
        />
      </Svg>
      <Animated.View style={[styles.wireDot, dotStyle]} />
    </View>
  );
}

function SkeletonLayer() {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.linear }), -1, false);
  }, [shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [220, -220]) }],
  }));

  const fades = useMemo(() => [0, 60, 120, 180, 240, 300], []);

  return (
    <View>
      <SkeletonBlock style={styles.skeletonTitle} shimmerStyle={shimmerStyle} delay={fades[0]} />
      <SkeletonBlock style={styles.skeletonSub} shimmerStyle={shimmerStyle} delay={fades[1]} />
      <View style={styles.skeletonNodes}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.skeletonNodeWrap}>
            <SkeletonBlock style={styles.skeletonCircle} shimmerStyle={shimmerStyle} delay={fades[i + 2]} />
            <SkeletonBlock style={styles.skeletonNodeLabel} shimmerStyle={shimmerStyle} delay={fades[i + 2]} />
          </View>
        ))}
      </View>
      <SkeletonBlock style={styles.skeletonBatteryLabel} shimmerStyle={shimmerStyle} delay={fades[4]} />
      <SkeletonBlock style={styles.skeletonBar} shimmerStyle={shimmerStyle} delay={fades[5]} />
    </View>
  );
}

function SkeletonBlock({
  style,
  shimmerStyle,
  delay,
}: {
  style: object;
  shimmerStyle: object;
  delay: number;
}) {
  const reveal = useSharedValue(0);
  useEffect(() => {
    reveal.value = withDelay(delay, withTiming(1, { duration: 220 }));
  }, [delay, reveal]);
  const revealStyle = useAnimatedStyle(() => ({ opacity: reveal.value }));
  return (
    <Animated.View style={[styles.skeletonBlock, style, revealStyle]}>
      <Animated.View style={[styles.skeletonShimmer, shimmerStyle]} />
    </Animated.View>
  );
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
    marginHorizontal: spacing.xl,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 24,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 48,
    shadowOffset: { width: 0, height: 24 },
    elevation: 7,
  },
  cardTopInset: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  goldBloom: {
    position: 'absolute',
    width: 220,
    height: 160,
    top: -50,
    right: -70,
    borderRadius: 120,
    backgroundColor: 'rgba(201,155,58,0.1)',
  },
  subtitle: {
    marginTop: 2,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1.26,
    opacity: 0.4,
  },
  nodesShell: {
    marginTop: spacing.lg,
    position: 'relative',
  },
  fadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 24,
    zIndex: 3,
  },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 24,
    zIndex: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100%',
    paddingHorizontal: 20,
  },
  nodeWrap: {
    width: 76,
    alignItems: 'center',
  },
  node: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111625',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  nodeIconGlow: {
    shadowColor: 'rgba(201,155,58,1)',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  nodeCenter: {
    borderColor: 'rgba(201,155,58,0.7)',
    shadowColor: 'rgba(201,155,58,1)',
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 4,
  },
  nodeLabel: {
    marginTop: 6,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
  },
  wire: {
    width: 36,
    height: 8,
    justifyContent: 'center',
  },
  wireLine: {
    height: 1,
    backgroundColor: 'transparent',
  },
  wireDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  storageRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storageLabel: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: fonts.semibold,
    fontSize: fontSize.badge,
    fontWeight: '600',
  },
  storageIconGlow: {
    shadowColor: 'rgba(0,229,160,1)',
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  storageValue: {
    color: colors.solarDot,
    fontFamily: fonts.bold,
    fontSize: fontSize.badge,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  storageTrack: {
    marginTop: spacing.sm,
    height: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  storageFill: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: 'rgba(0,229,160,1)',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  storageGradient: {
    width: '100%',
    height: '100%',
  },
  storageShimmer: {
    position: 'absolute',
    top: 0,
    width: 40,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  skeletonBlock: {
    backgroundColor: '#0F1117',
    borderRadius: radius.badge,
    overflow: 'hidden',
  },
  skeletonShimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
    backgroundColor: '#1A2035',
  },
  skeletonTitle: {
    height: 14,
    width: 170,
    borderRadius: 6,
  },
  skeletonSub: {
    marginTop: 6,
    height: 10,
    width: 160,
    borderRadius: 6,
  },
  skeletonNodes: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skeletonNodeWrap: {
    width: 90,
    alignItems: 'center',
  },
  skeletonCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  skeletonNodeLabel: {
    marginTop: 6,
    width: 80,
    height: 10,
    borderRadius: 5,
  },
  skeletonBatteryLabel: {
    marginTop: spacing.lg,
    height: 12,
    width: 160,
    borderRadius: 6,
  },
  skeletonBar: {
    marginTop: spacing.sm,
    height: 6,
    width: '100%',
    borderRadius: 999,
  },
});
