import { StyleSheet, Text, View } from 'react-native';
import { CardShell } from '@/components/cards/CardShell';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { SettingsSnapshot } from '@/lib/settingsData';

type Props = {
  snapshot: SettingsSnapshot;
};

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function SettingsWorkspaceStrip({ snapshot }: Props) {
  return (
    <CardShell glowColor="mint" borderVariant="gold" style={styles.shell}>
      <Text style={styles.eyebrow}>WORKSPACE OVERVIEW</Text>
      <View style={styles.row}>
        <Cell label="Sites" value={`${snapshot.siteCount}`} />
        <View style={styles.divider} />
        <Cell label="Access" value={snapshot.isAuthenticated ? 'Signed in' : 'Guest'} />
        <View style={styles.divider} />
        <Cell label="Backend" value={snapshot.connectionLabel} />
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
    textAlign: 'center',
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
