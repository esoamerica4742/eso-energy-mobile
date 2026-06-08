import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { ShieldAlert } from 'lucide-react-native';
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import type { Alert } from '@/stores/alertStore';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

type Props = {
  offsetNaira: number;
  litersPrevented: number;
  incident?: Alert | null;
  reducedMotion?: boolean;
};

const BARS = [24, 16, 22, 14, 18, 12, 9];

export function DieselOffsetMonitor({
  offsetNaira,
  litersPrevented,
  incident,
  reducedMotion = false,
}: Props) {
  const timestamp = incident ? new Date(incident.timestamp).toLocaleTimeString() : '14:32:05';
  const incidentText =
    incident?.message ??
    '12L fuel volume drop anomaly blocked at Lekki Hub while asset was offline. System isolated.';

  return (
    <BlurView intensity={24} tint="dark" style={styles.card}>
      <Text style={styles.title}>Diesel Offset & Theft Monitor</Text>

      <View style={styles.metricBlock}>
        <Text style={styles.metricLabel}>Total Daily Monetary Offset</Text>
        <Text style={styles.metricValue}>{formatNaira(offsetNaira)}</Text>
      </View>

      <View style={styles.metricBlock}>
        <Text style={styles.metricLabel}>Diesel Burden Regression</Text>
        <Text style={styles.metricSub}>{`${litersPrevented.toLocaleString()} Liters Prevented This Week`}</Text>
        <View style={styles.chartRow}>
          {BARS.map((h, i) => (
            <MicroBar key={i} index={i} targetHeight={h} reducedMotion={reducedMotion} />
          ))}
        </View>
      </View>

      <View style={styles.alertBox}>
        <View style={styles.alertTop}>
          <ShieldAlert size={13} color="#ef4444" strokeWidth={2.2} />
          <Text style={styles.alertStatus}>Theft Auditor Status: Vigilant</Text>
        </View>
        <Text style={styles.alertText}>
          {`ALERT: ${timestamp} - ${incidentText}`}
        </Text>
      </View>
    </BlurView>
  );
}

function formatNaira(v: number): string {
  return `₦${Math.round(v).toLocaleString('en-NG')}`;
}

function MicroBar({
  index,
  targetHeight,
  reducedMotion = false,
}: {
  index: number;
  targetHeight: number;
  reducedMotion?: boolean;
}) {
  const progress = useSharedValue(0);
  useEffect(() => {
    if (reducedMotion) {
      progress.value = withTiming(1, { duration: 120 });
      return;
    }
    progress.value = withRepeat(
      withDelay(index * 110, withTiming(1, { duration: 1300 })),
      -1,
      true,
    );
  }, [progress, index, reducedMotion]);

  const style = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [8, targetHeight]),
    opacity: interpolate(progress.value, [0, 1], [0.65, 1]),
  }));

  return <Animated.View style={[styles.bar, style]} />;
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
    marginHorizontal: spacing.xl,
    borderRadius: radius.cardLg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: 'rgba(11,15,25,0.8)',
    padding: spacing.lg,
    overflow: 'hidden',
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: fontSize.value,
  },
  metricBlock: {
    marginTop: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgElevated,
    padding: spacing.md,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: fontSize.micro,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  metricValue: {
    marginTop: 6,
    color: '#10b981',
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    letterSpacing: -0.4,
    fontVariant: ['tabular-nums'],
  },
  metricSub: {
    marginTop: 4,
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: fontSize.body,
  },
  chartRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 28,
  },
  bar: {
    width: 8,
    borderRadius: 999,
    backgroundColor: '#10b981',
  },
  alertBox: {
    marginTop: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.45)',
    backgroundColor: 'rgba(239,68,68,0.08)',
    padding: spacing.md,
  },
  alertTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertStatus: {
    color: '#ef4444',
    fontFamily: fonts.semibold,
    fontSize: fontSize.badge,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  alertText: {
    marginTop: 6,
    color: '#ef4444',
    fontFamily: fonts.medium,
    fontSize: fontSize.badge,
    lineHeight: 17,
  },
});
