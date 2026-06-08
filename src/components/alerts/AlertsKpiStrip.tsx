import { StyleSheet, Text, View } from 'react-native';
import { CardShell } from '@/components/cards/CardShell';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { AlertsSnapshot } from '@/lib/alertsData';

type Props = {
  snapshot: AlertsSnapshot;
};

function Cell({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={styles.cell}>
      <Text style={[styles.value, accent ? { color: accent } : null]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function AlertsKpiStrip({ snapshot }: Props) {
  return (
    <CardShell glowColor="gold" borderVariant="gold" style={styles.shell}>
      <Text style={styles.eyebrow}>INCIDENT OVERVIEW</Text>
      <View style={styles.row}>
        <Cell
          label="Critical"
          value={`${snapshot.criticalCount}`}
          accent={snapshot.criticalCount > 0 ? Colors.alert : undefined}
        />
        <View style={styles.divider} />
        <Cell label="Warning" value={`${snapshot.warningCount}`} />
        <View style={styles.divider} />
        <Cell label="Info" value={`${snapshot.infoCount}`} />
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
    marginBottom: Spacing.sm,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.gold,
    letterSpacing: 1,
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
  },
  divider: {
    width: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: 4,
  },
});
