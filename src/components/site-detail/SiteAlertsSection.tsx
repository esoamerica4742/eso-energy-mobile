import { StyleSheet, Text, View } from 'react-native';
import { CardShell } from '@/components/cards/CardShell';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { Alert } from '@/stores/alertStore';

type Props = {
  alerts: Alert[];
};

function severityBorder(severity: Alert['severity']) {
  if (severity === 'critical') return Colors.alert;
  if (severity === 'warning') return Colors.gold;
  return Colors.borderSubtle;
}

export function SiteAlertsSection({ alerts }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.section}>ALERTS</Text>
      {alerts.length === 0 ? (
        <CardShell glowColor="mint" borderVariant="gold">
          <Text style={styles.clearTitle}>All clear</Text>
          <Text style={styles.clearCopy}>No active alerts for this site.</Text>
        </CardShell>
      ) : (
        alerts.map((alert) => (
          <View
            key={alert.id}
            style={[styles.alertRow, { borderLeftColor: severityBorder(alert.severity) }]}
          >
            <Text style={styles.alertSeverity}>{alert.severity.toUpperCase()}</Text>
            <Text style={styles.alertMessage}>{alert.message}</Text>
            {alert.detail ? <Text style={styles.alertDetail}>{alert.detail}</Text> : null}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
  },
  section: {
    fontFamily: fonts.semibold,
    fontSize: FontSize.label,
    letterSpacing: 1.2,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  clearTitle: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.mint,
  },
  clearCopy: {
    marginTop: Spacing.sm,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  alertRow: {
    borderLeftWidth: 3,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  alertSeverity: {
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  alertMessage: {
    marginTop: 4,
    fontFamily: fonts.bold,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
  },
  alertDetail: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
});
