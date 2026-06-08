import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Banknote, Fuel, SunMedium, TrendingUp } from 'lucide-react-native';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

const ICON_STROKE = 1.9;

type Props = {
  greeting: string;
  personName: string;
  sitesStreaming: number;
  netDailySavings: number;
  monthToDateSavings: number;
  dieselAvoidedL: number;
  solarSharePct: number;
};

export function CommandDeckHero({
  greeting,
  personName,
  sitesStreaming,
  netDailySavings,
  monthToDateSavings,
  dieselAvoidedL,
  solarSharePct,
}: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 390;
  const heroFontSize = compact ? 34 : 42;
  const heroLineHeight = compact ? 38 : 46;
  const mainValueSize = compact ? 48 : 58;
  const metricValueSize = compact ? 30 : 40;

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>COMMAND DECK</Text>
      <Text style={[styles.heroText, { fontSize: heroFontSize, lineHeight: heroLineHeight }]}>
        {greeting}, <Text style={styles.heroAccent}>{personName}</Text>.{'\n'}
        <Text style={styles.heroStrong}>{`${sitesStreaming} sites are streaming nominally.`}</Text>
      </Text>

      <View style={styles.healthRow}>
        <View style={styles.healthDot} />
        <Text style={styles.healthText}>All telemetry channels healthy</Text>
      </View>

      <BlurView intensity={30} tint="dark" style={styles.card}>
        <LinearGradient
          colors={['rgba(245,158,11,0.18)', 'rgba(245,158,11,0.04)', 'rgba(245,158,11,0)']}
          start={{ x: 0.8, y: 0 }}
          end={{ x: 0.2, y: 1 }}
          style={styles.glow}
        />

        <Text style={styles.cardLabel}>NET DAILY SAVINGS · SOLAR VS DIESEL</Text>
        <Text style={styles.cardSub}>Aggregate fuel + grid offset across all active sites · 24h rolling</Text>

        <Text style={[styles.mainValue, { fontSize: mainValueSize, lineHeight: mainValueSize + 4 }]}>
          {formatNaira(netDailySavings)}
        </Text>

        <View style={styles.deltaPill}>
          <TrendingUp size={13} color={colors.solarDot} strokeWidth={ICON_STROKE} />
          <Text style={styles.deltaText}>+12.4% VS 7-DAY AVG</Text>
        </View>

        <View style={styles.metricsRow}>
          <MiniMetric
            icon={<Banknote size={12} color={colors.textSecondary} strokeWidth={ICON_STROKE} />}
            label="Month-to-date"
            value={formatNaira(monthToDateSavings)}
            valueColor={colors.textPrimary}
            valueSize={metricValueSize}
          />
          <MiniMetric
            icon={<Fuel size={12} color={colors.textSecondary} strokeWidth={ICON_STROKE} />}
            label="Diesel avoided"
            value={`${Math.round(dieselAvoidedL).toLocaleString()} L`}
            valueColor={colors.dieselText}
            valueSize={metricValueSize}
          />
          <MiniMetric
            icon={<SunMedium size={12} color={colors.textSecondary} strokeWidth={ICON_STROKE} />}
            label="Solar share"
            value={`${Math.round(solarSharePct)}%`}
            valueColor={colors.solarText}
            valueSize={metricValueSize}
          />
        </View>
      </BlurView>
    </View>
  );
}

function MiniMetric({
  icon,
  label,
  value,
  valueColor,
  valueSize,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor: string;
  valueSize?: number;
}) {
  return (
    <View style={styles.metricBox}>
      <View style={styles.metricHeader}>
        {icon}
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
      <Text style={[styles.metricValue, { color: valueColor, fontSize: valueSize ?? 40 }]}>{value}</Text>
    </View>
  );
}

function formatNaira(v: number): string {
  return `₦${Math.round(v).toLocaleString('en-NG')}`;
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  kicker: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: fontSize.micro,
    letterSpacing: 3,
  },
  heroText: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    letterSpacing: -1.2,
  },
  heroAccent: {
    color: colors.gold,
  },
  heroStrong: {
    fontFamily: fonts.semibold,
  },
  healthRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: colors.solarDot,
  },
  healthText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: fontSize.body,
  },
  card: {
    marginTop: spacing.lg,
    borderRadius: radius.cardLg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: 'rgba(11,15,25,0.82)',
    padding: spacing.lg,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    right: -20,
    top: -16,
    width: 170,
    height: 170,
    borderRadius: 130,
  },
  cardLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: fontSize.micro,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  cardSub: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: fontSize.body,
    lineHeight: 20,
    maxWidth: '86%',
  },
  mainValue: {
    marginTop: spacing.lg,
    color: colors.gold,
    fontFamily: fonts.bold,
    letterSpacing: -1.8,
    fontVariant: ['tabular-nums'],
  },
  deltaPill: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.solarBg,
    borderWidth: 1,
    borderColor: colors.solarBorder,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  deltaText: {
    color: colors.solarText,
    fontFamily: fonts.semibold,
    fontSize: fontSize.value,
    letterSpacing: 1.1,
  },
  metricsRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricBox: {
    flex: 1,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgElevated,
    padding: spacing.md,
    minHeight: 86,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: fontSize.micro,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    flex: 1,
  },
  metricValue: {
    marginTop: spacing.sm,
    fontFamily: fonts.semibold,
    letterSpacing: -0.7,
    fontVariant: ['tabular-nums'],
  },
});
