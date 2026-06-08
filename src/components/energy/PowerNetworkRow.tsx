import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { fetchLatestPowerLogs } from '@/lib/aura';
import { SkeletonPowerNetwork } from '@/components/atoms/Skeleton';
import { colors, fontSize, fonts, radius, shadowCard, spacing } from '@/theme/tokens';

type Props = { siteCount?: number };

export function PowerNetworkRow({ siteCount }: Props) {
  const q = useQuery({
    queryKey: ['latest-power-logs', 'live'],
    queryFn: fetchLatestPowerLogs,
    staleTime: 30_000,
  });

  const livePulse = useSharedValue(1);

  useEffect(() => {
    livePulse.value = withRepeat(
      withSequence(withTiming(0.4, { duration: 1400 }), withTiming(1, { duration: 1400 })),
      -1,
      true,
    );
  }, [livePulse]);

  const liveDotStyle = useAnimatedStyle(() => ({ opacity: livePulse.value }));

  if (q.isPending || (q.isFetching && (q.data ?? []).length === 0)) {
    return <SkeletonPowerNetwork />;
  }

  const sites = q.data ?? [];

  const totals = sites.reduce(
    (acc, { log }) => {
      if (!log) return acc;
      acc.solar += Number(log.solar_generation_kw ?? 0);
      acc.load  += Number(log.load_consumption_kw ?? 0);
      return acc;
    },
    { solar: 0, load: 0 },
  );

  const count       = siteCount ?? sites.length;
  const solarKw     = totals.solar;
  const loadKw      = totals.load;
  const activeSolar = sites.filter((s) => Number(s.log?.solar_generation_kw ?? 0) > 0).length;
  const efficiency  = loadKw > 0 ? Math.min(100, (solarKw / loadKw) * 100) : 0;

  return (
    <View style={[styles.card, shadowCard]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.eyebrow}>POWER NETWORK</Text>
          <Text style={styles.title}>Live Network</Text>
        </View>
        <View style={styles.liveBadge}>
          <Animated.View style={[styles.liveDot, liveDotStyle]} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Metrics row */}
      <View style={styles.metricsRow}>
        <MetricCell
          label="Solar Input"
          value={`${solarKw.toFixed(1)}`}
          unit="kW"
          sub={activeSolar > 0 ? `${activeSolar} sites active` : 'Night mode'}
          valueColor={colors.solarText}
        />
        <View style={styles.divider} />
        <MetricCell
          label="Efficiency"
          value={`${efficiency.toFixed(0)}`}
          unit="%"
          sub="MPPT active"
          valueColor={colors.gold}
        />
        <View style={styles.divider} />
        <MetricCell
          label="Fleet Load"
          value={`${loadKw.toFixed(1)}`}
          unit="kW"
          sub={`${count} sites`}
          valueColor={colors.textPrimary}
        />
      </View>
    </View>
  );
}

function MetricCell({
  label,
  value,
  unit,
  sub,
  valueColor,
}: {
  label: string;
  value: string;
  unit: string;
  sub: string;
  valueColor: string;
}) {
  return (
    <View style={styles.cell}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={[styles.cellValue, { color: valueColor }]}>
        {value}
        <Text style={styles.cellUnit}> {unit}</Text>
      </Text>
      <Text style={styles.cellSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
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
  headerLeft: {},
  eyebrow: {
    fontFamily: fonts.medium,
    fontSize: fontSize.micro,
    color: colors.textTertiary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.value,
    color: colors.textPrimary,
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.solarBg,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: 100,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.solarDot,
  },
  liveText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.micro,
    color: colors.solarText,
    letterSpacing: 0.6,
  },
  metricsRow: { flexDirection: 'row' },
  divider: { width: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.lg },
  cell: {
    flex: 1,
    padding: spacing.lg,
  },
  cellLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.micro,
    color: colors.textTertiary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  cellValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.title,
    marginTop: 6,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  cellUnit: {
    fontFamily: fonts.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    letterSpacing: 0,
  },
  cellSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.micro,
    color: colors.textTertiary,
    marginTop: 4,
  },
});
