import { StyleSheet, Text, View } from 'react-native';
import { CardShell } from '@/components/cards/CardShell';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { ReportsSnapshot } from '@/lib/reportsData';
import { periodLabel } from '@/lib/reportsData';

type Props = {
  snapshot: ReportsSnapshot;
};

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function ReportsKpiStrip({ snapshot }: Props) {
  const loadLabel =
    snapshot.fleetSummary.totalLoadKw >= 1000
      ? `${(snapshot.fleetSummary.totalLoadKw / 1000).toFixed(1)} MW`
      : `${Math.round(snapshot.fleetSummary.totalLoadKw)} kW`;

  return (
    <CardShell glowColor="gold" borderVariant="gold" style={styles.shell}>
      <Text style={styles.period}>{periodLabel(snapshot.period)}</Text>
      <View style={styles.row}>
        <Cell label="Fleet load" value={loadLabel} />
        <View style={styles.divider} />
        <Cell label="Diesel saved" value={snapshot.dieselSavedLabel} />
        <View style={styles.divider} />
        <Cell label="Solar mix" value={`${snapshot.solarContributionPct}%`} />
      </View>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  period: {
    marginBottom: Spacing.sm,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.gold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  label: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: 4,
  },
});
