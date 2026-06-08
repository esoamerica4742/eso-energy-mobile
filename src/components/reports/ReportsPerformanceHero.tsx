import { StyleSheet, Text, View } from 'react-native';
import { CardShell } from '@/components/cards/CardShell';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { ReportsSnapshot } from '@/lib/reportsData';

type Props = {
  snapshot: ReportsSnapshot;
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function ReportsPerformanceHero({ snapshot }: Props) {
  return (
    <CardShell glowColor="mint" borderVariant="gold" style={styles.shell}>
      <Text style={styles.eyebrow}>FLEET PERFORMANCE INDEX</Text>
      <View style={styles.scoreRow}>
        <Text style={styles.score}>{snapshot.performanceIndex.toFixed(1)}</Text>
        <View style={styles.scoreMeta}>
          <Text style={styles.scoreUnit}>/ 100</Text>
          <Text style={styles.scoreHint}>Composite ops score</Text>
        </View>
      </View>
      <View style={styles.grid}>
        <Metric label="Solar mix" value={`${snapshot.solarContributionPct}%`} />
        <View style={styles.divider} />
        <Metric label="Healthy sites" value={`${snapshot.healthyRatioPct}%`} />
        <View style={styles.divider} />
        <Metric label="Exports" value={`${snapshot.exportReadyCount}`} />
      </View>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  eyebrow: {
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 1.2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  score: {
    fontFamily: fonts.bold,
    fontSize: FontSize.hero,
    color: Colors.gold,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  scoreMeta: {
    paddingBottom: 6,
  },
  scoreUnit: {
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  scoreHint: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: FontSize.label,
    color: Colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingTop: Spacing.md,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  metricValue: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  divider: {
    width: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: 4,
  },
});
