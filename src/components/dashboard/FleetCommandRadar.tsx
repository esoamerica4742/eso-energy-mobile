import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

type SiteRow = {
  site: string;
  mix: string;
  diesel: string;
  pi: string;
  level: 'optimal' | 'degraded' | 'watch';
};

const DEFAULT_ROWS: SiteRow[] = [
  {
    site: 'Ikeja Regional HQ',
    mix: 'Solar + Storage',
    diesel: '0.8h today',
    pi: '98.4% OPTIMAL',
    level: 'optimal',
  },
  {
    site: 'Lekki Premium Terminal',
    mix: 'Grid + Diesel',
    diesel: '6.1h today',
    pi: '74.1% DEGRADED',
    level: 'degraded',
  },
  {
    site: 'Abuja Operations Annex',
    mix: 'Solar + Grid',
    diesel: '1.4h today',
    pi: '89.7% STABLE',
    level: 'watch',
  },
];

export function FleetCommandRadar({ reducedMotion = false }: { reducedMotion?: boolean }) {
  return (
    <BlurView intensity={24} tint="dark" style={styles.card}>
      <Text style={styles.title}>Fleet Command Radar</Text>
      <Text style={styles.sub}>Multi-site sovereign command stream</Text>

      <View style={styles.head}>
        <Text style={[styles.headText, styles.siteCol]}>Site</Text>
        <Text style={[styles.headText, styles.mixCol]}>Primary Mix</Text>
        <Text style={[styles.headText, styles.runCol]}>Diesel Runtime</Text>
        <Text style={[styles.headText, styles.piCol]}>PI</Text>
      </View>

      {DEFAULT_ROWS.map((row) => (
        <RadarRow key={row.site} row={row} reducedMotion={reducedMotion} />
      ))}
    </BlurView>
  );
}

function RadarRow({ row, reducedMotion = false }: { row: SiteRow; reducedMotion?: boolean }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (reducedMotion) {
      pulse.value = withTiming(0, { duration: 120 });
      return;
    }
    if (row.level === 'degraded') {
      pulse.value = withRepeat(withTiming(1, { duration: 1100 }), -1, true);
    }
  }, [pulse, row.level, reducedMotion]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: row.level === 'degraded' ? interpolate(pulse.value, [0, 1], [0.68, 1]) : 1,
  }));

  const piStyle =
    row.level === 'optimal'
      ? [styles.piBadge, styles.piOptimal]
      : row.level === 'degraded'
        ? [styles.piBadge, styles.piDegraded]
        : [styles.piBadge, styles.piWatch];

  const piTextStyle =
    row.level === 'optimal'
      ? styles.piOptimalText
      : row.level === 'degraded'
        ? styles.piDegradedText
        : styles.piWatchText;

  return (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.siteCol]} numberOfLines={1}>{row.site}</Text>
      <Text style={[styles.cellMuted, styles.mixCol]} numberOfLines={1}>{row.mix}</Text>
      <Text style={[styles.cellMuted, styles.runCol]} numberOfLines={1}>{row.diesel}</Text>
      <Animated.View style={[piStyle, glowStyle, styles.piCol]}>
        <Text style={[styles.piText, piTextStyle]} numberOfLines={1}>{row.pi}</Text>
      </Animated.View>
    </View>
  );
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
  sub: {
    marginTop: 2,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: fontSize.micro,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  head: {
    marginTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headText: {
    color: colors.textTertiary,
    fontFamily: fonts.medium,
    fontSize: fontSize.micro,
    textTransform: 'uppercase',
    letterSpacing: 0.55,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30,41,59,0.7)',
  },
  cell: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: fontSize.body,
  },
  cellMuted: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: fontSize.badge,
  },
  siteCol: { flex: 1.45 },
  mixCol: { flex: 1.1 },
  runCol: { flex: 0.9 },
  piCol: { flex: 1, alignItems: 'flex-end' },
  piBadge: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  piText: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.micro,
    letterSpacing: 0.2,
  },
  piOptimal: {
    borderColor: 'rgba(16,185,129,0.4)',
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  piOptimalText: { color: '#10b981' },
  piDegraded: {
    borderColor: 'rgba(245,158,11,0.45)',
    backgroundColor: 'rgba(245,158,11,0.1)',
  },
  piDegradedText: { color: '#f59e0b' },
  piWatch: {
    borderColor: 'rgba(6,182,212,0.45)',
    backgroundColor: 'rgba(6,182,212,0.1)',
  },
  piWatchText: { color: '#06b6d4' },
});
