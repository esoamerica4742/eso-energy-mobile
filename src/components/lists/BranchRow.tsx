import { useEffect } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Polyline } from 'react-native-svg';
import type { BranchRow as Branch } from '@/lib/aura';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { BatteryBar } from '@/components/atoms/BatteryBar';
import { colors, fontSize, fonts, radius, shadowCard, spacing } from '@/theme/tokens';

type Props = { branch: Branch; index?: number };

export function BranchRow({ branch, index = 0 }: Props) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const elevation = useSharedValue(1);
  const appear = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: interpolate(appear.value, [0, 1], [14, 0]) }],
    shadowOpacity: 0.32 - elevation.value * 0.18,
    opacity: appear.value,
  }));

  useEffect(() => {
    appear.value = withTiming(1, { duration: 340 + index * 60 });
  }, [appear, index]);

  const uptimeColor =
    branch.uptime > 98
      ? colors.solarText
      : branch.uptime > 95
        ? colors.warningText
        : colors.offlineText;

  const sourceAccent = accentForSource(branch.source);
  const sparklineData = sevenDaySparkline(branch.load, branch.battery);

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 20 });
        elevation.value = withSpring(0.2, { damping: 16 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 20 });
        elevation.value = withSpring(1, { damping: 16 });
      }}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/site/${branch.id}`);
      }}
    >
      <Animated.View style={[styles.card, shadowCard, animStyle]}>
        <View style={[styles.accentRail, { backgroundColor: sourceAccent }]} />
        {/* Top row: name + status */}
        <View style={styles.topRow}>
          <View style={styles.nameBlock}>
            <Text style={styles.name}>{branch.name}</Text>
            <Text style={styles.city}>{branch.city}</Text>
          </View>
          <StatusBadge status={branch.source} />
        </View>
        {branch.battery < 65 ? (
          <View style={styles.warnChip}>
            <Text style={styles.warnText}>Battery low</Text>
          </View>
        ) : null}

        {/* Metric strip */}
        <View style={styles.metrics}>
          <MetricPair label="Load" value={`${branch.load} kW`} />
          <View style={styles.metricDivider} />
          <View style={styles.batteryMetric}>
            <Text style={styles.metricLabel}>Battery</Text>
            <BatteryBar percent={branch.battery} />
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.uptimeCell}>
            <Text style={styles.metricLabel}>Uptime</Text>
            <View style={styles.uptimeRow}>
              <UptimeArc progress={branch.uptime} color={uptimeColor} />
              <Text style={[styles.metricValue, { color: uptimeColor }]}>{`${branch.uptime.toFixed(1)}%`}</Text>
            </View>
          </View>
        </View>
        <View style={styles.sparklineWrap}>
          <Text style={styles.sparkLabel}>7D load trend</Text>
          <Sparkline values={sparklineData} />
        </View>

        {/* Chevron hint */}
        <Text style={styles.chevron}>›</Text>
      </Animated.View>
    </Pressable>
  );
}

function MetricPair({ label, value, valueColor = colors.textPrimary }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.metricPair}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function UptimeArc({ progress, color }: { progress: number; color: string }) {
  const p = Math.max(0, Math.min(100, progress));
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const dash = (p / 100) * circumference;
  return (
    <Svg width={24} height={24}>
      <Circle cx={12} cy={12} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={2.5} fill="none" />
      <Circle
        cx={12}
        cy={12}
        r={radius}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${dash} ${circumference}`}
        transform="rotate(-90 12 12)"
      />
    </Svg>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 118;
      const y = 28 - ((v - min) / Math.max(1, max - min)) * 20;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <Svg width={118} height={30}>
      <Polyline points={points} fill="none" stroke={colors.gridText} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function sevenDaySparkline(load: number, battery: number): number[] {
  return Array.from({ length: 7 }, (_, i) => {
    const swing = Math.sin(i * 0.9) * 6;
    const reserve = (battery - 50) * 0.08;
    return Math.max(8, load + swing + reserve);
  });
}

function accentForSource(source: Branch['source']) {
  if (source === 'solar') return colors.solarDot;
  if (source === 'diesel') return colors.dieselDot;
  if (source === 'grid') return colors.gridDot;
  return colors.offlineDot;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    position: 'relative',
  },
  accentRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: radius.card,
    borderBottomLeftRadius: radius.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  nameBlock: { flex: 1, paddingRight: spacing.md },
  name: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.value,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  city: {
    fontFamily: fonts.regular,
    fontSize: fontSize.badge,
    color: colors.textTertiary,
    marginTop: 3,
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uptimeCell: { flex: 1 },
  uptimeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metricPair: { flex: 1 },
  batteryMetric: { flex: 1.6 },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.borderSubtle,
    marginHorizontal: spacing.md,
  },
  warnChip: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,179,71,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,179,71,0.45)',
  },
  warnText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.micro,
    color: colors.warningText,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metricLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.micro,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  metricValue: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  sparklineWrap: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sparkLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.micro,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chevron: {
    position: 'absolute',
    right: spacing.lg,
    top: '50%',
    marginTop: -2,
    fontFamily: fonts.regular,
    fontSize: 18,
    color: colors.textTertiary,
    lineHeight: 22,
  },
});
